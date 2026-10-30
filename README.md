# School ERP Core MVP

Stack: Next.js (App Router, React) + Postgres (`pg`), bcrypt password hashing, HMAC-signed httpOnly session cookie. No ORM — migrations are plain SQL.

## Setup

```bash
npm install
cp .env.example .env   # edit as needed
npm run migrate
npm run seed
npm run dev            # or: npm run build && npm start
```

Open http://localhost:3000 in your browser — it redirects to the login/dashboard.

## Env vars

| Var | Default | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql:///school_erp?host=/var/run/postgresql` | Postgres connection string, e.g. `postgres://postgres:postgres@localhost:5432/school_erp` |
| `SESSION_SECRET` | `dev-secret-change-me` | Set a long random value in production |

Create the database first, e.g. `createdb school_erp` or `psql -c "CREATE DATABASE school_erp"`.

## Commands

- `npm run migrate` — applies [db/migrate.sql](db/migrate.sql) (idempotent `IF NOT EXISTS`)
- `npm run seed` — idempotent upserts; re-running does not duplicate users/students/teachers/classes/enrollments
- `npm run dev` / `npm start` — run the app on port 3000
- `npm test` — unit tests

## Seeded demo credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@school.test | Admin123! |
| Teacher | teacher@school.test | Teacher123! |
| Student | student@school.test | Student123! |

Passwords are stored only as bcrypt hashes in `users.password_hash`.

## Roles

- Admin: full CRUD on students, teachers, classes.
- Teacher: views own classes/students, marks attendance, enters grades (own classes only).
- Student: views only own profile, attendance, grades; other students' records return 403.
- Unauthenticated API access returns 401; protected pages redirect to `/login`.
