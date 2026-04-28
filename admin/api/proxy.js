const allowedHosts = new Set([
  'magna-via-production.up.railway.app',
  'localhost:8080',
  '127.0.0.1:8080',
]);

const allowedPaths = new Set([
  '/healthz',
  '/api/v1/admin/login',
  '/api/v1/admin/summary',
  '/api/v1/admin/assessments',
]);

export default async function handler(request, response) {
  if (!['GET', 'POST'].includes(request.method)) {
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
    if (!['http:', 'https:'].includes(base.protocol)) {
      response.status(400).json({ error: 'backend protocol is not allowed' });
      return;
    }
    if (!allowedHosts.has(base.host)) {
      response.status(400).json({ error: 'backend host is not allowed' });
      return;
    }
    target = new URL(String(path), base);
    if (!allowedPaths.has(target.pathname)) {
      response.status(400).json({ error: 'backend path is not allowed' });
      return;
    }
    if (request.method === 'POST' && target.pathname !== '/api/v1/admin/login') {
      response.status(405).json({ error: 'method not allowed for path' });
      return;
    }
  } catch {
    response.status(400).json({ error: 'invalid backend URL' });
    return;
  }

  try {
    const body = request.method === 'POST'
      ? JSON.stringify(typeof request.body === 'object' ? request.body : JSON.parse(request.body || '{}'))
      : undefined;

    const upstream = await fetch(target, {
      method: request.method,
      headers: {
        Accept: 'application/json',
        ...(request.method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
        ...(request.headers.authorization
          ? { Authorization: request.headers.authorization }
          : {}),
        ...(request.headers['x-admin-token']
          ? { 'X-Admin-Token': request.headers['x-admin-token'] }
          : {}),
      },
      body,
    });

    const text = await upstream.text();
    response.status(upstream.status);
    response.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    response.send(text);
  } catch {
    response.status(502).json({ error: 'failed to reach backend' });
  }
}
