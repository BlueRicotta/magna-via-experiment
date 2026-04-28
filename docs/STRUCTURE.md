# Project Structure

```txt
.
├── admin/              Static admin dashboard for Vercel
├── assets/             Runtime app fonts and optimized WebP images
├── backend/            Go Fiber + GORM API
├── docs/               Deployment and maintenance notes
├── src/                Expo React Native app source
├── app.json            Expo app config
├── eas.json            EAS Build profiles
├── package.json        App/backend helper scripts
└── docker-compose.yml  Local MySQL service for backend development
```

Ignored local folders:

```txt
.expo/
backend/tmp/
node_modules/
project/
```

`project/` is the local prototype/design archive. Runtime files copied from it now live in `assets/` and `src/`.
