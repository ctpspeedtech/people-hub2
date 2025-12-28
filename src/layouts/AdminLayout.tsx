import { Outlet } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import Navbar from "../components/Navbar";

export default function AdminLayout() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Box p={6}>
        <Outlet />
      </Box>
    </Box>
  );
}
