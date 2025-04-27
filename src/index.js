import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./admin/styles/index.css";
import App from "./App";
import { ThemeToggleProvider } from "./admin/contexts/ThemeContext";
import { CssBaseline } from "@mui/material";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeToggleProvider>
      <CssBaseline />
      <Router>
        <App />
      </Router>
    </ThemeToggleProvider>
  </React.StrictMode>
);
