import { API_BASE_URL, API_TIMEOUT_MS } from '../config/api';

function cleanBaseUrl() {
  return String(API_BASE_URL || '').replace(/\/+$/, '');
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${cleanBaseUrl()}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || `Request failed with status ${response.status}`);
    }
    return payload;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Koneksi ke gerbang Arcadia terlalu lama. Coba lagi sebentar.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function submitAssessment({ user, hobbyCards, birthStar, quizAnswers }) {
  return request('/api/v1/assessments', {
    method: 'POST',
    body: JSON.stringify({
      biodata: {
        fullName: user.name,
        age: user.age,
        grade: user.grade,
        school: user.school,
        email: user.email,
        gender: user.gender,
      },
      hobbyCards,
      birthStar,
      quizAnswers: Object.fromEntries(
        Object.entries(quizAnswers || {}).map(([questionId, answer]) => [
          questionId,
          {
            letter: answer.letter,
            text: answer.text,
          },
        ]),
      ),
    }),
  });
}
