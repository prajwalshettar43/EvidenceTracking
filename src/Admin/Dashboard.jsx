"use client"
import React, { useState, useEffect } from "react"
import axios from "axios"
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  useTheme,
} from "@mui/material"
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts"
import {
  Folder,
  FolderOpen,
  Assessment,
  Security,
  Gavel,
  Timeline,
  Storage,
  CloudUpload,
  ArrowForward,
} from "@mui/icons-material"
import { Link } from "react-router-dom"

const Dashboard = () => {
  const theme = useTheme()
  const [caseRequests, setCaseRequests] = useState([])
  const [caseStats, setCaseStats] = useState({
    total: 0,
    pending: 0,
    open: 0,
    closed: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [evidenceStats, setEvidenceStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch case requests
      const requestsResponse = await axios.get("http://localhost:5000/case-requests")
      setCaseRequests(requestsResponse.data)

      // For demo purposes, we'll create mock data for the other stats
      // In a real application, you would fetch this from your API

      // Mock case statistics
      setCaseStats({
        total: 24,
        pending: 5,
        open: 12,
        closed: 7,
      })

      // Mock recent activity
      setRecentActivity([
        {
          id: 1,
          type: "EVIDENCE_UPLOADED",
          user: "Officer Johnson",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          details: "Uploaded digital evidence for Case #4872",
        },
        {
          id: 2,
          type: "CASE_CREATED",
          user: "Detective Smith",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          details: "Created new case: Cybersecurity Breach Investigation",
        },
        {
          id: 3,
          type: "ACCESS_GRANTED",
          user: "Admin",
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          details: "Granted access to Officer Wilson for Case #4869",
        },
        {
          id: 4,
          type: "EVIDENCE_VIEWED",
          user: "Forensic Analyst Lee",
          timestamp: new Date(Date.now() - 28800000).toISOString(),
          details: "Viewed evidence for Case #4865",
        },
      ])

      // Mock evidence statistics by type
      setEvidenceStats([
        { name: "Digital", value: 65 },
        { name: "Physical", value: 25 },
        { name: "Documentary", value: 10 },
      ])

      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setLoading(false)
    }
  }

  // Monthly case trend data (mock)
  const monthlyTrendData = [
    { name: "Jan", cases: 4, evidence: 12 },
    { name: "Feb", cases: 6, evidence: 18 },
    { name: "Mar", cases: 8, evidence: 24 },
    { name: "Apr", cases: 10, evidence: 30 },
    { name: "May", cases: 7, evidence: 21 },
    { name: "Jun", cases: 9, evidence: 27 },
  ]

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "EVIDENCE_UPLOADED":
        return <CloudUpload color="primary" />
      case "CASE_CREATED":
        return <FolderOpen color="success" />
      case "ACCESS_GRANTED":
        return <Security color="secondary" />
      case "EVIDENCE_VIEWED":
        return <Assessment color="info" />
      default:
        return <Timeline />
    }
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
      >
        Admin Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 2,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="textSecondary" gutterBottom variant="h6">
                  Total Cases
                </Typography>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <Folder />
                </Avatar>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: "bold" }}>
                {caseStats.total}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {caseStats.pending} pending approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 2,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="textSecondary" gutterBottom variant="h6">
                  Open Cases
                </Typography>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <FolderOpen />
                </Avatar>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: "bold" }}>
                {caseStats.open}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active investigations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 2,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="textSecondary" gutterBottom variant="h6">
                  Closed Cases
                </Typography>
                <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                  <Gavel />
                </Avatar>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: "bold" }}>
                {caseStats.closed}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Completed investigations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 2,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="textSecondary" gutterBottom variant="h6">
                  Evidence Items
                </Typography>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <Storage />
                </Avatar>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: "bold" }}>
                {evidenceStats.reduce((sum, item) => sum + item.value, 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Stored securely on blockchain
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              height: 360,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              Monthly Case & Evidence Trend
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyTrendData}
                margin={{
                  top: 16,
                  right: 16,
                  bottom: 0,
                  left: 24,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cases"
                  stroke={theme.palette.primary.main}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line type="monotone" dataKey="evidence" stroke={theme.palette.secondary.main} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              height: 360,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              Evidence by Type
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={evidenceStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {evidenceStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Case Requests and Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="div">
                Pending Case Requests
              </Typography>
              <Button component={Link} to="/casereq" color="primary" endIcon={<ArrowForward />} size="small">
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {caseRequests.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="body1" color="textSecondary">
                  No pending case requests
                </Typography>
              </Box>
            ) : (
              <List sx={{ width: "100%", maxHeight: 300, overflow: "auto" }}>
                {caseRequests.slice(0, 5).map((caseReq) => (
                  <ListItem
                    key={caseReq._id}
                    secondaryAction={
                      <Chip label="Pending" color="warning" size="small" sx={{ fontWeight: "medium" }} />
                    }
                    sx={{
                      mb: 1,
                      bgcolor: "background.paper",
                      borderRadius: 1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                        <Folder />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={caseReq.title}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {caseReq.requestedBy?.username || "Unknown User"}
                          </Typography>
                          {` — ${caseReq.description?.substring(0, 60)}...`}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography variant="h6" component="div" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List sx={{ width: "100%", maxHeight: 300, overflow: "auto" }}>
              {recentActivity.map((activity) => (
                <ListItem
                  key={activity.id}
                  sx={{
                    mb: 1,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.light }}>{getActivityIcon(activity.type)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.details}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          {activity.user}
                        </Typography>
                        {` — ${formatDate(activity.timestamp)}`}
                      </React.Fragment>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Dashboard

