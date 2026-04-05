import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.js'

export function PrivateRoute({ children }) {
  const { token } = useAuthStore()
  const location = useLocation()

  if (!token) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />
  }

  return children
}
