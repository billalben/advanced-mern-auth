# AGENTS.md

Compact guide for agents working in this repo. Keep edits minimal and high-signal.

## Layout

pnpm workspace. Two apps under `apps/`, nothing else.

- `apps/client` — React 19 + Vite 8 + TS 6 (prerelease) + Tailwind 4 + TanStack Query + react-router-dom v7 + axios. Lint via oxlint.
- `apps/server` — Express 5 + Mongoose 8 + tsup (ESM, node22) + zod + pino + Resend. Dev via `tsx watch`.

No tests, no formatter, no CI, no pre-commit, no root `lint`/`test`/`format` scripts. Don't waste time looking for them.

## Commands (run from repo root)

```bash
# server
pnpm dev:server          # tsx watch src/server.ts (port 5011 by default)
pnpm build:server        # tsup -> apps/server/dist
pnpm start:server        # NODE_ENV=production node dist/server.js
pnpm typecheck:server    # tsc --noEmit (the only typecheck script)

# client
pnpm dev:client          # vite (http://localhost:5173)
pnpm build:client        # tsc -b && vite build

# lint (client only — server has no lint)
pnpm --filter client lint
```

Package manager: `pnpm@9.15.0` (pinned via `packageManager`). Node `>=20`. Don't use npm/yarn — `.npmrc` sets pnpm-only behavior (`auto-install-peers`, public-hoist for `@types/react*`).

## Server runtime requirements

- `apps/server/.env` is required; see `apps/server/.env.example`. `src/config/env.ts` validates with zod and `process.exit(1)` on any failure. No defaults for the security-sensitive keys.
- Required: `MONGODB_URI`, `JWT_SECRET` (min 16 chars), `CLIENT_URL`, `RESEND_API_KEY`, `EMAIL_FROM_EMAIL`, `EMAIL_FROM_NAME`. `EMAIL_PROVIDER` is zod-restricted to `"resend"`.
- MongoDB must be reachable at the URI. Mongoose connects with `dbName: "authDB"`. No docker-compose or local-db script is provided — start your own mongod.
- Email is sent fire-and-forget (`void sendXxxEmail(...).catch(logger.error)` in `auth.services.ts`). Failures are logged, not thrown. Don't `await` them in tests.
- JWT is delivered via the `token` httpOnly cookie (`sameSite: "strict"`, `secure` only in production). `requireAuth` reads `req.cookies.token`, not the `Authorization` header.

## Client runtime wiring

- API base URL is hardcoded in `apps/client/src/lib/api/client.ts`: dev → `http://localhost:5011/api/auth`, prod → `/api/auth`. The port (5011) must match `PORT` in the server env.
- There is no reverse proxy in the repo. In production, you must serve `/api/auth/*` from the server (or change this file).
- All auth state goes through React Query: `useCheckAuthQuery` (key `["auth","me"]`, 5 min staleTime) is the single source of truth. `useAuth` in `features/auth/useAuth.ts` derives `isAuthenticated`/`isVerified` from it. Mutations in `features/auth/mutations.ts` write into that cache.
- Route guard logic lives in `App.tsx`: `ProtectedRoute` requires `isAuthenticated && isVerified`; `RedirectAuthenticatedUser` bounces verified users away from auth pages; `AuthGate` shows a spinner while `useAuth().isLoading`.

## Conventions that bite

- Client `tsconfig.app.json` has `verbatimModuleSyntax: true` + `erasableSyntaxOnly: true` → use `import type { ... }` for type-only imports, no `enum`, no namespaces, no `const enum`. The client `tsc -b` is part of `pnpm build:client`.
- Client TS version is `~6.0.2` (prerelease). If an agent's editor flags a missing TS, don't downgrade — install the pinned version.
- Server `tsconfig.json` has `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` on. Use `?? undefined` carefully and handle array index access as `T | undefined`.
- Server uses ESM (`"type": "module"`); `tsup` keeps `.js` extensions on output. Don't add CommonJS `require()`s.
- Validation pattern on the server: routes use `validateAll(schema)` (validates `body`+`params`+`query` together) and `getValidated<T>(req)` in controllers. `resetPassword` is the only route that needs both `params` and `body` — its schema reflects that.
- Response shape: `{ success: true|false, message?, data? }` via `shared/http/response.ts`. Errors go through `AppError` (`shared/errors/AppError.ts`) and the global `errorHandler`.
- Email is provider-abstracted in `modules/auth/email/`. Add new providers by extending `EmailProvider` and switching on `env.EMAIL_PROVIDER` in `provider.ts`. The zod enum currently only allows `resend` — extend it too.
- Mongoose `User` model lives in `modules/auth/models/user.model.ts`. Public user shape is normalized via `toPublicUser` in `auth.services.ts` — use that, don't return the mongoose doc directly.
- Routes are mounted at `/api` in `src/app.ts`. The auth router adds `/auth`, so the public surface is `/api/auth/{signup,login,logout,verify-email,forgot-password,reset-password/:token,check-auth}`.
- Both apps have their own `.env`/`.env.example`. `apps/server/.env` is gitignored; `apps/client/.env` is currently empty and unused.

## Common pitfalls

- Don't add a root `test`/`lint`/`format` script — keep per-app. If you add tooling, mirror the existing per-package structure.
- Don't `await` email sends in service code; preserve the fire-and-forget pattern.
- Don't read JWT from headers; the cookie is the only auth channel here.
- When adding a server route, follow the `routes → controllers → services` split, with zod schemas in `*.schemas.ts` and a `validate*` middleware in front. Don't read `req.body`/`req.params` directly in controllers.
- When adding a client API call, add it to `lib/api/auth.api.ts` (or a new sibling), then a hook in `features/auth/{queries,mutations}.ts`, then a typed shape in `features/auth/auth.types.ts`. Don't call `api` directly from components.
