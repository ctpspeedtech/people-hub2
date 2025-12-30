import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Heading,
  Table,
  Text,
  HStack,
  Input,
  Flex,
  Spacer,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react/avatar";
import { useEmployeeStore } from "../../store/employeeStore";
import { getAvatarUrl, type Employee } from "../../services/employeeService";
import EmployeeModal from "../../components/EmployeeModal";
import { useNavigate } from "react-router-dom";

// Kiểu dữ liệu cho Sort
type SortConfig = {
  key: keyof Employee | "department_name";
  direction: "asc" | "desc";
};

export default function EmployeesPage() {
  const navigate = useNavigate();
  const { employees, fetchAll } = useEmployeeStore();

  const [avatarMap, setAvatarMap] = useState<Record<string, string | null>>({});
  const [query, setQuery] = useState("");

  // 1. State cho Sort
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "full_name",
    direction: "asc"
  });

  const showDetails = useBreakpointValue({ base: false, lg: true });

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const map: Record<string, string | null> = {};
      for (const e of employees) {
        if (!e.avatar_url) map[e.id] = null;
        else if (e.avatar_url.startsWith("http")) map[e.id] = e.avatar_url;
        else map[e.id] = await getAvatarUrl(e.avatar_url, 60).catch(() => null);
      }
      if (mounted) setAvatarMap(map);
    })();
    return () => { mounted = false; };
  }, [employees]);

  // 2. Hàm xử lý khi click vào Header
  const requestSort = (key: SortConfig["key"]) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 3. Logic Lọc và Sắp xếp (Tối ưu trong useMemo)
  const processedData = useMemo(() => {
    // A. Lọc theo query
    const q = query.trim().toLowerCase();
    let result = [...employees];

    if (q) {
      result = result.filter((e) =>
        e.email?.toLowerCase().includes(q) ||
        e.full_name?.toLowerCase().includes(q) ||
        (e.departments?.name ?? "").toLowerCase().includes(q)
      );
    }

    // B. Sắp xếp
    result.sort((a: any, b: any) => {
      let valA, valB;

      // Xử lý trường hợp đặc biệt cho lồng dữ liệu (phòng ban)
      if (sortConfig.key === "department_name") {
        valA = a.departments?.name ?? "";
        valB = b.departments?.name ?? "";
      } else {
        valA = a[sortConfig.key] ?? "";
        valB = b[sortConfig.key] ?? "";
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [employees, query, sortConfig]);

  return (
    <Box p={6}>
      <Flex mb={6} align="center" direction={{ base: "column", md: "row" }} gap={4}>
        <Heading size="lg">Quản lý nhân viên</Heading>
        <Spacer />
        <HStack width={{ base: "full", md: "auto" }} gap={3}>
          <Input
            placeholder="Tìm kiếm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <EmployeeModal onSuccess={fetchAll} text="Thêm nhân viên" />
        </HStack>
      </Flex>

      <Box overflowX="auto" borderRadius="lg" border="1px solid" borderColor="gray.200">
        <Table.Root size="sm" variant="line" interactive>
          <Table.Header bg="gray.50">
            <Table.Row>
              <Table.ColumnHeader w="60px">Avatar</Table.ColumnHeader>

              {/* Thêm Sortable Header */}
              <SortHeader label="Họ tên" sortKey="full_name" config={sortConfig} onSort={requestSort} />
              <SortHeader label="Phòng ban" sortKey="department_name" config={sortConfig} onSort={requestSort} />
              <SortHeader label="Email" sortKey="email" config={sortConfig} onSort={requestSort} />

              {showDetails && (
                <>
                  <SortHeader label="Vị trí" sortKey="position" config={sortConfig} onSort={requestSort} />
                  <SortHeader label="Cấp bậc" sortKey="level" config={sortConfig} onSort={requestSort} />
                  <Table.ColumnHeader>Số điện thoại</Table.ColumnHeader>
                  <Table.ColumnHeader>Ngày sinh</Table.ColumnHeader>
                </>
              )}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {processedData.map((e) => (
              <Table.Row key={e.id} cursor="pointer" onClick={() => navigate(`/admin/employees/${e.id}`)}>
                <Table.Cell>
                  <Avatar.Root size="sm">
                    <Avatar.Image src={avatarMap[e.id] ?? undefined} />
                    <Avatar.Fallback name={e.full_name} />
                  </Avatar.Root>
                </Table.Cell>
                <Table.Cell fontWeight="medium">{e.full_name}</Table.Cell>
                <Table.Cell>{e.departments?.name ?? "-"}</Table.Cell>
                <Table.Cell color="gray.600">{e.email}</Table.Cell>
                {showDetails && (
                  <>
                    <Table.Cell>{e.position ?? "-"}</Table.Cell>
                    <Table.Cell>{e.level ?? "-"}</Table.Cell>
                    <Table.Cell>{e.phone ?? "-"}</Table.Cell>
                    <Table.Cell>{e.birthday ? new Date(e.birthday).toLocaleDateString() : "-"}</Table.Cell>
                  </>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
}

// Component phụ cho Header có Sort
function SortHeader({ label, sortKey, config, onSort }: {
  label: string,
  sortKey: SortConfig["key"],
  config: SortConfig,
  onSort: (key: SortConfig["key"]) => void
}) {
  const isActive = config.key === sortKey;
  return (
    <Table.ColumnHeader
      onClick={() => onSort(sortKey)}
      cursor="pointer"
      userSelect="none"
      _hover={{ color: "blue.500" }}
    >
      <HStack gap={1}>
        <Text fontWeight="bold">{label}</Text>
        <Box color={isActive ? "blue.500" : "gray.300"}>
          {isActive && config.direction === "desc" ? "▼" : "▲"}
        </Box>
      </HStack>
    </Table.ColumnHeader>
  );
}
