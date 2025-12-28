import { HStack, Box, Heading, Button, Link as ChakraLink } from "@chakra-ui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Box bg="white" boxShadow="sm">
      <HStack px={6} py={3} spacing={4} align="center">
        <Heading size="sm">People Hub</Heading>

        <ChakraLink as={Link} to="/admin/employees" color={isActive('/admin/employees') ? 'blue.600' : undefined}>Employees</ChakraLink>
        <ChakraLink as={Link} to="/admin/departments" color={isActive('/admin/departments') ? 'blue.600' : undefined}>Departments</ChakraLink>

        <Box flex="1" />

        <Button size="sm" variant="ghost" onClick={async () => { await logout(); navigate('/login'); }}>Logout</Button>
      </HStack>
    </Box>
  );
}
