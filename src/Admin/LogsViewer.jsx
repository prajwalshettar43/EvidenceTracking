"use client"
import { useState, useEffect } from "react"
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material"
import {
  Assessment,
  Refresh,
  FilterList,
  Search,
  NavigateNext,
  NavigateBefore,
  Person,
  AccessTime,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from "@mui/icons-material"
import axios from "axios"
import { LoggingService } from "../services/LoggingService"
import { useAuth } from "../components/AuthContext"
import React from "react"
const LogsViewer = () => {
  const theme = useTheme()
  const { currentUser } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    type: "",
    severity: "",
    username: "",
    dateFrom: "",
    dateTo: "",
  })

  // Stats for the dashboard
  const [stats, setStats] = useState({
    total: 0,
    byType: {},
    bySeverity: {},
    recentUsers: [],
  })

  useEffect(() => {
    fetchLogs()
    // Log this action
    LoggingService.logUserAction("VIEW_LOGS", currentUser, "Admin viewed system logs")
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get("http://localhost:5000/logs")
      const logsData = response.data

      setLogs(logsData)
      calculateStats(logsData)
    } catch (err) {
      setError("Failed to fetch logs. Please try again.")
      LoggingService.logError(err, "LogsViewer.fetchLogs", currentUser)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (logsData) => {
    // Total logs
    const total = logsData.length

    // Count by type
    const byType = logsData.reduce((acc, log) => {
      const type = log.type || "UNKNOWN"
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    // Count by severity
    const bySeverity = logsData.reduce((acc, log) => {
      const severity = log.severity || "INFO"
      acc[severity] = (acc[severity] || 0) + 1
      return acc
    }, {})

    // Get recent unique users
    const userMap = new Map()
    logsData.forEach((log) => {
      if (log.username && !userMap.has(log.username)) {
        userMap.set(log.username, {
          username: log.username,
          lastActivity: log.timestamp,
        })
      }
    })

    const recentUsers = Array.from(userMap.values())
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      .slice(0, 5)

    setStats({
      total,
      byType,
      bySeverity,
      recentUsers,
    })
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
    setPage(0)
  }

  const resetFilters = () => {
    setFilters({
      type: "",
      severity: "",
      username: "",
      dateFrom: "",
      dateTo: "",
    })
    setPage(0)
  }

  // Apply filters to logs
  const filteredLogs = logs.filter((log) => {
    // Type filter
    if (filters.type && log.type !== filters.type) {
      return false
    }

    // Severity filter
    if (filters.severity && log.severity !== filters.severity) {
      return false
    }

    // Username filter
    if (filters.username && !log.username.toLowerCase().includes(filters.username.toLowerCase())) {
      return false
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      const logDate = new Date(log.timestamp)
      if (logDate < fromDate) {
        return false
      }
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999) // End of the day
      const logDate = new Date(log.timestamp)
      if (logDate > toDate) {
        return false
      }
    }

    return true
  })

  // Pagination
  const paginatedLogs = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  // Get severity chip color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "ERROR":
        return "error"
      case "WARNING":
        return "warning"
      case "CRITICAL":
        return "error"
      default:
        return "info"
    }
  }

  // Get severity icon
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "ERROR":
        return <ErrorIcon fontSize="small" />
      case "WARNING":
        return <WarningIcon fontSize="small" />
      case "CRITICAL":
        return <ErrorIcon fontSize="small" />
      default:
        return <InfoIcon fontSize="small" />
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Assessment sx={{ fontSize: 40 }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              System Logs
            </Typography>
          </Box>
          <Tooltip title="Refresh logs">
            <IconButton color="inherit" onClick={fetchLogs}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
          View and analyze system activity logs
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Logs
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                User Actions
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {stats.byType["USER_ACTION"] || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Errors
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold" color="error.main">
                {stats.bySeverity["ERROR"] || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Security Events
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold" color="warning.main">
                {stats.byType["SECURITY"] || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              label="Log Type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="NAVIGATION">Navigation</MenuItem>
              <MenuItem value="USER_ACTION">User Action</MenuItem>
              <MenuItem value="ERROR">Error</MenuItem>
              <MenuItem value="SYSTEM">System</MenuItem>
              <MenuItem value="SECURITY">Security</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              label="Severity"
              name="severity"
              value={filters.severity}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="">All Severities</MenuItem>
              <MenuItem value="INFO">Info</MenuItem>
              <MenuItem value="WARNING">Warning</MenuItem>
              <MenuItem value="ERROR">Error</MenuItem>
              <MenuItem value="CRITICAL">Critical</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={filters.username}
              onChange={handleFilterChange}
              size="small"
              InputProps={{
                startAdornment: <Search fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="From Date"
              name="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="To Date"
              name="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={handleFilterChange}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2} sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ ml: "auto" }}>
              <Tooltip title="Reset filters">
                <IconButton onClick={resetFilters} color="primary">
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Logs Table */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "background.paper" }}>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Action/Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <AccessTime fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                            {formatDate(log.timestamp)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.type || "UNKNOWN"}
                            size="small"
                            color={log.type === "ERROR" ? "error" : "default"}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getSeverityIcon(log.severity)}
                            label={log.severity || "INFO"}
                            size="small"
                            color={getSeverityColor(log.severity)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Person fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                            {log.username || "anonymous"}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{log.details || log.action || "No details"}</Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No logs found matching the current filters
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={filteredLogs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={(props) => (
                <Box sx={{ display: "flex", alignItems: "center", px: 2 }}>
                  <IconButton
                    onClick={props.onPageChange}
                    disabled={props.count === 0 || props.page === 0}
                    aria-label="previous page"
                  >
                    <NavigateBefore />
                  </IconButton>
                  <Typography variant="body2" sx={{ mx: 2 }}>
                    Page {props.page + 1} of {Math.max(1, Math.ceil(props.count / props.rowsPerPage))}
                  </Typography>
                  <IconButton
                    onClick={(e) => props.onPageChange(e, props.page + 1)}
                    disabled={props.count === 0 || props.page >= Math.ceil(props.count / props.rowsPerPage) - 1}
                    aria-label="next page"
                  >
                    <NavigateNext />
                  </IconButton>
                </Box>
              )}
            />
          </>
        )}
      </Paper>
    </Container>
  )
}

export default LogsViewer