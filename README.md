# Magna Via

React Native + Expo mobile app with a Go backend for the Magna Via Arcadia/RIASEC journey.

## Structure

- `src/` - Expo app source.
- `assets/` - runtime fonts and optimized WebP app images.
- `backend/` - Go API service.
- `admin/` - static admin dashboard for Vercel.
- `project/` - local prototype/design archive, ignored by Git.

## App Commands

```bash
npm install
npm run web
npm run start:lan
npm run start:tunnel
```

Expo Go public-store compatibility depends on the SDK version. For remote testing, prefer EAS preview builds/TestFlight over Expo Go.

The app submits completed assessments to:

```txt
EXPO_PUBLIC_API_BASE_URL=https://magna-via-production.up.railway.app
```

Override `EXPO_PUBLIC_API_BASE_URL` at build time if you deploy another backend.

## Backend Commands

```bash
npm run api:dev
npm run api:test
```

By default, `api:dev` uses a local SQLite file at `backend/tmp/magna-via.db` so the API can run without extra setup.

For MySQL local development:

```bash
docker compose up -d mysql
npm run api:dev:mysql
```

Production should set:

```txt
DB_DRIVER=mysql
DATABASE_DSN=user:pass@tcp(host:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local
ADMIN_TOKEN=...
CORS_ORIGINS=https://your-admin.vercel.app
```

## Backend API

- `GET /healthz`
- `GET /api/v1/catalog/classes`
- `POST /api/v1/assessments`
- `GET /api/v1/assessments/{id}`
- `POST /api/v1/chat/messages`
- `GET /api/v1/admin/summary`
- `GET /api/v1/admin/assessments`

Set `ADMIN_TOKEN` to protect admin routes.

## Admin Dashboard

Open `admin/index.html` for local checks, or deploy the `admin/` folder to Vercel as a static site. The dashboard stores API URL and admin token in browser local storage.
