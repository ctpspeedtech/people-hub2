import { useState, useEffect, type ChangeEvent } from "react";
import {
  Button,
  Input,
  Stack,
  Box,
  Text,
  Image,
  Dialog,
  SimpleGrid,
  Field,
  Separator,
  Portal,
} from "@chakra-ui/react";
import { toaster } from "../lib/toaster";
import { Upload, ShieldCheck } from "lucide-react";

import type { Employee as EmployeeType } from "../services/employeeService";
import { createEmployee, updateEmployee, uploadAvatar } from "../services/employeeService";
import { departmentService } from "../services/departmentService";

interface Props {
  onSuccess?: () => void;
  onClose?: () => void;
  employee?: EmployeeType | null;
  text: string;
  [key: string]: any;
}

const INITIAL_FORM = {
  email: "",
  full_name: "",
  phone: "",
  position: "",
  level: "",
  birthday: "",
  address: "",
  education: "",
  note: "",
  department_id: "",
  role: "employee", // Mặc định là nhân viên
};

export default function EmployeeModal({ onSuccess, onClose, employee, text, ...props }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // Load danh sách phòng ban khi mở modal
      departmentService.getAll().then((d) => setDepartments(d || []));

      if (employee) {
        setForm({
          email: employee.email || "",
          full_name: employee.full_name || "",
          phone: employee.phone || "",
          position: employee.position || "",
          level: employee.level || "",
          birthday: employee.birthday || "",
          address: employee.address || "",
          education: employee.education || "",
          note: employee.note || "",
          department_id: employee.departments?.id || "",
          role: employee.role || "employee",
        });
        setAvatarPreview(employee.avatar_url || null);
      } else {
        setForm(INITIAL_FORM);
        setAvatarPreview(null);
      }
    }
  }, [open, employee]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const toastId = toaster.create({ title: "Đang xử lý...", type: "loading" });

    try {
      // Loại bỏ các trường rỗng trước khi gửi
      const payload: any = Object.fromEntries(
        Object.entries(form).filter(([_, v]) => v !== "")
      );

      let targetId = employee?.id;

      if (employee) {
        if (avatarFile) {
          const res = await uploadAvatar(avatarFile, employee.id);
          payload.avatar_url = res.path;
        }
        await updateEmployee(employee.id, payload);
      } else {
        payload.password = "123456"; // Mật khẩu mặc định
        const created = await createEmployee(payload);
        targetId = created.id;
        if (avatarFile && targetId) {
          const res = await uploadAvatar(avatarFile, targetId);
          await updateEmployee(targetId, { avatar_url: res.path });
        }
      }

      toaster.update(toastId, { title: "Thành công!", type: "success" });
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toaster.update(toastId, {
        title: "Lỗi",
        description: error?.message || "Không thể lưu thông tin",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)} size="lg">
      <Dialog.Trigger asChild>
        <Button size="sm" colorPalette="blue" {...props}>{text}</Button>
      </Dialog.Trigger>

      {/* Portal giúp đưa Modal ra khỏi luồng render thông thường để không làm vỡ layout */}
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="xl" boxShadow="2xl">
            <Dialog.Header>
              <Dialog.Title>
                {employee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Stack gap={6}>
                {/* Avatar Section */}
                <Box display="flex" alignItems="center" gap={4}>
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      boxSize="80px"
                      borderRadius="full"
                      objectFit="cover"
                      border="2px solid"
                      borderColor="blue.500"
                    />
                  ) : (
                    <Box boxSize="80px" borderRadius="full" bg="gray.100" display="flex" alignItems="center" justifyContent="center" fontSize="2xl" color="gray.400" fontWeight="bold">
                      {form.full_name?.charAt(0) || "?"}
                    </Box>
                  )}
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>Ảnh đại diện</Text>
                    <label style={{ cursor: 'pointer' }}>
                      <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                      <Button as="span" size="xs" variant="outline" gap={2}>
                        <Upload size={14} /> Tải ảnh lên
                      </Button>
                    </label>
                  </Box>
                </Box>

                <Separator />

                {/* Thông tin chính */}
                <SimpleGrid columns={2} gap={4}>
                  <Field.Root>
                    <Field.Label>Họ tên <Text as="span" color="red.500">*</Text></Field.Label>
                    <Input name="full_name" value={form.full_name} onChange={handleInputChange} />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Email <Text as="span" color="red.500">*</Text></Field.Label>
                    <Input name="email" type="email" value={form.email} onChange={handleInputChange} />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Số điện thoại</Field.Label>
                    <Input name="phone" value={form.phone} onChange={handleInputChange} />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Vị trí</Field.Label>
                    <Input name="position" value={form.position} onChange={handleInputChange} />
                  </Field.Root>
                </SimpleGrid>

                {/* Phân quyền & Phòng ban */}
                <SimpleGrid columns={2} gap={4} p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.100">
                  <Field.Root>
                    <Field.Label display="flex" alignItems="center" gap={2}>
                       <ShieldCheck size={14} /> Vai trò hệ thống
                    </Field.Label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '14px', background: 'white' }}
                    >
                      <option value="employee">Nhân viên (Employee)</option>
                      <option value="admin">Quản trị viên (Admin)</option>
                    </select>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Phòng ban</Field.Label>
                    <select
                      name="department_id"
                      value={form.department_id}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '14px', background: 'white' }}
                    >
                      <option value="">-- Chọn phòng ban --</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </Field.Root>
                </SimpleGrid>

                {/* Thông tin bổ sung */}
                <SimpleGrid columns={2} gap={4}>
                  <Field.Root>
                    <Field.Label>Cấp bậc</Field.Label>
                    <Input name="level" value={form.level} onChange={handleInputChange} />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Ngày sinh</Field.Label>
                    <Input name="birthday" type="date" value={form.birthday} onChange={handleInputChange} />
                  </Field.Root>
                </SimpleGrid>

                <Field.Root>
                  <Field.Label>Địa chỉ</Field.Label>
                  <Input name="address" value={form.address} onChange={handleInputChange} />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Ghi chú</Field.Label>
                  <Input name="note" value={form.note} onChange={handleInputChange} />
                </Field.Root>
              </Stack>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="ghost">Hủy</Button>
              </Dialog.ActionTrigger>
              <Button onClick={handleSubmit} loading={loading} colorPalette="blue">
                {employee ? "Lưu thay đổi" : "Tạo nhân viên"}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
