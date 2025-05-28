"use client"
import React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Grid,
} from "@mui/material"
import { Visibility, ArrowBack, ContentCopy, Person, CalendarToday, Storage } from "@mui/icons-material"

const EvidenceViewer = () => {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const [evidenceList, setEvidenceList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEvidence, setSelectedEvidence] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    if (caseId) {
      fetchEvidence()
    }
  }, [caseId])

  const fetchEvidence = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:5000/evidence/${caseId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch evidence")
      }

      const data = await response.json()
      setEvidenceList(data)
    } catch (err) {
      setError(err.message || "An error occurred while fetching evidence")
      setEvidenceList([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const handleViewEvidence = (evidence) => {
    setSelectedEvidence(evidence)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setTimeout(() => setSelectedEvidence(null), 300)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      })
      .catch((err) => console.error("Failed to copy: ", err))
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    )
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
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Storage sx={{ fontSize: 40 }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Evidence for Case #{caseId}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ color: theme.palette.primary.main }}
          >
            Back
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {!error && evidenceList.length === 0 && (
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary">
            No evidence found for this case
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Evidence items will appear here once they are added to the case
          </Typography>
        </Paper>
      )}

      {evidenceList.length > 0 && (
        <Paper sx={{ borderRadius: 2, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          <Box sx={{ p: 2, bgcolor: theme.palette.primary.light, color: "white" }}>
            <Typography variant="subtitle1" fontWeight="medium">
              Found {evidenceList.length} evidence item{evidenceList.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "background.paper" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>File Hash</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Uploaded By</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Uploaded At</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {evidenceList.map((evidence, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell component="th" scope="row" sx={{ fontWeight: "medium" }}>
                      {evidence.title}
                    </TableCell>
                    <TableCell>
                      <Typography noWrap sx={{ maxWidth: 200 }} title={evidence.description}>
                        {evidence.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography noWrap sx={{ maxWidth: 150 }} title={evidence.fileHash}>
                          {evidence.fileHash}
                        </Typography>
                        <IconButton size="small" onClick={() => copyToClipboard(evidence.fileHash)} title="Copy hash">
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>{evidence.uploadedBy}</TableCell>
                    <TableCell>{formatDate(evidence.uploadedAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/view-evi/${evidence.fileHash}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Evidence Detail Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedEvidence && (
          <>
            <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: "white" }}>
              {selectedEvidence.title}
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1">{selectedEvidence.description}</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  File Hash
                </Typography>
                <Paper sx={{ p: 2, bgcolor: "background.paper", position: "relative" }}>
                  <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: "break-all" }}>
                    {selectedEvidence.fileHash}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(selectedEvidence.fileHash)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Paper>
                {copySuccess && <Chip label="Copied to clipboard!" color="success" size="small" sx={{ mt: 1 }} />}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Uploaded By
                      </Typography>
                      <Typography variant="body2">{selectedEvidence.uploadedBy}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarToday color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Uploaded At
                      </Typography>
                      <Typography variant="body2">{formatDate(selectedEvidence.uploadedAt)}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleCloseDialog()
                  navigate(`/view-evi/${selectedEvidence.fileHash}`)
                }}
              >
                View Details
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  )
}

export default EvidenceViewer

