const BASE = '/api'

async function request(path, options = {}) {
  const token = JSON.parse(sessionStorage.getItem('tb-auth') || '{}')?.state?.token
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  if (!res.ok) {
    if (res.status === 401) {
      sessionStorage.removeItem('tb-auth')
      window.location.href = '/login'
    }
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  login: (email, password) =>
    request('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getWorkspaces: () => request('/workspaces'),

  getBoards: (workspaceId) => request(`/boards?workspaceId=${workspaceId}`),

  getBoard: (boardId) => request(`/board/${boardId}`),

  getPublicBoard: (token) => fetch(`${BASE}/public/board/${token}`).then(r => {
    if (!r.ok) throw new Error('Board not found or not public')
    return r.json()
  }),

  createTask: (data) =>
    request('/task', { method: 'POST', body: JSON.stringify(data) }),

  updateTask: (taskId, data) =>
    request(`/task/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteTask: (taskId) =>
    request(`/task/${taskId}`, { method: 'DELETE' }),

  getActivity: (boardId) => request(`/activity/${boardId}`),
}
