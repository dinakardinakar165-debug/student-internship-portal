
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
      'Cannot connect to the backend. Check that the server is running.'
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
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
