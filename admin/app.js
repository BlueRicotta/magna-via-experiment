const defaults = {
  apiBaseUrl: localStorage.getItem('mv_admin_api_base_url') || 'http://localhost:8080',
  session: readSession(),
};

const els = {
  loginScreen: document.querySelector('#loginScreen'),
  dashboardShell: document.querySelector('#dashboardShell'),
  loginForm: document.querySelector('#loginForm'),
  loginApiBaseUrl: document.querySelector('#loginApiBaseUrl'),
  adminUsername: document.querySelector('#adminUsername'),
  adminPassword: document.querySelector('#adminPassword'),
  loginStatus: document.querySelector('#loginStatus'),
  apiBaseUrl: document.querySelector('#apiBaseUrl'),
  settingsForm: document.querySelector('#settingsForm'),
  logoutButton: document.querySelector('#logoutButton'),
  refreshButton: document.querySelector('#refreshButton'),
  status: document.querySelector('#status'),
  totalAssessments: document.querySelector('#totalAssessments'),
  topClass: document.querySelector('#topClass'),
  topDimension: document.querySelector('#topDimension'),
  classDistribution: document.querySelector('#classDistribution'),
  dimensionTotals: document.querySelector('#dimensionTotals'),
  submissionsBody: document.querySelector('#submissionsBody'),
};

els.loginApiBaseUrl.value = defaults.apiBaseUrl;
els.apiBaseUrl.value = defaults.apiBaseUrl;

els.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await login();
});

els.settingsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  saveSettings();
  loadDashboard();
});

els.logoutButton.addEventListener('click', logout);
els.refreshButton.addEventListener('click', loadDashboard);

if (hasValidSession()) {
  showDashboard();
  loadDashboard();
} else {
  showLogin();
}

async function login() {
  setLoginStatus('Signing in...', '');
  localStorage.setItem('mv_admin_api_base_url', cleanLoginBaseUrl());
  els.apiBaseUrl.value = cleanLoginBaseUrl();

  try {
    const response = await fetch(requestUrl('/api/v1/admin/login', cleanLoginBaseUrl()), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: els.adminUsername.value.trim(),
        password: els.adminPassword.value,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || `Login failed: ${response.status}`);
    }

    defaults.session = {
      token: payload.token,
      expiresAt: payload.expiresAt,
    };
    localStorage.setItem('mv_admin_session', JSON.stringify(defaults.session));
    els.adminPassword.value = '';
    showDashboard();
    await loadDashboard();
  } catch (error) {
    setLoginStatus(formatFetchError(error), 'error');
  }
}

function logout() {
  defaults.session = null;
  localStorage.removeItem('mv_admin_session');
  clearDashboard();
  showLogin();
  setLoginStatus('Signed out.', 'ok');
}

function saveSettings() {
  localStorage.setItem('mv_admin_api_base_url', cleanBaseUrl());
  els.loginApiBaseUrl.value = cleanBaseUrl();
  setStatus('Connection saved.', 'ok');
}

async function loadDashboard() {
  if (!hasValidSession()) {
    logout();
    setLoginStatus('Session expired. Please sign in again.', 'error');
    return;
  }

  saveSettings();
  setStatus('Loading dashboard...', '');

  try {
    const [health, summary, rows] = await Promise.all([
      apiFetch('/healthz'),
      apiFetch('/api/v1/admin/summary'),
      apiFetch('/api/v1/admin/assessments'),
    ]);

    renderSummary(summary);
    renderRows(rows.assessments || []);
    setStatus(`Connected to ${health.service || 'API'}.`, 'ok');
  } catch (error) {
    if (/unauthorized|401/i.test(error.message)) {
      logout();
      setLoginStatus('Session rejected by backend. Please sign in again.', 'error');
      return;
    }
    setStatus(formatFetchError(error), 'error');
  }
}

async function apiFetch(path) {
  const response = await fetch(requestUrl(path), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${defaults.session?.token || ''}`,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }
  return payload;
}

function requestUrl(path, baseUrl = cleanBaseUrl()) {
  if (shouldUseProxy()) {
    const params = new URLSearchParams({
      baseUrl,
      path,
    });
    return `/api/proxy?${params.toString()}`;
  }
  return `${baseUrl}${path}`;
}

function shouldUseProxy() {
  return window.location.protocol === 'https:' &&
    window.location.hostname.endsWith('vercel.app');
}

function cleanBaseUrl() {
  return cleanUrl(els.apiBaseUrl.value || 'http://localhost:8080');
}

function cleanLoginBaseUrl() {
  return cleanUrl(els.loginApiBaseUrl.value || 'http://localhost:8080');
}

function cleanUrl(value) {
  return String(value).trim().replace(/\/+$/, '');
}

function showLogin() {
  els.loginScreen.hidden = false;
  els.dashboardShell.hidden = true;
}

function showDashboard() {
  els.loginScreen.hidden = true;
  els.dashboardShell.hidden = false;
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem('mv_admin_session') || 'null');
  } catch {
    return null;
  }
}

function hasValidSession() {
  if (!defaults.session?.token || !defaults.session?.expiresAt) return false;
  return new Date(defaults.session.expiresAt).getTime() > Date.now();
}

function clearDashboard() {
  els.totalAssessments.textContent = '0';
  els.topClass.textContent = '-';
  els.topDimension.textContent = '-';
  els.classDistribution.innerHTML = '<p class="muted">No data loaded.</p>';
  els.dimensionTotals.innerHTML = '<p class="muted">No data loaded.</p>';
  els.submissionsBody.innerHTML = '<tr><td colspan="6" class="empty">No data loaded yet.</td></tr>';
  setStatus('Signed out.', '');
}

function setStatus(message, type) {
  els.status.textContent = message;
  els.status.className = `status ${type ? `is-${type}` : ''}`.trim();
}

function setLoginStatus(message, type) {
  els.loginStatus.textContent = message;
  els.loginStatus.className = `status ${type ? `is-${type}` : ''}`.trim();
}

function formatFetchError(error) {
  return error instanceof TypeError && error.message === 'Failed to fetch'
    ? 'Failed to fetch. Check the API URL and backend CORS_ORIGINS setting.'
    : error.message;
}

function renderSummary(summary) {
  const classCounts = summary.classCounts || {};
  const dimensionTotals = summary.dimensionTotals || {};
  const topClass = topEntry(classCounts);
  const topDimension = topEntry(dimensionTotals);

  els.totalAssessments.textContent = summary.totalAssessments || 0;
  els.topClass.textContent = topClass ? titleCase(topClass[0]) : '-';
  els.topDimension.textContent = topDimension ? topDimension[0] : '-';

  renderBars(els.classDistribution, classCounts, titleCase);
  renderBars(els.dimensionTotals, dimensionTotals, (value) => value);
}

function renderBars(root, values, labeler) {
  const entries = Object.entries(values || {}).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, value]) => value));

  root.innerHTML = '';
  if (entries.length === 0) {
    root.innerHTML = '<p class="muted">No data yet.</p>';
    return;
  }

  entries.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <span>${escapeHTML(labeler(label))}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${(value / max) * 100}%"></span></span>
      <strong>${value}</strong>
    `;
    root.appendChild(row);
  });
}

function renderRows(rows) {
  els.submissionsBody.innerHTML = '';

  if (!rows.length) {
    els.submissionsBody.innerHTML = '<tr><td colspan="6" class="empty">No submissions yet.</td></tr>';
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    const top = (row.topDimensions || []).slice(0, 2).join(' / ') || '-';
    tr.innerHTML = `
      <td>
        <strong>${escapeHTML(row.fullName || '-')}</strong><br />
        <span class="muted">${escapeHTML(row.email || '')}</span>
      </td>
      <td>${escapeHTML(row.grade || '-')}</td>
      <td><span class="pill">${escapeHTML(row.birthStar || '-')}</span></td>
      <td>
        <strong>${escapeHTML(row.result?.name || '-')}</strong><br />
        <span class="muted">${escapeHTML(row.result?.dominantLabel || '')}</span>
      </td>
      <td>${escapeHTML(top)}</td>
      <td>${escapeHTML(formatDate(row.createdAt))}</td>
    `;
    els.submissionsBody.appendChild(tr);
  });
}

function topEntry(values) {
  const entries = Object.entries(values || {});
  if (!entries.length) return null;
  return entries.sort((a, b) => b[1] - a[1])[0];
}

function titleCase(value) {
  return String(value || '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function escapeHTML(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
