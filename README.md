# Magna Via

React Native + Expo mobile app with a Go backend for the Magna Via Arcadia/RIASEC journey.

## Structure

- `src/` - Expo app source.
- `assets/` - runtime fonts and optimized WebP app images.
- `backend/` - Go API service.
- `admin/` - static admin dashboard for Vercel.
- `docs/` - deployment and repository notes.
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

## EAS Builds

This repo includes `eas.json` with:

- `preview` - internal distribution, Android APK, production-like app behavior.
- `production` - store-ready build profile, Android AAB.

First-time setup:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Build Android preview:

```bash
eas build --platform android --profile preview
```

For iOS internal testing, you also need an Apple Developer account and registered test devices:

```bash
eas device:create
eas build --platform ios --profile preview
```

More detailed deployment notes are in `docs/DEPLOYMENT.md`.

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
ADMIN_USERNAME=admin
ADMIN_PASSWORD=...
ADMIN_SESSION_SECRET=...
CORS_ORIGINS=https://your-admin.vercel.app,http://localhost:8090,http://127.0.0.1:8090,http://localhost:8081,http://127.0.0.1:8081,http://localhost:8082,http://127.0.0.1:8082
```

Expo Web submits from the browser origin that serves the dev app. Add the active Expo origin to `CORS_ORIGINS`, then redeploy the API. Expo Go/native builds are not blocked by browser CORS, but they still need the same deployed `EXPO_PUBLIC_API_BASE_URL`.

Admin routes accept either the legacy `X-Admin-Token` header or a signed session from `POST /api/v1/admin/login`. Set a strong `ADMIN_PASSWORD` and a long random `ADMIN_SESSION_SECRET` in production.

## Backend API

- `GET /healthz`
- `GET /api/v1/catalog/classes`
- `POST /api/v1/assessments`
- `GET /api/v1/assessments/{id}`
- `POST /api/v1/chat/messages`
- `POST /api/v1/admin/login`
- `GET /api/v1/admin/summary`
- `GET /api/v1/admin/assessments`

Set `ADMIN_TOKEN` or `ADMIN_PASSWORD` to protect admin routes.

## Scoring

Final RIASEC scores are calculated from quiz answers plus light personalization bonuses from Hobby Cards and Birth Star. See `docs/SCORING.md`.

## Admin Dashboard

Open `admin/index.html` for local checks, or deploy the `admin/` folder to Vercel as a static site. The dashboard stores the API URL and a short-lived admin session in browser local storage.
