"use client"

import { createContext, useState, useContext, useEffect } from "react"
import axios from "axios"
import React from "react"
// Create the context
const AuthContext = createContext()

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext)

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is already logged in (from localStorage or sessionStorage)
  useEffect(() => {
    const checkLoggedIn = () => {
      const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null")
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      if (user && token) {
        // Set the default Authorization header for all axios requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
        setCurrentUser(user)
      }
      setLoading(false)
    }

    checkLoggedIn()
  }, [])

  // Login function
  const login = async (username, password, rememberMe = false) => {
    try {
      setError(null)
      const response = await axios.post("http://localhost:5000/login", { username, password })

      const { user, token } = response.data

      // Store in localStorage or sessionStorage based on rememberMe
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem("user", JSON.stringify(user))
      storage.setItem("token", token)

      // Set the default Authorization header for all axios requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setCurrentUser(user)
      return user
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
      throw err
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    sessionStorage.removeItem("user")
    sessionStorage.removeItem("token")

    // Remove the Authorization header
    delete axios.defaults.headers.common["Authorization"]

    setCurrentUser(null)
  }

  // Register function
  const register = async (userData) => {
    try {
      setError(null)
      const response = await axios.post("http://localhost:5000/register", userData)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
      throw err
    }
  }

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null)
      const response = await axios.put(`http://localhost:5000/users/${currentUser._id}`, userData)

      const updatedUser = response.data.user

      // Update stored user data
      const storage = localStorage.getItem("user") ? localStorage : sessionStorage
      storage.setItem("user", JSON.stringify(updatedUser))

      setCurrentUser(updatedUser)
      return updatedUser
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed")
      throw err
    }
  }

  // Check if user has admin role
  const isAdmin = () => {
    return currentUser?.role === "admin"
  }

  // Value object to be provided to consumers
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}