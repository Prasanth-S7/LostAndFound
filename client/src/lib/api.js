export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

//is this works
export const api = {
  register: (email, password) => request('/auth/register', { method: 'POST', body: { email, password } }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  verify: (token) => request('/auth/verify', { token }),
  listItems: (q, status) => request(`/items${q || status ? `?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}) }).toString()}` : ''}`),
  createItem: (token, item) => request('/items', { method: 'POST', body: item, token }),
  markFound: (token, id) => request(`/items/${id}/found`, { method: 'POST', token }),
}


