# Smart Task & Study Planner

Academic planner with login: tasks, study sessions, notes, weekly planner, analytics, and deadline risk (built in phases).

## Stack

- **Client:** React (Vite), React Router, Axios
- **Server:** Node.js, Express, better-sqlite3, express-session, bcryptjs, express-validator
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

Use `VITE_API_URL` in `.env` only if you need a full URL instead of the dev proxy. *This is only intended in production and for the sake of this demo, is left blank on purpose.*

Change `SESSION_SECRET` in `.env` to a secret phase/token as this is used for login/session encryption!

## Run with Docker (My preferred method!)

From the repo root:

```bash
docker compose up --build
```

Then open:

- Client: http://localhost:5173
- API: http://localhost:3001

Notes:

- SQLite data is persisted in the Docker volume `db-data`.
- If you want a fresh database, run `docker compose down -v` and start again.
- `SESSION_SECRET` is read from the .env file if set; otherwise it uses a local fallback value.

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | API + Vite dev servers together, the full-fun package! :D   |
| `npm run db:init` | Create/refresh SQLite from `schema.sql`. *Only used one-time to create the SQL file needed!* |

## Env Variables (Required!)

See [.env.example](.env.example).

## License

See [LICENSE](LICENSE).