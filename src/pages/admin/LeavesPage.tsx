import { useEffect, useState } from "react";
import {
  Box,
  Table,
  Spinner,
  Button,
  Heading,
  Flex,
  Spacer,
  Text,
  NativeSelect,
  Badge,
  Field,
  Input,
  Stack,
  Dialog,
} from "@chakra-ui/react";
import { useLeaveStore } from "../../store/leaveStore";
import { useAuthStore } from "../../store/authStore";

export default function LeavesPage() {
  const [filterStatus, setFilterStatus] = useState<string>("");
  const {
    leaves,
    fetchLeaves,
    updateLeave,
    removeLeave,
    loading,
    addLeave,
    employees,
    fetchEmployees,
  } = useLeaveStore();
  const { isAdmin, user } = useAuthStore();

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    fetchLeaves();
    if (isAdmin) fetchEmployees();

    if (user) setFormData((prev) => ({ ...prev, employeeId: user.id }));
  }, [fetchLeaves, fetchEmployees, isAdmin, user]);

  const handleCreate = async () => {
    if (!formData.employeeId && user) formData.employeeId = user.id;
    await addLeave(formData);
    setOpen(false);
    // Reset form sau khi tạo
    setFormData({
      employeeId: user?.id || "",
      startDate: "",
      endDate: "",
      reason: "",
    });
  };

  const filteredLeaves = filterStatus
    ? leaves.filter((l) => l.status === filterStatus)
    : leaves;

  return (
    <Box p="6">
      <Flex mb="6" align="center" gap="4">
        <Heading size="lg">Quản lý nghỉ phép</Heading>
        <Spacer />

        {/* Lọc trạng thái */}
        <NativeSelect.Root width="200px">
          <NativeSelect.Field
            placeholder="Tất cả trạng thái"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>

        {/* --- PHẦN SỬA LỖI: Thêm Dialog.Trigger để hiện Button --- */}
        <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
          <Dialog.Trigger asChild>
            <Button colorPalette="blue">Tạo đơn mới</Button>
          </Dialog.Trigger>
          
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Tạo đơn nghỉ phép</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap="4">
                  {isAdmin && (
                    <Field.Root>
                      <Field.Label>Chọn nhân viên</Field.Label>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          value={formData.employeeId}
                          onChange={(e) =>
                            setFormData({ ...formData, employeeId: e.target.value })
                          }
                        >
                          <option value="">-- Chọn nhân viên --</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.full_name}
                            </option>
                          ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Field.Root>
                  )}

                  <Field.Root>
                    <Field.Label>Ngày bắt đầu</Field.Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Ngày kết thúc</Field.Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Lý do</Field.Label>
                    <Input
                      placeholder="Nhập lý do..."
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                    />
                  </Field.Root>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Hủy</Button>
                </Dialog.ActionTrigger>
                <Button onClick={handleCreate} loading={loading}>Gửi đơn</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </Flex>

      {/* --- PHẦN TABLE --- */}
      {loading && leaves.length === 0 ? (
        <Flex justify="center" p="10">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box border="1px solid" borderColor="border.subtle" borderRadius="md" overflow="hidden">
          <Table.Root variant="line" interactive>
            <Table.Header>
              <Table.Row bg="bg.muted">
                <Table.ColumnHeader>Nhân viên</Table.ColumnHeader>
                <Table.ColumnHeader>Thời gian</Table.ColumnHeader>
                <Table.ColumnHeader>Lý do</Table.ColumnHeader>
                <Table.ColumnHeader>Trạng thái</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Thao tác</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredLeaves.map((leave) => (
                <Table.Row key={leave.id}>
                  <Table.Cell fontWeight="medium">{leave.employeeName}</Table.Cell>
                  <Table.Cell>
                    <Text fontSize="sm">{leave.startDate}</Text>
                    <Text fontSize="xs" color="fg.muted">đến {leave.endDate}</Text>
                  </Table.Cell>
                  <Table.Cell>{leave.reason}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      colorPalette={
                        leave.status === "approved" ? "green" : 
                        leave.status === "rejected" ? "red" : "orange"
                      }
                      variant="surface"
                    >
                      {leave.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2" justify="flex-end">
                      {isAdmin && leave.status === "pending" && (
                        <>
                          <Button
                            size="xs"
                            colorPalette="green"
                            onClick={() => updateLeave(leave.id, { status: "approved" })}
                          >
                            Duyệt
                          </Button>
                          <Button
                            size="xs"
                            colorPalette="red"
                            onClick={() => updateLeave(leave.id, { status: "rejected" })}
                          >
                            Từ chối
                          </Button>
                        </>
                      )}
                      <Button
                        size="xs"
                        variant="ghost"
                        colorPalette="gray"
                        onClick={() => removeLeave(leave.id)}
                      >
                        Xóa
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {!loading && filteredLeaves.length === 0 && (
        <Text textAlign="center" py="10" color="fg.muted">Không có đơn nghỉ phép nào.</Text>
      )}
    </Box>
  );
}