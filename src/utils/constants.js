export const USERS = [
  { id: 'u1', name: 'Samir Saurabh', email: 'sam@acme.com', avatar: 'SS', color: '#5b6af0' },
  { id: 'u2', name: 'Priya Nair',    email: 'priya@acme.com', avatar: 'PN', color: '#2dd4a0' },
  { id: 'u3', name: 'Rahul Dev',     email: 'rahul@acme.com', avatar: 'RD', color: '#f5a623' },
]

export const getUserById = (id) => USERS.find(u => u.id === id)

export const PRIORITY_CONFIG = {
  low:    { label: 'Low',    color: 'var(--priority-low)',    bg: 'var(--success-subtle)' },
  medium: { label: 'Medium', color: 'var(--priority-medium)', bg: 'var(--warning-subtle)' },
  high:   { label: 'High',   color: 'var(--priority-high)',   bg: 'var(--danger-subtle)' },
}
