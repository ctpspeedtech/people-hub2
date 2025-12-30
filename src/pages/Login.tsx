import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  VStack, 
  Heading, 
  Input, 
  Button, 
  Text, 
  Card, 
  Stack, 
  Separator,
  Flex
} from "@chakra-ui/react";
import { toaster } from "../lib/toaster";
import { LogIn, Mail, Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!email || !password) {
      toaster.create({
        title: "Thông tin không đầy đủ",
        type: "error",
      });
      return;
    }

    try {
      await login(email, password);
    } catch (e: any) {
      toaster.create({
        title: "Lỗi đăng nhập",
        description: e.message || "Email hoặc mật khẩu không chính xác",
        type: "error",
      });
    }
  };

  return (
    <Flex
      minH="100vh"
      bgGradient="to-br"
      gradientFrom="blue.50"
      gradientTo="white"
      align="center"
      justify="center"
      p={4}
    >
      <Card.Root 
        w={{ base: "full", sm: "420px" }} 
        shadow="xl" 
        border="none" 
      >
        <Box bg="blue.600" h="1.5" />
        <Card.Body p={8}>
          <VStack gap={2} mb={8} textAlign="center">
            <Flex bg="blue.50" p={3} borderRadius="full" color="blue.600" mb={2}>
              <LogIn size={28} />
            </Flex>
            <Heading size="xl">People Hub</Heading>
            <Text color="gray.500" fontSize="sm">Đăng nhập hệ thống quản trị</Text>
          </VStack>

          <Stack as="form" gap={5} onSubmit={handleLogin}>
            <Box>
              <Text mb={1.5} fontSize="xs" fontWeight="bold" color="gray.700">EMAIL</Text>
              <Flex align="center" position="relative">
                <Box position="absolute" left={3} color="gray.400" zIndex={10}>
                  <Mail size={18} />
                </Box>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  ps={10} // ps = padding-inline-start (thay cho pl)
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  // Sử dụng _focus thay vì focusBorderColor trong v3
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                />
              </Flex>
            </Box>

            <Box>
              <Text mb={1.5} fontSize="xs" fontWeight="bold" color="gray.700">MẬT KHẨU</Text>
              <Flex align="center" position="relative">
                <Box position="absolute" left={3} color="gray.400" zIndex={10}>
                  <Lock size={18} />
                </Box>
                <Input
                  type="password"
                  placeholder="••••••••"
                  ps={10}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                />
              </Flex>
            </Box>

            <Button
              colorPalette="blue"
              size="lg"
              width="full"
              mt={2}
              loading={loading}
              type="submit"
            >
              Đăng nhập
            </Button>
          </Stack>

          <Separator my={8} />

          <Text fontSize="xs" color="gray.400" textAlign="center">
            Liên hệ <strong>Quản trị viên</strong> để cấp tài khoản.
          </Text>
        </Card.Body>
      </Card.Root>
    </Flex>
  );
}