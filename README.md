# Magna Via

React Native + Expo mobile app with a Go backend for the Magna Via Arcadia/RIASEC journey.

## Structure

- `src/` - Expo app source.
- `assets/` - runtime fonts and optimized WebP app images.
- `backend/` - Go API service.
- `project/` - local prototype/design archive, ignored by Git.

## App Commands

```bash
npm install
npm run web
npm run start:lan
npm run start:tunnel
```

Expo Go public-store compatibility depends on the SDK version. For remote testing, prefer EAS preview builds/TestFlight over Expo Go.

## Backend Commands

```bash
npm run api:dev
npm run api:test
```

The backend currently stores assessments in memory. Data survives while the Go process is running, but disappears after restart. A database layer is the next production step.

## Backend API

- `GET /healthz`
- `GET /api/v1/catalog/classes`
- `POST /api/v1/assessments`
- `GET /api/v1/assessments/{id}`
- `POST /api/v1/chat/messages`
- `GET /api/v1/admin/summary`

Set `ADMIN_TOKEN` to protect admin routes.
