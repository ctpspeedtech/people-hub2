import { HStack, Box, Heading, Button, Flex } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react/avatar"; // Chakra v3
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

/* =========================
   CONFIG MENU
========================= */
const NAV_ITEMS = [
  { label: "Nhân viên", path: "/admin/employees" },
  { label: "Phòng ban", path: "/admin/departments" },
  { label: "Nghỉ phép", path: "/admin/leaves" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, profile, avatarPath } = useAuthStore();

  const isActive = (path: string) => location.pathname.startsWith(path);

  // Xử lý đăng xuất mượt mà hơn
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <Box 
      bg="white/80" 
      backdropFilter="blur(10px)" // Hiệu ứng làm mờ nền hiện đại
      boxShadow="sm" 
      position="fixed" 
      top={0}
      w="full" 
      zIndex={100}
      borderBottom="1px solid"
      borderColor="gray.100"
    >
      <HStack px={6} py={2} maxW="1400px" mx="auto" justify="space-between">
        
        {/* LOGO */}
        <Flex align="center" gap={8}>
          <Heading 
            size="md" 
            cursor="pointer" 
            bgGradient="to-r" 
            gradientFrom="blue.600" 
            gradientTo="cyan.500" 
            bgClip="text"
            onClick={() => navigate("/admin")}
          >
            People Hub
          </Heading>

          {/* MENU ITEMS (Desktop) */}
          <HStack gap={1}>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                fontWeight={isActive(item.path) ? "bold" : "medium"}
                color={isActive(item.path) ? "blue.600" : "gray.600"}
                bg={isActive(item.path) ? "blue.50" : "transparent"}
                _hover={{ bg: "gray.100", color: "blue.500" }}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </HStack>
        </Flex>

        {/* RIGHT ACTIONS */}
        <HStack gap={4}>
          {/* PROFILE */}
          <HStack 
            as="button"
            gap={3} 
            px={2} 
            py={1} 
            borderRadius="full"
            transition="all 0.2s"
            _hover={{ bg: "gray.100" }}
            onClick={() => navigate("/profile")}
          >
            <Box textAlign="right" display={{ base: "none", md: "block" }}>
              <Box fontSize="xs" fontWeight="bold" color="gray.800">
                {profile?.full_name || "User"}
              </Box>
              <Box fontSize="10px" color="gray.500">
                {profile?.role?.toUpperCase()}
              </Box>
            </Box>
            
            <Avatar.Root size="sm" border="2px solid" borderColor={isActive("/profile") ? "blue.400" : "transparent"}>
              <Avatar.Fallback>
                {(user?.email ?? "U").charAt(0).toUpperCase()}
              </Avatar.Fallback>
              {avatarPath && <Avatar.Image src={avatarPath} />}
            </Avatar.Root>
          </HStack>

          {/* LOGOUT */}
          <Button
            size="xs"
            variant="outline"
            colorPalette="red"
            onClick={handleLogout}
            borderRadius="md"
          >
            Đăng xuất
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
}