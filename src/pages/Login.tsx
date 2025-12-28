import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  Text,
} from '@chakra-ui/react';

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      alert('Login successful');
    } catch (e: any) {
      alert(e.message || 'Login failed');
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Box w={{ base: '100%', sm: '420px' }} bg="white" p={8} rounded="lg" shadow="sm">
        <Heading size="lg" mb={6} textAlign="center">Sign in to your account</Heading>

        <VStack as="form" gap={4} onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <Box width="100%">
            <Text mb={1} fontSize="sm" color="gray.600">Email</Text>
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </Box>

          <Box width="100%">
            <Text mb={1} fontSize="sm" color="gray.600">Password</Text>
            <Input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Box>

          <Button colorScheme="blue" width="full" mt={2} onClick={handleLogin} loading={loading} type="submit">
            Login
          </Button>
        </VStack>

        <Text mt={4} fontSize="sm" color="gray.500" textAlign="center">Need an account? Ask your administrator to create one.</Text>
      </Box>
    </Box>
  );
}
