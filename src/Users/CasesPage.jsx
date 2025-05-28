"use client"
import React from "react"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Stack,
} from "@mui/material"
import { 
  AddCircleOutline, 
  Visibility, 
  LockOpen, 
  Lock, 
  Person, 
  FolderOpen, 
  Close, 
  PictureAsPdf,
  ContentCopy,
  Download,
  Shield,
  Info,
  DownloadForOffline
} from "@mui/icons-material"
import { useAuth } from "../components/AuthContext"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

// Case Details Modal Component
const CaseDetailsModal = ({ open, onClose, caseData }) => {
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [usePassword, setUsePassword] = useState(false)
  const summaryRef = useRef(null)
  
  if (!caseData) return null
  
  const generatePDF = async () => {
    if (!summaryRef.current) return
    
    try {
      setLoading(true)
      
      const canvas = await html2canvas(summaryRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      
      // Add metadata
      pdf.setProperties({
        title: `Case Report - ${caseData.title}`,
        subject: 'Case Report',
        author: 'Evidence Management System',
        creator: 'Case Management Platform'
      })
      
      // Password protect if requested
      if (usePassword && password) {
        pdf.save(`case-report-${caseData._id}.pdf`, { encryption: { userPassword: password, ownerPassword: password, userPermissions: ['print', 'copy'] } })
      } else {
        pdf.save(`case-report-${caseData._id}.pdf`)
      }
      
      setLoading(false)
    } catch (error) {
      console.error("Error generating PDF:", error)
      setLoading(false)
    }
  }
  
  // Format timestamps
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleString()
  }
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ 
        p: 3, 
        bgcolor: theme.palette.primary.main, 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Info />
          <Typography variant="h6">Case Summary</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box ref={summaryRef} sx={{ p: 3 }}>
          {/* Case Information */}
          <Box sx={{ mb: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: theme.palette.primary.main }}>
                {caseData.title}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Case ID</Typography>
                  <Typography variant="body1">{caseData._id}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    size="small" 
                    color={caseData.status === 'active' ? 'success' : 'warning'} 
                    label={caseData.status || 'Processing'} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Created By</Typography>
                  <Typography variant="body1">{caseData.createdBy?.username || 'Unknown'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Creation Date</Typography>
                  <Typography variant="body1">{formatDateTime(caseData.createdAt)}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
          
          {/* Description */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
              Description
            </Typography>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
              <Typography variant="body1">
                {caseData.description || 'No description available.'}
              </Typography>
            </Paper>
          </Box>
          
          {/* Evidence List (if available) */}
          {caseData.evidences && caseData.evidences.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
                Evidence Items
              </Typography>
              <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Evidence ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Added By</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date Added</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {caseData.evidences.map((evidence) => (
                      <TableRow key={evidence._id} hover>
                        <TableCell>{evidence._id}</TableCell>
                        <TableCell>{evidence.type || 'Unknown'}</TableCell>
                        <TableCell>{evidence.addedBy?.username || 'Unknown'}</TableCell>
                        <TableCell>{formatDateTime(evidence.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {/* Access Information */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
              Access Information
            </Typography>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Access Status</Typography>
                  <Chip 
                    size="small" 
                    color={caseData.accessGranted ? 'success' : 'warning'}
                    icon={caseData.accessGranted ? <LockOpen fontSize="small" /> : <Lock fontSize="small" />}
                    label={caseData.accessGranted ? 'Access Granted' : 'Access Required'} 
                  />
                </Grid>
                {caseData.accessGrantDate && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Access Granted Date</Typography>
                    <Typography variant="body1">{formatDateTime(caseData.accessGrantDate)}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Box>
          
          {/* Document footer */}
          <Box sx={{ mt: 6, pt: 2, borderTop: '1px dashed #e0e0e0', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              This report was generated at {formatDateTime(new Date())} 
              by Evidence Management System.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Password protect your PDF">
            <IconButton 
              onClick={() => setUsePassword(!usePassword)} 
              color={usePassword ? "primary" : "default"}
            >
              <Shield />
            </IconButton>
          </Tooltip>
          
          {usePassword && (
            <TextField
              size="small" 
              label="PDF Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ width: '200px' }}
              placeholder="Enter password"
            />
          )}
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
          <Button 
            onClick={generatePDF} 
            variant="contained" 
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadForOffline />}
            disabled={loading || (usePassword && !password)}
          >
            {loading ? 'Generating...' : 'Download PDF'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  )
}

export default function CasesPage() {
  const theme = useTheme()
  const { currentUser } = useAuth()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const navigate = useNavigate()
  
  // Case details modal state
  const [selectedCase, setSelectedCase] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    if (currentUser) {
      fetchCases()
    }
  }, [currentUser])

  const fetchCases = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:5000/cases-with-access/${currentUser._id}`)
      setCases(Array.isArray(response.data) ? response.data : [])
      setError(null)
    } catch (error) {
      console.error("Error fetching cases:", error)
      setError("Failed to load cases. Please try again later.")
      setCases([])
    } finally {
      setLoading(false)
    }
  }

  const requestAccess = async (caseId) => {
    setProcessingId(caseId)
    try {
      await axios.post("http://localhost:5000/request-access", { userId: currentUser._id, caseId })
      alert("Access request submitted successfully")
    } catch (error) {
      console.error("Error requesting access:", error)
      setError("Request already submitted. Please wait untill admin approves.")
    } finally {
      setProcessingId(null)
    }
  }
  
  const openCaseDetails = (caseItem) => {
    setSelectedCase(caseItem)
    setDetailsOpen(true)
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
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
          <FolderOpen sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Evidence Cases
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
          View and manage your evidence cases
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
      ) : cases.length === 0 ? (
        <Card sx={{ borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              No cases available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              There are no cases assigned to you at the moment
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {cases.map((caseItem) => (
            <Grid item xs={12} md={6} key={caseItem._id}>
              <Card
                sx={{
                  height: "100%",
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
                    <Typography variant="h6" component="h2" fontWeight="bold">
                      {caseItem.title}
                    </Typography>
                    <Chip
                      icon={caseItem.accessGranted ? <LockOpen /> : <Lock />}
                      label={caseItem.accessGranted ? "Access Granted" : "Access Required"}
                      color={caseItem.accessGranted ? "success" : "warning"}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
                    {caseItem.description}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2, width: 32, height: 32 }}>
                      <Person fontSize="small" />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      Created by: {caseItem.createdBy?.username || "Unknown"}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {caseItem.accessGranted ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<AddCircleOutline />}
                          onClick={() => navigate(`/add-evidence/${caseItem._id}`)}
                          fullWidth
                        >
                          Add Evidence
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/view-data/${caseItem._id}`)}
                          fullWidth
                        >
                          View Data
                        </Button>
                      </Box>
                      <Button
                        variant="outlined"
                        color="info"
                        startIcon={<PictureAsPdf />}
                        onClick={() => openCaseDetails(caseItem)}
                        fullWidth
                      >
                        Case Summary
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<LockOpen />}
                      onClick={() => requestAccess(caseItem._id)}
                      disabled={processingId === caseItem._id}
                      fullWidth
                    >
                      {processingId === caseItem._id ? "Requesting..." : "Request Access"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Case Details Modal */}
      <CaseDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        caseData={selectedCase}
      />
    </Container>
  )
}