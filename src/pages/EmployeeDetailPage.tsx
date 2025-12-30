import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  SimpleGrid,
  Button,
  HStack,
  Image,
  Stack,
  Circle,
  Dialog,
  Separator,
  Card,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useEmployeeStore } from "../store/employeeStore";
import { getAvatarUrl } from "../services/employeeService";
import EmployeeModal from "../components/EmployeeModal";
import { useAuthStore } from "../store/authStore";
import ChangePasswordForm from "../components/ChangePasswordForm";
import { ArrowLeft, Edit, Trash2, ShieldCheck, Mail, MapPin } from "lucide-react";

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { employees, fetchAll, remove, loading: loadingStore } = useEmployeeStore();
  const { user, isAdmin } = useAuthStore();

  const [avatar, setAvatar] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const currentId = id || user?.id;

  const employee = useMemo(() =>
    employees.find((x) => x.id === currentId),
    [employees, currentId]
  );

  useEffect(() => {
    if (!employees.length) fetchAll();
  }, [employees.length, fetchAll]);

  // Tối ưu xử lý Avatar: Tránh reload liên tục
  useEffect(() => {
    if (!employee?.avatar_url) {
      setAvatar(null);
      return;
    }

    if (employee.avatar_url.startsWith("http")) {
      setAvatar(employee.avatar_url);
    } else {
      getAvatarUrl(employee.avatar_url, 200)
        .then(setAvatar)
        .catch(() => setAvatar(null));
    }
  }, [employee?.avatar_url]);

  const handleDelete = async () => {
    if (!employee) return;
    try {
      await remove(employee.id);
      setIsDeleteOpen(false);
      navigate("/admin/employees");
    } catch (error) {
      console.error("Xóa thất bại", error);
    }
  };

  if (loadingStore && !employee) {
    return (
      <Box h="60vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="blue.500" borderWidth="4px" />
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box p={20} textAlign="center">
        <Text mb={4} fontSize="lg" color="gray.500">Thông tin nhân viên không tồn tại hoặc đã bị xóa.</Text>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </Box>
    );
  }

  const isMyProfile = user?.id === employee.id;

  return (
    <Box p={6} maxW="1000px" mx="auto">
      {/* Nút quay lại & Action chính */}
      <HStack mb={8} justify="space-between">
        <Button variant="ghost" onClick={() => navigate(-1)} gap={2}>
          <ArrowLeft size={18} /> Quay lại
        </Button>
        <HStack gap={3}>
          {(isMyProfile || isAdmin) && (
            <EmployeeModal
              employee={employee}
              text="Chỉnh sửa hồ sơ"
              onSuccess={() => fetchAll()}
            />
          )}
        </HStack>
      </HStack>

      <Stack gap={8}>
        {/* Profile Header Card */}
        <Card.Root variant="outline" overflow="hidden">
          <Card.Body p={8}>
            <HStack gap={8} align="center" direction={{ base: "column", md: "row" }}>
              {avatar ? (
                <Image
                  src={avatar}
                  alt={employee.full_name}
                  boxSize="140px"
                  objectFit="cover"
                  borderRadius="2xl"
                  shadow="md"
                />
              ) : (
                <Circle size="140px" bg="blue.50" color="blue.500" fontSize="5xl" fontWeight="bold">
                  {employee.full_name?.charAt(0).toUpperCase()}
                </Circle>
              )}

              <Stack gap={2} flex="1">
                <HStack>
                  <Heading size="2xl">{employee.full_name}</Heading>
                  {isAdmin && <ShieldCheck size={20} color="var(--chakra-colors-blue-500)" />}
                </HStack>
                <HStack color="gray.600">
                  <Mail size={16} /> <Text>{employee.email}</Text>
                </HStack>
                <HStack color="blue.600" fontWeight="bold">
                  <Text>{employee.departments?.name || "Tự do"}</Text>
                  <Separator orientation="vertical" h="4" />
                  <Text>{employee.position}</Text>
                </HStack>
              </Stack>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Thông tin chi tiết Grid */}
        <Box>
          <Heading size="md" mb={4}>Thông tin cá nhân</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <DetailField label="Cấp bậc" value={employee.level} />
            <DetailField label="Số điện thoại" value={employee.phone} />
            <DetailField label="Ngày sinh" value={employee.birthday} />
            <DetailField label="Trình độ học vấn" value={employee.education} />
            <DetailField label="Địa chỉ" value={employee.address} icon={<MapPin size={14} />} />
            <DetailField label="Ghi chú" value={employee.note}/>
            {/* <DetailField label="Ghi chú" value={employee.note} span={2} /> */}
          </SimpleGrid>
        </Box>

        {/* Bảo mật & Xóa */}
        <Stack gap={4} pt={4}>
          <Separator />
          <Heading size="md">Bảo mật & Quản lý</Heading>

          <HStack gap={4} flexWrap="wrap">
            {isMyProfile && (
              <Button
                variant="subtle"
                colorPalette="blue"
                onClick={() => setShowChangePassword(!showChangePassword)}
              >
                {showChangePassword ? "Hủy thay đổi" : "Đổi mật khẩu"}
              </Button>
            )}

            {isAdmin && !isMyProfile && (
              <Dialog.Root open={isDeleteOpen} onOpenChange={(e) => setIsDeleteOpen(e.open)}>
                <Dialog.Trigger asChild>
                  <Button variant="outline" colorPalette="red">
                    <Trash2 size={16} style={{ marginRight: '8px' }} /> Xóa nhân viên
                  </Button>
                </Dialog.Trigger>
                <Dialog.Positioner>
                  <Dialog.Content>
                    <Dialog.Header>Xác nhận xóa</Dialog.Header>
                    <Dialog.Body>
                      Hành động này sẽ xóa vĩnh viễn dữ liệu của <strong>{employee.full_name}</strong>.
                    </Dialog.Body>
                    <Dialog.Footer>
                      <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
                      <Button colorPalette="red" onClick={handleDelete} loading={loadingStore}>Xóa vĩnh viễn</Button>
                    </Dialog.Footer>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Dialog.Root>
            )}
          </HStack>

          {showChangePassword && (
            <Box p={6} borderRadius="xl" bg="gray.50" border="1px dashed" borderColor="blue.200">
              <ChangePasswordForm onSuccess={() => setShowChangePassword(false)} />
            </Box>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

function DetailField({ label, value, span, icon }: { label: string; value?: string | null; span?: number, icon?: React.ReactNode }) {
  return (
    <Card.Root variant="subtle" gridColumn={span ? { md: `span ${span}` } : "auto"}>
      <Card.Body p={4}>
        <HStack gap={1} mb={1}>
          {icon && <Box color="gray.400">{icon}</Box>}
          <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
            {label}
          </Text>
        </HStack>
        <Text fontWeight="medium" fontSize="md">{value || "-"}</Text>
      </Card.Body>
    </Card.Root>
  );
}
