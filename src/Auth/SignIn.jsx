"use client"
import React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  useTheme,
  Checkbox,
  FormControlLabel,
} from "@mui/material"
import { LockOutlined } from "@mui/icons-material"

const SignIn = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await axios.post("http://localhost:5000/login", {
        username: formData.username,
        password: formData.password,
      })

      // Store user data and token in localStorage or sessionStorage
      const storage = formData.rememberMe ? localStorage : sessionStorage
      storage.setItem("user", JSON.stringify(response.data.user))
      storage.setItem("token", response.data.token)

      // Redirect based on user role
      const { role } = response.data.user
      if (role === "admin") {
        navigate("/admin")
        window.location.reload()
      } else if (role === "user") {
        navigate("/")
        window.location.reload()
      } else if (role === "pending") {
        setError("Your account is pending approval. Please contact an administrator.")
        setLoading(false)
        return
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 2,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: theme.palette.secondary.main, width: 56, height: 56 }}>
          <LockOutlined fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h4" fontWeight="bold">
          Sign In
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Access your evidence management dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />
          <FormControlLabel
            control={
              <Checkbox name="rememberMe" color="primary" checked={formData.rememberMe} onChange={handleChange} />
            }
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Sign In"}
          </Button>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">
              Don't have an account?{" "}
              <Link to="/signup" style={{ color: theme.palette.primary.main, textDecoration: "none" }}>
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default SignIn