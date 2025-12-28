import { Outlet } from "react-router-dom";
import { Box } from "@chakra-ui/react";

export default function AdminLayout() {
  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header / Sidebar sau này */}
      <Box p={6}>
        <Outlet />
      </Box>
    </Box>
  );
}
