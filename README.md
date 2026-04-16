# Smart Task & Study Planner

Single-user academic planner: tasks, study sessions, notes, weekly planner, analytics, and deadline risk (built in phases).

## Stack

- **Client:** React (Vite), React Router, Axios
- **Server:** Node.js, Express, better-sqlite3, express-validator
- **Database:** SQLite (`database/schema.sql`)

## Requirements

- Node.js 18+ and npm 9+

## Setup

From the repo root:

```bash
npm install
cp .env.example .env
npm run db:init
```

`npm run db:init` creates `database/app.sqlite` (or the path in `DATABASE_PATH`) and applies the schema.

## Run (Client + Server API)

```bash
npm run dev
```

- Client: http://localhost:5173 (Vite proxies `/api` to the server)
- API: http://127.0.0.1:3001 (see `PORT` in `.env`)

Use `VITE_API_URL` in `.env` only if you need a full URL instead of the dev proxy (e.g. production build against a remote API).

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | API + Vite dev servers together, the full-fun package! :D   |
| `npm run db:init` | Create/refresh SQLite from `schema.sql`. *Only used one-time to create the SQL file needed!* |

## Env Variables (Required!)

See [.env.example](.env.example).

## Phase Progress Checklist

- [x] Phase 1: React shell + basic visuals
- [x] Phase 2: Tasks API + SQLite + client task integration
- [x] Phase 3: Study sessions API + weekly planner integration
- [x] Phase 4: Notes API + notes page integration
- [x] Phase 5: Analytics + risk detection
- [ ] Phase 6: Full tests + final deployment/docs pass

## License

See [LICENSE](LICENSE).