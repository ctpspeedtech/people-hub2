import { Box, VStack, Text, Button } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <Box w="220px" bg="gray.800" color="white" p={5}>
      <Text fontSize="xl" fontWeight="bold">
        Admin
      </Text>

      <VStack align="stretch" spacing={3} mt={8}>
        <Button
          as={NavLink}
          to="/admin/dashboard"
          variant="ghost"
          colorScheme="whiteAlpha"
        >
          Dashboard
        </Button>

        <Button
          as={NavLink}
          to="/admin/employees"
          variant="ghost"
          colorScheme="whiteAlpha"
        >
          Employees
        </Button>

        <Button
          as={NavLink}
          to="/admin/reports"
          variant="ghost"
          colorScheme="whiteAlpha"
        >
          Reports
        </Button>
      </VStack>
    </Box>
  );
}
