"use client"

import { useEffect, useState } from "react"
import React from "react"
import axios from "axios"
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  useTheme,
} from "@mui/material"
import { CheckCircle, Cancel, Person, AccessTime, FolderSpecial } from "@mui/icons-material"

export default function CaseRequestsPage() {
  const theme = useTheme()
  const [caseRequests, setCaseRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    fetchCaseRequests()
  }, [])

  const fetchCaseRequests = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:5000/case-requests")
      console.log("API Response:", response.data)

      const data = response.data
      setCaseRequests(Array.isArray(data) ? data : [])
      setError(null)
    } catch (error) {
      console.error("Error fetching case requests:", error)
      setError("Failed to load case requests. Please try again later.")
      setCaseRequests([])
    } finally {
      setLoading(false)
    }
  }

  const approveCase = async (caseId, status) => {
    setProcessingId(caseId)
    try {
      await axios.post(`http://localhost:5000/approve-case/${caseId}`, { status })
      setCaseRequests((prevRequests) => prevRequests.filter((req) => req._id !== caseId))
    } catch (error) {
      console.error(`Error ${status === "approved" ? "approving" : "rejecting"} case:`, error)
      setError(`Failed to ${status === "approved" ? "approve" : "reject"} the case. Please try again.`)
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
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
          <FolderSpecial sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Case Requests Management
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
          Review and manage pending case creation requests
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : caseRequests.length === 0 ? (
        <Card sx={{ borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Box sx={{ mb: 2 }}>
              <CheckCircle color="success" sx={{ fontSize: 60 }} />
            </Box>
            <Typography variant="h6" color="text.secondary">
              No pending case requests
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              All case requests have been processed
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {caseRequests.map((caseReq) => (
            <Grid item xs={12} key={caseReq._id}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box>
                      <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                        {caseReq.title}
                      </Typography>
                      <Chip
                        icon={<AccessTime />}
                        label={`Requested: ${formatDate(caseReq.requestedAt || new Date())}`}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    </Box>
                    <Chip label="Pending Review" color="warning" sx={{ fontWeight: "medium" }} />
                  </Box>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    {caseReq.description}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">Requested by</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {caseReq.requestedBy?.username || "Unknown User"}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => approveCase(caseReq._id, "rejected")}
                      disabled={processingId === caseReq._id}
                    >
                      {processingId === caseReq._id ? "Processing..." : "Reject"}
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => approveCase(caseReq._id, "approved")}
                      disabled={processingId === caseReq._id}
                    >
                      {processingId === caseReq._id ? "Processing..." : "Approve"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

