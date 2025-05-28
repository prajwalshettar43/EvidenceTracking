import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./AuthContext"
import { CircularProgress, Box } from "@mui/material"
import React from "react"
// Component for routes that require authentication
export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  // If not logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  // If admin-only route and user is not admin, redirect to home
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />
  }

  // If user's account is pending approval
  if (currentUser.role === "pending") {
    return <Navigate to="/pending-approval" replace />
  }

  return children
}

// Component for routes that should not be accessible when logged in (like login/register)
export const PublicOnlyRoute = ({ children }) => {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  // If logged in, redirect to home or the page they were trying to access
  if (currentUser) {
    const from = location.state?.from?.pathname || "/"
    return <Navigate to={from} replace />
  }

  return children
}