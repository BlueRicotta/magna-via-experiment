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

The backend must allow the Vercel domain in `CORS_ORIGINS`.
