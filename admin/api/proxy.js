const allowedHosts = new Set([
  'magna-via-production.up.railway.app',
  'localhost:8080',
  '127.0.0.1:8080',
]);

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { baseUrl, path } = request.query;
  if (!baseUrl || !path) {
    response.status(400).json({ error: 'baseUrl and path are required' });
    return;
  }

  let target;
  try {
    const base = new URL(String(baseUrl));
    if (!allowedHosts.has(base.host)) {
      response.status(400).json({ error: 'backend host is not allowed' });
      return;
    }
    target = new URL(String(path), base);
  } catch {
    response.status(400).json({ error: 'invalid backend URL' });
    return;
  }

  try {
    const upstream = await fetch(target, {
      headers: {
        Accept: 'application/json',
        ...(request.headers['x-admin-token']
          ? { 'X-Admin-Token': request.headers['x-admin-token'] }
          : {}),
      },
    });

    const text = await upstream.text();
    response.status(upstream.status);
    response.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    response.send(text);
  } catch {
    response.status(502).json({ error: 'failed to reach backend' });
  }
}
