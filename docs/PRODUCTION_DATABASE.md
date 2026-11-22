# Production database setup

The backend uses SQLAlchemy with the async PostgreSQL driver (`asyncpg`) and Alembic migrations. Local development may use SQLite; production must use a managed PostgreSQL database.

## Current application schema

Alembic's current head (`8f6a2d3c1b40`) creates these tables on a fresh database:

- `users` and `caregiver_sessions` for caregiver accounts and revocable sessions
- `patients` for caregiver-linked patient profiles and patient access tokens
- `medications` and `schedules` for medication plans
- `dose_logs` for scheduled, taken, skipped, and missed dose records

The current application schema is the six tables above. The larger PostgreSQL design described in `DATABASE_DESIGN.md` is a roadmap/design document; it is not all implemented in the live models or migrations yet.

## Provision the hosted database

1. Create a managed PostgreSQL project in the selected provider (Neon is the planned provider). Select a region close to the backend service and enable the provider's TLS connection option.
2. Create a dedicated application role/database. Use the pooled connection string for the running web service if the provider recommends pooling; retain an owner/migration role only for administrative changes.
3. Copy the connection string into the backend host's secret environment settings as `DATABASE_URL`. It must be a PostgreSQL URL, for example:

   ```text
   postgresql+asyncpg://APP_ROLE:URL_ENCODED_PASSWORD@DB_HOST/DB_NAME?ssl=require
   ```

   The app also normalizes provider strings beginning with `postgres://` or `postgresql://` to the `asyncpg` SQLAlchemy dialect. Do not commit real credentials or put the database URL in frontend variables.
4. Configure `ENVIRONMENT=production` and a unique, randomly generated `SESSION_SECRET` of at least 32 characters in the backend host. Keep the database provider's backups/PITR enabled where available.
5. Deploy the backend. `backend/Dockerfile` applies `alembic upgrade head` before starting Uvicorn. Check `/health`; it must report `status: healthy` and `database: connected`.
6. In the provider console, confirm the six tables and Alembic version `8f6a2d3c1b40` exist. Create a caregiver account through the application; do not seed real patient or medication information into a public demo.
7. Record how to restore a backup and periodically verify the provider can restore one to a separate database. Never test restoration against the live production database.

## Before putting real data in production

- Restrict database network access to the backend where provider networking permits it; require TLS for external connections.
- Store only the minimum patient information needed. Patient access tokens are bearer credentials: anyone holding a link can access that patient's schedule, so links must be kept private and should be revocable by rotating the token.
- Use a dedicated non-owner runtime role where the hosting/migration arrangement supports separate roles. Migrations need schema privileges; normal API requests should not need broad database administration privileges.
- Keep database URLs and credentials in provider secret settings, rotate exposed credentials, and do not paste them into issue trackers or logs.
- Monitor connection limits, storage, backup status, and failed health checks.

## Local versus production

Local `.env` stays on SQLite by default. Production startup now rejects SQLite when `ENVIRONMENT=production`, so a missing or incorrectly configured production secret fails early rather than creating a disposable SQLite database on the server.
