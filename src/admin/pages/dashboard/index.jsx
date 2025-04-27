import React from "react";
import { Box } from "@mui/material";
import BarChart from "../../components/BarChart"; 

const Dashboard = () => {
  return (
    <Box sx={{ pt: "80px", pb: "20px" }}>
      <BarChart />
    </Box>
  );
};

export default Dashboard;
