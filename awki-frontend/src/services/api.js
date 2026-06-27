// ─── Centralized API Client ───────────────────────────────────────────────────
// All requests go through here. Handles:
//   - Base URL from VITE_API_URL env variable (fallback: localhost:8080)
//   - Automatic Authorization: Bearer token from localStorage
//   - 401 → clears session and redirects to login
//   - Unwraps ApiResponse envelope: returns res.data directly

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

function getToken() {
  return localStorage.getItem('awki_token')
}

function clearSessionAndRedirect() {
  localStorage.removeItem('awki_token')
  localStorage.removeItem('awki_user')
  // Force full page reload so App.jsx re-evaluates auth state
  window.location.reload()
}

/**
 * Core fetch wrapper.
 * @param {string} path  - API path, e.g. '/api/v1/chat/historial'
 * @param {RequestInit} options - fetch options (method, body, extra headers)
 * @returns {Promise<any>} - The `data` field of the ApiResponse envelope
 */
export async function apiFetch(path, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  // Token expired or invalid, or Access Denied → force logout
  if (res.status === 401 || res.status === 403) {
    clearSessionAndRedirect()
    throw new Error('Sesión expirada o no autorizada. Por favor, inicia sesión nuevamente.')
  }

  const body = await res.json()

  if (!res.ok) {
    // Use the backend error message if available
    const msg = body?.error?.message ?? body?.message ?? `Error ${res.status}`
    throw new Error(msg)
  }

  // Unwrap ApiResponse envelope: { success: true, data: {...} }
  return body.data
}

// ─── Convenience methods ──────────────────────────────────────────────────────

export const api = {
  get: (path, params) => {
    const url = params
      ? `${path}?${new URLSearchParams(params).toString()}`
      : path
    return apiFetch(url)
  },

  post: (path, body) =>
    apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),

  put: (path, body) =>
    apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),

  patch: (path, body) =>
    apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
}

// ─── JWT decoder (no validation, only payload extraction) ────────────────────
export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded
  } catch {
    return null
  }
}
