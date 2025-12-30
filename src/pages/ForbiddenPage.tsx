import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Box p={6}>
        <Heading mb={4}>403 - Forbidden</Heading>
        <Text mb={6}>Bạn không có quyền truy cập trang này.</Text>
        <Button onClick={() => navigate("/")}>Quay về trang chủ</Button>
      </Box>
    </Box>
  );
}
