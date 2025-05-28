"use client"
import React from "react"
import { useState } from "react"
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
} from "@mui/material"
import { Person, Save, Security } from "@mui/icons-material"
import { useAuth } from "../components/AuthContext"
import { LoggingService } from "../services/LoggingService"

const UserProfile = () => {
  const theme = useTheme()
  const { currentUser, updateProfile } = useAuth()

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || "",
    email: currentUser?.email || "",
    department: currentUser?.department || "",
    batchId: currentUser?.batchId || "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await updateProfile(formData)
      setSuccess(true)
      LoggingService.logUserAction("PROFILE_UPDATE", currentUser, "User updated their profile")
    } catch (err) {
      setError(err.message || "Failed to update profile")
      LoggingService.logError(err, "UserProfile.handleSubmit", currentUser)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setPasswordError(null)
    setPasswordSuccess(false)

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match")
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      // In a real app, you would call an API to change the password
      // For this example, we'll just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setPasswordSuccess(true)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      LoggingService.logSecurityEvent("PASSWORD_CHANGE", currentUser, "User changed their password", "INFO")
    } catch (err) {
      setPasswordError(err.message || "Failed to update password")
      LoggingService.logError(err, "UserProfile.handlePasswordSubmit", currentUser)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          bgcolor: theme.palette.primary.main,
          color: "white",
          backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Person sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            User Profile
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
          Manage your account information
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: theme.palette.primary.main,
                  fontSize: "3rem",
                  mb: 2,
                }}
              >
                {currentUser?.username?.charAt(0).toUpperCase() || "U"}
              </Avatar>

              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {currentUser?.username}
              </Typography>

              <Typography variant="body1" color="text.secondary" gutterBottom>
                {currentUser?.role === "admin" ? "Administrator" : "Investigator"}
              </Typography>

              <Box sx={{ width: "100%", mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Account Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Username:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {currentUser?.username}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Role:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {currentUser?.role === "admin" ? "Administrator" : "Investigator"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Member Since:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {new Date(currentUser?.createdAt || Date.now()).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Update your personal details
              </Typography>

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Profile updated successfully!
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Badge/Batch ID"
                      name="batchId"
                      value={formData.batchId}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  disabled={loading}
                  sx={{ mt: 3 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Save Changes"}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Security
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Update your password
              </Typography>

              {passwordSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Password updated successfully!
                </Alert>
              )}

              {passwordError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {passwordError}
                </Alert>
              )}

              <Box component="form" onSubmit={handlePasswordSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  startIcon={<Security />}
                  disabled={loading}
                  sx={{ mt: 3 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Update Password"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default UserProfile