import {
  AppBar,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { FiMenu, FiMoon, FiSun } from "react-icons/fi";
import { useColorTheme } from "../contexts/ThemeContext";
import { useLocation } from "react-router-dom";
import Home from '@mui/icons-material/Home';
import { Link } from "react-router-dom";

const Navbar = ({ sideBarWidth, handleDrawerToggle }) => {
  const colorMode = useColorTheme();
  const theme = useTheme();

  // Titulo Dinamico
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  let lastSegment = pathSegments[pathSegments.length - 1] || "dashboard";
  if (lastSegment.toLowerCase() === "admin") {
    lastSegment = "dashboard";
  }
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  //

  const currentTheme = theme.palette.mode;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${sideBarWidth}px)` },
        ml: { md: `${sideBarWidth}px` },
        boxShadow: "unset",
        backgroundColor: "background.paper",
        color: "text.primary",
        borderBottomWidth: 1,
        borderBottomColor: "divider",
      }}
    >
      <Toolbar>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Tooltip title="Menu" arrow>
              <IconButton
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: "none" } }}
              >
                <FiMenu />
              </IconButton>
            </Tooltip>

            <Typography
              variant="h5"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              {capitalize(lastSegment)}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">

            <Tooltip title="Toggle Theme" arrow>
              <IconButton
                onClick={colorMode.toggleColorMode}
                sx={{ fontSize: "20px", color: "text.primary" }}
              >
                {currentTheme === "light" ? <FiMoon /> : <FiSun />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Home" arrow>
              <IconButton
                component={Link}
                to="/"
                sx={{ fontSize: "20px", color: "text.primary" }}
              >
                <Home />
              </IconButton>
            </Tooltip>            
          </Stack>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
