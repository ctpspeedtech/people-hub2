import {
  HStack,
  Box,
  Heading,
  Button,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Box bg="white" boxShadow="sm">
      <HStack px={6} py={3} >
        <Heading size="xl">People Hub</Heading>
        <Box w={5}></Box>
        <Button
          onClick={()=>{
            navigate("/admin/employees")
          }}
          variant="ghost"
          color={isActive("/admin/employees") ? "blue.600" : undefined}
        >
          Employees
        </Button>

        <Button
                  onClick={()=>{
            navigate("/admin/departments")
          }}
          variant="ghost"
          color={isActive("/admin/departments") ? "blue.600" : undefined}
        >
          Departments
        </Button>
        <Box flex="1" />
        <Button
          size="sm"
          variant="ghost"
          color={"red"}
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
        >
          Logout
        </Button>
      </HStack>
    </Box>
  );
}
