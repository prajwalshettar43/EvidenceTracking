"use client"
import { useState } from "react"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Dashboard,
  Folder,
  AddCircleOutline,
  SupervisorAccount,
  ExitToApp,
  Person,
  AccountCircle,
  FolderSpecial,
  PersonAdd,
} from "@mui/icons-material"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../AuthContext"
import { LoggingService } from "../../services/LoggingService"
import React from "react"
const Navbar = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { currentUser, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    LoggingService.logUserAction("LOGOUT", currentUser, "User logged out")
    logout()
    navigate("/add-evidence")
    handleProfileMenuClose()
  }

  // Navigation items based on user role
  const userNavItems = [
    { text: "Cases", icon: <Folder />, path: "/" },
    { text: "Add Evidence", icon: <AddCircleOutline />, path: "/add-evidence" },
    { text: "Create Case", icon: <FolderSpecial />, path: "/newcase" },
  ]

  const adminNavItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/admin" },
    { text: "Case Requests", icon: <FolderSpecial />, path: "/casereq" },
    { text: "User Approvals", icon: <PersonAdd />, path: "/user-approvals" },
    { text: "Access Requests", icon: <SupervisorAccount />, path: "/access-requests" },
  ]

  const navItems = isAdmin() ? [...adminNavItems, ...userNavItems] : userNavItems

  // Check if a path is active (exact match or starts with for nested routes)
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(path)
  }

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          {currentUser?.username?.charAt(0).toUpperCase() || "U"}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {currentUser?.username || "User"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdmin() ? "Administrator" : "Investigator"}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            sx={{
              bgcolor: isActive(item.path) ? "rgba(25, 118, 210, 0.08)" : "transparent",
              color: isActive(item.path) ? "primary.main" : "text.primary",
              borderRight: isActive(item.path) ? `4px solid ${theme.palette.primary.main}` : "none",
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? "primary.main" : "inherit" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  )

  return (
    <>
      <AppBar position="sticky" elevation={1} sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: "none", color: "white" }}>
            Evidence Chain
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  sx={{
                    mx: 0.5,
                    bgcolor: isActive(item.path) ? "rgba(255, 255, 255, 0.15)" : "transparent",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {/* User Profile Menu */}
          <Box sx={{ ml: 2 }}>
            <Tooltip title="Account settings">
              <IconButton onClick={handleProfileMenuOpen} size="large" edge="end" color="inherit">
                <AccountCircle />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem disabled>
                <Typography variant="body2">
                  Signed in as <strong>{currentUser?.username}</strong>
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleProfileMenuClose} component={Link} to="/profile">
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToApp fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer variant="temporary" open={drawerOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }}>
        {drawer}
      </Drawer>
    </>
  )
}

export default Navbar