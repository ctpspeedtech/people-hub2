import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Flex,
  HStack,
  VStack,
  Badge,
  Button,
  Spinner,
} from "@chakra-ui/react";
// Import Avatar chuẩn của Chakra v3
import { Avatar } from "@chakra-ui/react/avatar"; 
import { Progress } from "@chakra-ui/react/progress";
import { useNavigate } from "react-router-dom";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

import { useEmployeeStore } from "../../store/employeeStore";
import { useDepartmentStore } from "../../store/departmentStore";
import { useLeaveStore } from "../../store/leaveStore";
import { getAvatarUrl } from "../../services/employeeService";
import { getStorageUsageMB } from "../../services/adminService";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const navigate = useNavigate();
  
  const { employees, fetchAll: fetchEmployees, loading: empLoading } = useEmployeeStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  const { leaves, fetchLeaves } = useLeaveStore();

  const [storageUsedMB, setStorageUsedMB] = useState<number | null>(null);
  const [avatarMap, setAvatarMap] = useState<Record<string, string | null>>({});

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchLeaves();
    getStorageUsageMB().then(setStorageUsedMB).catch(() => setStorageUsedMB(null));
  }, [fetchEmployees, fetchDepartments, fetchLeaves]);

  useEffect(() => {
    (async () => {
      const map: Record<string, string | null> = {};
      // Chỉ lấy avatar cho các nhân viên có đơn pending để tối ưu
      const pendingEmployeeIds = leaves
        .filter(l => l.status === "pending")
        .map(l => l.employeeId);

      for (const e of employees) {
        if (pendingEmployeeIds.includes(e.id)) {
          if (e.avatar_url?.startsWith("http")) {
            map[e.id] = e.avatar_url;
          } else if (e.avatar_url) {
            map[e.id] = await getAvatarUrl(e.avatar_url, 60).catch(() => null);
          }
        }
      }
      setAvatarMap(map);
    })();
  }, [employees, leaves]);

  const leaveStats = useMemo(() => {
    const approved = leaves.filter((l) => l.status === "approved").length;
    const pending = leaves.filter((l) => l.status === "pending").length;
    const rejected = leaves.filter((l) => l.status === "rejected").length;
    return {
      datasets: [{
        data: [approved, pending, rejected],
        backgroundColor: ["#38A169", "#DD6B20", "#E53E3E"],
        borderWidth: 0,
      }],
      labels: ["Đã duyệt", "Chờ duyệt", "Từ chối"],
    };
  }, [leaves]);

  if (empLoading && employees.length === 0) {
    return (
      <Flex h="80vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Box mb={8}>
        <Heading size="lg">Dashboard</Heading>
        <Text color="gray.500">Dữ liệu cập nhật thời gian thực</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 4 }} gap={6} mb={8}>
        <StatCard label="Nhân viên" value={employees.length} color="blue.600" onClick={() => navigate("/admin/employees")} />
        <StatCard label="Phòng ban" value={departments.length} color="purple.600" onClick={() => navigate("/admin/departments")} />
        <StatCard label="Đơn nghỉ phép" value={leaves.length} color="orange.600" onClick={() => navigate("/admin/leaves")} />
        <StatCard label="Dung lượng" value={`${storageUsedMB ?? 0} MB`} color="teal.600" />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
        <Box p={5} bg="white" borderRadius="xl" shadow="sm" borderWidth="1px">
          <Heading size="md" mb={6}>Tình trạng nghỉ phép</Heading>
          <Box h="230px" display="flex" justifyContent="center">
            {leaves.length > 0 ? (
              <Doughnut data={leaveStats} options={{ maintainAspectRatio: false }} />
            ) : (
              <Text color="gray.400" alignSelf="center">Chưa có dữ liệu</Text>
            )}
          </Box>
        </Box>

        <Box p={5} bg="white" borderRadius="xl" shadow="sm" borderWidth="1px">
          <Heading size="md" mb={6}>Cơ cấu nhân sự</Heading>
          <VStack align="stretch" gap={5}>
            {departments.slice(0, 5).map((d) => {
              const count = employees.filter((e) => e.departments?.id === d.id).length;
              const percent = (count / (employees.length || 1)) * 100;
              return (
                <Box key={d.id}>
                  <Flex justify="space-between" mb={1} fontSize="sm">
                    <Text fontWeight="medium">{d.name}</Text>
                    <Text color="gray.500">{count} người</Text>
                  </Flex>
                  <Progress.Root value={percent} size="xs" colorPalette="blue">
                    <Progress.Track><Progress.Range /></Progress.Track>
                  </Progress.Root>
                </Box>
              );
            })}
          </VStack>
        </Box>

        <Box p={5} bg="white" borderRadius="xl" shadow="sm" borderWidth="1px">
          <Flex justify="space-between" mb={6}>
            <Heading size="md">Đơn chờ duyệt</Heading>
            <Button size="xs" variant="ghost" onClick={() => navigate("/admin/leaves")}>Xem tất cả</Button>
          </Flex>
          <VStack align="stretch" gap={4}>
            {leaves.filter(l => l.status === "pending").slice(0, 5).map((l) => (
              <HStack key={l.id} justify="space-between">
                <HStack gap={3}>
                  {/* Sử dụng avatarMap ở đây để fix lỗi unused variable */}
                  <Avatar.Root size="sm">
                    <Avatar.Image src={avatarMap[l.employeeId] || undefined} />
                    <Avatar.Fallback name={l.employeeName} />
                  </Avatar.Root>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold">{l.employeeName}</Text>
                    <Text fontSize="xs" color="gray.500">{l.startDate}</Text>
                  </Box>
                </HStack>
                <Badge colorPalette="orange" variant="surface">Pending</Badge>
              </HStack>
            ))}
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

function StatCard({ label, value, color, onClick }: any) {
  return (
    <Box
      p={5} bg="white" borderRadius="xl" shadow="sm" borderWidth="1px"
      cursor={onClick ? "pointer" : "default"}
      onClick={onClick}
      _hover={onClick ? { bg: "gray.50" } : {}}
    >
      <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={2}>{label}</Text>
      <Heading size="xl" color={color}>{value}</Heading>
    </Box>
  );
}