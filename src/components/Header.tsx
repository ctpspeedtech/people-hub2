import {
  Flex,
  Text,
  Button,
  Avatar,
  HStack,
} from "@chakra-ui/react";
import { useAuthStore } from "../store/authStore";

export default function Header() {
  const { profile, logout } = useAuthStore();

  return (
    <Flex
      h="60px"
      px={6}
      align="center"
      justify="space-between"
      borderBottom="1px"
      borderColor="gray.200"
    >
      <Text fontWeight="medium">
        Welcome, {profile?.full_name}
      </Text>

      <HStack spacing={4}>
        <Avatar
          size="sm"
          name={profile?.full_name}
          src={profile?.avatar_url}
        />
        <Button size="sm" onClick={logout}>
          Logout
        </Button>
      </HStack>
    </Flex>
  );
}
