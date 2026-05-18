async function authRequest(path, options = {}) {
  const response = await fetch(`/db-api/auth${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Authentication request failed');
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
