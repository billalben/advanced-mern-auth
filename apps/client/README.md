# client

React 19 SPA for the `advanced-mern-auth` project: Vite 8 + TypeScript 6
(prerelease, pinned in `package.json`) + Tailwind 4 + TanStack Query +
react-router-dom v7 + axios + framer-motion.

The client is the auth UI only — it talks to the server in `apps/server`
exclusively over `/api/auth/*`.

## Setup

```bash
# from the repo root
pnpm install

# in this directory
pnpm dev       # vite, http://localhost:5173
pnpm build     # tsc -b && vite build
pnpm lint      # oxlint
```

| Script | What it does |
| --- | --- |
| `pnpm dev` | Vite dev server |
| `pnpm build` | `tsc -b && vite build` (project-references build, then bundle) |
| `pnpm lint` | oxlint (React + TypeScript + oxc plugins) |
| `pnpm preview` | Vite preview of the production build |

There are no tests in this app.

## API wiring

The axios instance lives in [`src/lib/api/client.ts`](./src/lib/api/client.ts).
The base URL is hardcoded by build mode:

- **dev** — `http://localhost:5011/api/auth`
- **prod** — `/api/auth`

The port (`5011`) must match `PORT` in `apps/server/.env`. The CORS layer on
the server is pinned to `CLIENT_URL` with `credentials: true`, which is
required because the auth cookie is `httpOnly` and `sameSite: "strict"` — the
axios client sets `withCredentials: true` to make that work.

> **Production:** the repo does not include a reverse proxy. If you deploy,
> you must serve `/api/auth/*` from the server (or change the base URL).

`authApi` (in `src/lib/api/auth.api.ts`) is the typed wrapper around each
endpoint and is the only thing components should import. It also exports
`toApiError` / `extractErrorMessage` for normalizing axios failures.

## Auth state

Single source of truth: [`useCheckAuthQuery`](./src/features/auth/queries.ts).

- React Query key: `queryKeys.auth.me` (i.e. `["auth", "me"]`).
- `staleTime: 5 * 60 * 1000`.
- On 401, `authApi.checkAuth` resolves to `null` instead of throwing.

[`useAuth`](./src/features/auth/useAuth.ts) derives:

- `user: User | null`
- `isAuthenticated = !!user`
- `isVerified = user?.isVerified ?? false`
- `isLoading` (passes through the query's loading state)

Mutations in [`src/features/auth/mutations.ts`](./src/features/auth/mutations.ts)
write into the same cache:

- `useLoginMutation` / `useVerifyEmailMutation` → `setQueryData(["auth","me"], user)`
- `useLogoutMutation` → `setQueryData(["auth","me"], null)`
- `useSignupMutation` → `invalidateQueries(["auth"])`

React Query Devtools mount only when `import.meta.env.DEV` (see
[`src/providers/QueryProvider.tsx`](./src/providers/QueryProvider.tsx)).

## Routing & guards

All in [`src/App.tsx`](./src/App.tsx). Pages are `lazy()`-loaded and rendered
inside a top-level `Suspense`.

- **`ProtectedRoute`** — redirects to `/login` if not authenticated, or
  `/verify-email` if authenticated but not verified.
- **`RedirectAuthenticatedUser`** — bounces authenticated + verified users
  away from auth pages (e.g. trying to visit `/login` while signed in lands you
  on `/`).
- **`AuthGate`** — shows a spinner while `useAuth().isLoading` is true so that
  initial route decisions wait for the `checkAuth` query to resolve.

Public surface:

```
/                      -> DashboardPage   (protected)
/login                 -> LoginPage
/register              -> RegisterPage
/verify-email          -> EmailVerificationPage
/forgot-password       -> ForgotPasswordPage
/reset-password/:token -> ResetPasswordPage
```

## Folder layout

```
src/
├── main.tsx              # entry; wraps App in QueryProvider + BrowserRouter
├── App.tsx               # routes + guards
├── providers/            # QueryProvider
├── pages/                # route entry components (lazy-loaded)
├── components/           # shared presentational (Input, FloatingShapes, PasswordStrengthMeter)
├── features/auth/
│   ├── auth.types.ts     # User, SignupInput, LoginInput, etc.
│   ├── queries.ts        # useCheckAuthQuery
│   ├── mutations.ts      # useLoginMutation, useSignupMutation, ...
│   └── useAuth.ts        # derived state
├── lib/
│   ├── api/              # axios instance + typed authApi
│   └── query/            # shared queryClient + queryKeys
└── utils/                # date formatting
```

## TypeScript notes

`tsconfig.app.json` enables `verbatimModuleSyntax` and `erasableSyntaxOnly`:

- Use `import type { ... }` for type-only imports — always.
- No `enum`, no namespaces, no `const enum`. Use string literal unions or
  `as const` objects instead.
- `noUnusedLocals` and `noUnusedParameters` are on.

The pinned TypeScript version (`~6.0.2`) is a prerelease. Your editor should
match the workspace version — don't downgrade.

## Where to look

- Routes / guards → [`src/App.tsx`](./src/App.tsx)
- Auth hooks → [`src/features/auth/`](./src/features/auth)
- API calls → [`src/lib/api/auth.api.ts`](./src/lib/api/auth.api.ts)
- Axios base URL → [`src/lib/api/client.ts`](./src/lib/api/client.ts)
- Query keys → [`src/lib/query/keys.ts`](./src/lib/query/keys.ts)
