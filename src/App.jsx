import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import CasesPage from "./Users/CasesPage.jsx"
import AddEvidencePage from "./Users/AddEvidencePage"
import TransactionQuery from "./Users/TransactionQuery.jsx"
import EvidenceList from "./Users/EvidenceList.jsx"
import SubmitCaseRequest from "./Users/SubmitCaseRequest.jsx"

import CaseRequestsPage from "./Admin/CaseRequestsPage.jsx"
import Dashboard from "./Admin/Dashboard.jsx"
import UserApprovalPage from "./Admin/UserApprovalPage.jsx"
import AccessRequestsPage from "./Admin/AccessRequestsPage.jsx"
import SignIn from "./Auth/SignIn.jsx"
import SignUp from "./Auth/SignUp.jsx"
import PendingApprovalPage from "./Auth/PendingApprovalPage.jsx"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { AuthProvider } from "./components/AuthContext"
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute"
import MainLayout from "./components/layout/MainLayout"
import UserProfile from "./Users/UserProfile.jsx"
import LogsViewer from "./Admin/LogsViewer.jsx"
import React from "react"
// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#9c27b0",
    },
    background: {
      default: "#f5f7fa",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <MainLayout>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/signin"
                element={
                  <PublicOnlyRoute>
                    <SignIn />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicOnlyRoute>
                    <SignUp />
                  </PublicOnlyRoute>
                }
              />
              <Route path="/pending-approval" element={<PendingApprovalPage />} />

              {/* Protected User Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <CasesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-evidence/:caseId"
                element={
                  <ProtectedRoute>
                    <AddEvidencePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-evidence"
                element={
                  <ProtectedRoute>
                    <CasesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/view-data/:caseId"
                element={
                  <ProtectedRoute>
                    <EvidenceList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/view-Evi/:caseId"
                element={
                  <ProtectedRoute>
                    <TransactionQuery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/casereq"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <CaseRequestsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-approvals"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <UserApprovalPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/access-requests"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AccessRequestsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/logs"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <LogsViewer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/newcase"
                element={
                  <ProtectedRoute>
                    <SubmitCaseRequest />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MainLayout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App