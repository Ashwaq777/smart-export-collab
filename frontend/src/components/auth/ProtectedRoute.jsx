import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import authService from '../../services/authService'

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const location = useLocation()

  const authed = authService.isAuthenticated()
  const isAdmin = authService.isAdmin()

  if (!authed) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
