
import { BASE_URL, API_TIMEOUT } from '../config';

export async function apiRequest(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export function apiGet(path) {
  return apiRequest(path);
}

export function apiPost(path, data) {
  return apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function apiPatch(path, data) {
  return apiRequest(path, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
