"use client"
import { useEffect } from "react"
import { Box, Container } from "@mui/material"
import Navbar from "./Navbar"
import { useAuth } from "../AuthContext"
import { useLocation, useNavigate } from "react-router-dom"
import { LoggingService } from "../../services/LoggingService"
import React from "react"
const MainLayout = ({ children }) => {
  const { currentUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Log page navigation
  useEffect(() => {
    if (currentUser) {
      LoggingService.logNavigation(location.pathname, currentUser)
    }
  }, [location.pathname, currentUser])

  // Redirect to login if not authenticated (except for public routes)
  useEffect(() => {
    const publicRoutes = ["/signin", "/signup", "/pending-approval"]

    if (!currentUser && !publicRoutes.includes(location.pathname)) {
      navigate("/signin")
    }
  }, [currentUser, location.pathname, navigate])

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Navbar is always visible except on auth pages */}
      {location.pathname !== "/signin" &&
        location.pathname !== "/signup" &&
        location.pathname !== "/pending-approval" && <Navbar />}

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Container maxWidth={false} disableGutters>
          {children}
        </Container>
      </Box>
    </Box>
  )
}

export default MainLayout