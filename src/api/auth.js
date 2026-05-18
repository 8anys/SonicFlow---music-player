async function authRequest(path, options = {}) {
  const response = await fetch(`/db-api/auth${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : { error: await response.text().catch(() => '') };

  if (!response.ok) {
    const fallback = response.status === 500
      ? 'Server error. Restart Python backend and check its terminal log.'
      : 'Authentication request failed';
    throw new Error(data.error || fallback);
  }

  return data;
}

export function getCurrentUser() {
  return authRequest('/me');
}

export function loginUser({ email, password }) {
  return authRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function registerUser({ displayName, email, password }) {
  return authRequest('/register', {
    method: 'POST',
    body: JSON.stringify({ display_name: displayName, email, password }),
  });
}

export function loginWithGoogleCredential(credential) {
  return authRequest('/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

export function logoutUser() {
  return authRequest('/logout', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
