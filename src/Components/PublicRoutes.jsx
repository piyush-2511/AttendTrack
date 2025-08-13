import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const PublicRoutes = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth()

  // Still checking auth state
  if (!isInitialized) {
    return <div>Loading...</div>
  }
  
  // Already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  // Not authenticated, render the public component
  return children
}

export default PublicRoutes