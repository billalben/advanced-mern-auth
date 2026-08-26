# advanced-mern-auth

Full-stack authentication app: signup, email verification, login, forgot/reset password — React 19 + Vite client, Express 5 + MongoDB server.

[![pnpm](https://img.shields.io/badge/pnpm-9.15.0-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

## About

A small, opinionated MERN authentication reference app. Two workspaces under
[`apps/`](./apps):

- **`apps/client`** — React 19 + Vite 8 + TypeScript 6 (prerelease, pinned) + Tailwind 4 + TanStack Query + react-router-dom v7 + axios + framer-motion.
- **`apps/server`** — Express 5 + Mongoose 8 + zod validation + tsup (ESM, Node 22) + pino logging + Resend for transactional email.

Both apps are runnable independently but are designed to work together — the
client talks to the server exclusively over `/api/auth/*`.

## Features

- Signup with email + password (zod-validated; password must contain a letter, digit, and special character).
- 6-digit email verification code (1-hour TTL), delivered via Resend.
- Welcome email after successful verification.
- Login with bcrypt-hashed credentials.
- Forgot-password flow with a single-use reset token (30-minute TTL).
- Reset-password confirmation email.
- Persistent session via httpOnly JWT cookie (`sameSite: "strict"`, `secure` in production only).
- Logout.
- `checkAuth` endpoint + React Query cache as the single source of truth on the client.
- Server hardening: Helmet, CORS pinned to `CLIENT_URL` with credentials, mongo-sanitize, JSON parsing, cookie parsing, request logging, and rate limiting (100 req / 15 min on `/api`).

## Architecture

```
apps/
├── client/   React 19 + Vite 8 + TS 6 + Tailwind 4 + TanStack Query
└── server/   Express 5 + Mongoose 8 + zod + tsup + Resend (email)
```

The server is the only API surface — the client is a pure SPA. See each app's
README for details.

## Prerequisites

- **Node.js** `>=20` (pinned via `engines` in the root `package.json`).
- **pnpm** `9.15.0` — install with `npm i -g pnpm@9.15.0` or `corepack enable && corepack prepare pnpm@9.15.0 --activate`.
- **MongoDB** reachable at the URI you put in `apps/server/.env` (default `mongodb://127.0.0.1:27017`). The server connects with `dbName: "authDB"`. No `docker-compose` is shipped — run your own `mongod`.
- **Resend** account + API key + a verified sender (set `RESEND_API_KEY`, `EMAIL_FROM_EMAIL`, `EMAIL_FROM_NAME`).

## Quickstart

```bash
git clone <repo-url> advanced-mern-auth
cd advanced-mern-auth

pnpm install

cp apps/server/.env.example apps/server/.env
# then edit apps/server/.env and fill in MONGODB_URI, JWT_SECRET, RESEND_API_KEY,
# EMAIL_FROM_EMAIL, EMAIL_FROM_NAME, and CLIENT_URL

pnpm dev:server    # http://localhost:5011  (terminal 1)
pnpm dev:client    # http://localhost:5173  (terminal 2)
```

Open `http://localhost:5173` and sign up. The verification code will be sent
through Resend to the address you configured.

## Available scripts

Run from the repo root:

| Script                      | What it does                                         |
| --------------------------- | ---------------------------------------------------- |
| `pnpm dev:server`           | `tsx watch src/server.ts` (default port 5011)        |
| `pnpm build:server`         | `tsup` → `apps/server/dist`                          |
| `pnpm start:server`         | Run the compiled server with `NODE_ENV=production`   |
| `pnpm typecheck:server`     | `tsc --noEmit` for the server                        |
| `pnpm dev:client`           | Vite dev server (http://localhost:5173)              |
| `pnpm build:client`         | `tsc -b && vite build`                               |
| `pnpm --filter client lint` | oxlint on the client (the server has no lint script) |

There are no root-level `test`, `lint`, or `format` scripts — each app owns its
own tooling.

## License

[MIT](./LICENSE)
