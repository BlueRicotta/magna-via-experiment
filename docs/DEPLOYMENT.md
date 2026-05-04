# Deployment

## Frontend App

Local Expo Web:

```bash
npm install
npm run web
```

The app reads:

```txt
EXPO_PUBLIC_API_BASE_URL=https://magna-via-production.up.railway.app
```

This value is intentionally public because it is bundled into the mobile app. Do not put private secrets in `EXPO_PUBLIC_*` variables.

## EAS Preview Build

Install and sign in:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Android preview APK:

```bash
eas build --platform android --profile preview
```

iOS preview builds need an Apple Developer account and registered test devices for ad hoc distribution:

```bash
eas device:create
eas build --platform ios --profile preview
```

For Play Console internal testing, use the production profile to create an AAB:

```bash
eas build --platform android --profile production
```

Then upload the `.aab` to Google Play Console internal testing.

## Backend API

Local SQLite:

```bash
npm run api:dev
```

Local MySQL:

```bash
docker compose up -d mysql
npm run api:dev:mysql
```

Railway production environment:

```txt
GO_VERSION=1.26.2
DB_DRIVER=mysql
DATABASE_DSN=user:pass@tcp(host:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local
ADMIN_TOKEN=change-this-token
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=change-this-long-random-secret
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-5-nano
CHAT_ENABLED=true
CHAT_REPLY_LIMIT=5
CORS_ORIGINS=https://magna-via-admin.vercel.app,http://localhost:8090,http://127.0.0.1:8090,http://localhost:8081,http://127.0.0.1:8081,http://localhost:8082,http://127.0.0.1:8082
```

## Admin Dashboard

Deploy the `admin/` directory to Vercel. After deployment, log in with `ADMIN_USERNAME` and `ADMIN_PASSWORD`, then set the API base URL to:

```txt
https://magna-via-production.up.railway.app
```

The dashboard is static; admin data is protected by the backend login/session.
