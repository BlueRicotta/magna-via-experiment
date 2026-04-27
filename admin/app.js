const defaults = {
  apiBaseUrl: localStorage.getItem('mv_admin_api_base_url') || 'http://localhost:8080',
  adminToken: localStorage.getItem('mv_admin_token') || '',
};

const els = {
  apiBaseUrl: document.querySelector('#apiBaseUrl'),
  adminToken: document.querySelector('#adminToken'),
  settingsForm: document.querySelector('#settingsForm'),
  refreshButton: document.querySelector('#refreshButton'),
  status: document.querySelector('#status'),
  totalAssessments: document.querySelector('#totalAssessments'),
  topClass: document.querySelector('#topClass'),
  topDimension: document.querySelector('#topDimension'),
  classDistribution: document.querySelector('#classDistribution'),
  dimensionTotals: document.querySelector('#dimensionTotals'),
  submissionsBody: document.querySelector('#submissionsBody'),
};

els.apiBaseUrl.value = defaults.apiBaseUrl;
els.adminToken.value = defaults.adminToken;

els.settingsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  saveSettings();
  loadDashboard();
});

els.refreshButton.addEventListener('click', loadDashboard);

function saveSettings() {
  localStorage.setItem('mv_admin_api_base_url', cleanBaseUrl());
  localStorage.setItem('mv_admin_token', els.adminToken.value.trim());
  setStatus('Connection saved.', 'ok');
}

async function loadDashboard() {
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
    const message = error instanceof TypeError && error.message === 'Failed to fetch'
      ? 'Failed to fetch. Check the API URL and backend CORS_ORIGINS setting.'
      : error.message;
    setStatus(message, 'error');
  }
}

async function apiFetch(path) {
  const response = await fetch(requestUrl(path), {
    headers: {
      Accept: 'application/json',
      ...(els.adminToken.value.trim() ? { 'X-Admin-Token': els.adminToken.value.trim() } : {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }
  return payload;
}

function requestUrl(path) {
  if (shouldUseProxy()) {
    const params = new URLSearchParams({
      baseUrl: cleanBaseUrl(),
      path,
    });
    return `/api/proxy?${params.toString()}`;
  }
  return `${cleanBaseUrl()}${path}`;
}

function shouldUseProxy() {
  return window.location.protocol === 'https:' &&
    window.location.hostname.endsWith('vercel.app');
}

function cleanBaseUrl() {
  return (els.apiBaseUrl.value || 'http://localhost:8080').trim().replace(/\/+$/, '');
}

function setStatus(message, type) {
  els.status.textContent = message;
  els.status.className = `status ${type ? `is-${type}` : ''}`.trim();
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

loadDashboard();
