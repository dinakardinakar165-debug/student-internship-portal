
const API = (
  import.meta.env.VITE_API_URL || '/api'
).replace(/\/$/, '');

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  } catch {
    throw new Error(
      'The backend is unreachable. Your application was not submitted.'
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || (
      response.status === 404
        ? 'The backend API returned 404. GitHub Pages hosts only the frontend, so an API service is required.'
        : `The backend returned HTTP ${response.status}.`
    );
    throw new Error(message);
  }

  return data;
}

export function fetchInternships() {
  return request('/internships');
}

export function fetchInternship(id) {
  return request(`/internships/${encodeURIComponent(id)}`);
}

export function createApplication(application) {
  return request('/applications', {
    method: 'POST',
    body: JSON.stringify(application)
  });
}
