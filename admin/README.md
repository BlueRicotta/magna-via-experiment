# Magna Via Admin Dashboard

Static admin dashboard for the Magna Via backend.

## Local Use

Start the backend:

```bash
npm run api:dev
```

Then open `admin/index.html` in a browser, or serve the folder with any static file server.

Default API URL:

```txt
http://localhost:8080
```

If `ADMIN_TOKEN` is set on the backend, enter the same value in the dashboard connection form.

## Vercel

Deploy this `admin/` folder as a static Vercel project.

After deployment, point the dashboard to your deployed backend URL, for example:

```txt
https://api.magnavia.example
```

Sign in with the backend admin credentials:

```txt
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-password
```

The login creates a 12-hour signed admin session in browser local storage. The dashboard HTML is still a static site, so the real protection is on the backend admin API endpoints.

For local browser testing, the backend must allow the Expo/Web origin in `CORS_ORIGINS`, for example:

```txt
http://localhost:8090,http://127.0.0.1:8090,http://localhost:8081,http://127.0.0.1:8081,http://localhost:8082,http://127.0.0.1:8082
```

The deployed dashboard uses `admin/api/proxy.js` on Vercel for read-only admin requests. This avoids browser CORS issues by proxying dashboard reads through the same Vercel origin.
