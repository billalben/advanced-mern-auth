# server

Express 5 API for the `advanced-mern-auth` project: Mongoose 8 models, zod
validation, tsup build (ESM, Node 22 target), pino logging, and Resend for
transactional email.

The server exposes a single auth feature module (`/api/auth/*`). It is the only
process the client talks to.

## Prerequisites

- Node.js `>=20`.
- A reachable MongoDB instance (default URI `mongodb://127.0.0.1:27017`,
  database `authDB` — chosen by `mongoose.connect`).
- A Resend account + API key + a verified sender address.

## Setup

```bash
# from the repo root
pnpm install

# in this directory
cp .env.example .env       # then fill in the values described below
pnpm dev                   # tsx watch src/server.ts on PORT (default 5011)
```

Other scripts (run from this directory or with `pnpm --filter server <script>`):

| Script | What it does |
| --- | --- |
| `pnpm dev` | `tsx watch src/server.ts` |
| `pnpm build` | `tsup` → `dist/` |
| `pnpm start` | `NODE_ENV=production node dist/server.js` |
| `pnpm typecheck` | `tsc --noEmit` |

## Environment variables

Loaded by `dotenv` from `apps/server/.env` and validated by a zod schema in
`src/config/env.ts`. The server prints a pretty error and `process.exit(1)` on
any failure — there are no defaults for the security-sensitive keys.

| Var | Required | Default | Notes |
| --- | --- | --- | --- |
| `NODE_ENV` | no | `development` | `development` / `production` / `test` |
| `PORT` | no | `5011` | Must match the client dev URL (see `apps/client/src/lib/api/client.ts`). |
| `MONGODB_URI` | yes | — | e.g. `mongodb://127.0.0.1:27017` |
| `JWT_SECRET` | yes | — | At least 16 characters. |
| `CLIENT_URL` | yes | — | Used by CORS and to build password-reset links. |
| `EMAIL_PROVIDER` | no | `resend` | zod-restricted enum; currently only `resend`. |
| `RESEND_API_KEY` | yes | — | Required while `EMAIL_PROVIDER=resend`. |
| `EMAIL_FROM_EMAIL` | yes | — | Must be a verified Resend sender. |
| `EMAIL_FROM_NAME` | yes | — | Display name on outgoing mail. |

## Architecture

```
src/
├── server.ts                # entry: connect Mongo, create HTTP server, graceful shutdown
├── app.ts                   # Express app + middleware order + /api mount
├── config/
│   ├── env.ts               # zod-validated env
│   ├── database.ts          # connectDB / disconnectDB (dbName "authDB")
│   └── logger.ts            # pino (pretty in dev, JSON in prod)
├── modules/auth/
│   ├── auth.routes.ts       # public route table
│   ├── auth.controllers.ts  # thin HTTP layer; reads req.validated only
│   ├── auth.services.ts     # business logic + token/cookie helpers + emails
│   ├── auth.schemas.ts      # zod request schemas
│   ├── auth.types.ts        # PublicUser
│   ├── models/user.model.ts # Mongoose User schema
│   └── email/               # provider abstraction (Resend today)
└── shared/
    ├── errors/AppError.ts   # typed errors consumed by the global errorHandler
    ├── http/response.ts     # ok / created / fail
    └── middlewares/         # helmet, cors, mongoSanitize, rateLimiter, parsers, validate, requireAuth
```

### Middleware order

As wired in `app.ts`: `helmet` → `cors (CLIENT_URL, credentials: true)` →
`mongoSanitize` → JSON parser → cookie parser → `httpLogger` → `apiLimiter`
on `/api` → `authRouter` → `notFoundHandler` → `errorHandler`.

### Validation

Routes use the `validateAll(schema)` middleware, which validates
`body + params + query` against a single zod schema. Controllers read parsed
data via `getValidated<T>(req)` — they never touch `req.body` / `req.params`
directly. `resetPassword` is the only route that needs both `params` and
`body`; its schema reflects that.

### Auth flows

Implemented in `auth.services.ts`:

- **Signup** → bcrypt hash → create user with a 6-digit `verificationToken` (1h TTL) → fire-and-forget verification email.
- **Verify email** → look up by code → mark `isVerified`, clear the token → fire-and-forget welcome email.
- **Login** → bcrypt compare → sign JWT (`expiresIn: 1d`) → set `token` httpOnly cookie → update `lastLogin`.
- **Logout** → `clearCookie("token")`.
- **Forgot password** → generate single-use `resetPasswordToken` (30min TTL) → fire-and-forget reset email containing `${CLIENT_URL}/reset-password/:token`.
- **Reset password** → look up by token → bcrypt hash new password → clear token → fire-and-forget success email.
- **checkAuth** (`requireAuth`-guarded) → return the current `PublicUser`.

The User schema is in `modules/auth/models/user.model.ts`. Public user shape
is normalized via `toPublicUser` in `auth.services.ts` — never return the
mongoose document directly.

### JWT / cookies

- JWT is signed with `JWT_SECRET` and the payload `{ userId }`.
- Delivered as the `token` httpOnly cookie, `sameSite: "strict"`, `secure` only when `NODE_ENV === "production"`, 1-day max age.
- `requireAuth` reads `req.cookies.token` only — there is no `Authorization` header support.

### Email

Provider-abstracted in `modules/auth/email/`. `provider.ts` switches on
`env.EMAIL_PROVIDER`. To add another provider, implement `EmailProvider` in
that folder and extend the `EMAIL_PROVIDER` zod enum in `config/env.ts` plus
the switch in `provider.ts`.

All sends are fire-and-forget (`void sendXxxEmail(...).catch(logger.error)`).
Failures are logged, never thrown — request paths do not depend on email
delivery succeeding.

### Security

- `helmet` for default security headers.
- CORS pinned to `CLIENT_URL` with `credentials: true` (required for the cookie).
- `mongo-sanitize` strips `$`-prefixed keys from `req.body` / `req.params` / `req.query`.
- `apiLimiter` (`express-rate-limit`): 100 requests / 15 minutes on `/api`.
- JWT in an httpOnly cookie only.

## Where to look

- Routes → [`src/modules/auth/auth.routes.ts`](./src/modules/auth/auth.routes.ts)
- Controllers → [`src/modules/auth/auth.controllers.ts`](./src/modules/auth/auth.controllers.ts)
- Services → [`src/modules/auth/auth.services.ts`](./src/modules/auth/auth.services.ts)
- Schemas → [`src/modules/auth/auth.schemas.ts`](./src/modules/auth/auth.schemas.ts)
- User model → [`src/modules/auth/models/user.model.ts`](./src/modules/auth/models/user.model.ts)
- Email provider → [`src/modules/auth/email/provider.ts`](./src/modules/auth/email/provider.ts)
