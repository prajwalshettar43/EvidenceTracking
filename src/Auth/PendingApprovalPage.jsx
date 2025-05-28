"use client"
import { useAuth } from "../components/AuthContext"
import { Container, Typography, Box, Button, useTheme, Card, CardContent, Avatar } from "@mui/material"
import { HourglassEmpty, ExitToApp } from "@mui/icons-material"
import React from "react"
const PendingApprovalPage = () => {
  const theme = useTheme()
  const { logout, currentUser } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <Container component="main" maxWidth="md" sx={{ py: 8 }}>
      <Card sx={{ borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <Box
          sx={{
            bgcolor: theme.palette.warning.main,
            py: 4,
            px: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ bgcolor: "white", width: 80, height: 80, mb: 2 }}>
            <HourglassEmpty sx={{ fontSize: 40, color: theme.palette.warning.main }} />
          </Avatar>
          <Typography variant="h4" component="h1" color="white" fontWeight="bold" align="center">
            Account Pending Approval
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Typography variant="body1" paragraph align="center">
            Thank you for registering, {currentUser?.fullName || currentUser?.username}. Your account is currently
            pending approval by an administrator.
          </Typography>

          <Typography variant="body1" paragraph align="center">
            Once your account is approved, you will be able to access the evidence management system. This process
            typically takes 1-2 business days.
          </Typography>

          <Typography variant="body1" paragraph align="center" fontWeight="medium">
            Please check back later or contact your administrator if you have any questions.
          </Typography>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
              sx={{ borderRadius: 2, py: 1, px: 3 }}
            >
              Sign Out
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}

export default PendingApprovalPage