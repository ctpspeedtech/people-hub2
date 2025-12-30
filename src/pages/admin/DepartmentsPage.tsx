import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Button,
  Input,
  HStack,
  VStack,
  Text,
  Dialog,
  Flex,
  Spacer,
  IconButton,
  Card,
  Spinner,
} from "@chakra-ui/react";
// Import icons sau khi đã cài lucide-react
import { Edit2, Trash2, Plus, Check } from "lucide-react";
import { useDepartmentStore } from "../../store/departmentStore";
import { toaster } from "../../lib/toaster";

export default function DepartmentsPage() {
  const { 
    departments, 
    loading, 
    fetchDepartments, 
    createDepartment, 
    updateDepartment, 
    removeDepartment 
  } = useDepartmentStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
    setShowCreate(false);
  };

  const handleEdit = (d: any) => {
    setEditingId(d.id);
    setName(d.name);
    setDescription(d.description || "");
    setShowCreate(false);
  };

  const save = async () => {
    if (!name.trim()) {
      toaster.create({ title: "Tên phòng ban là bắt buộc", type: "error" });
      return;
    }

    setIsSubmitting(true);
    const toastId = toaster.create({
      title: editingId ? "Đang cập nhật..." : "Đang tạo...",
      type: "loading",
    });

    try {
      if (editingId) {
        await updateDepartment(editingId, { name, description });
        toaster.update(toastId, { title: "Cập nhật thành công", type: "success" });
      } else {
        await createDepartment({ name, description });
        toaster.update(toastId, { title: "Tạo mới thành công", type: "success" });
      }
      resetForm();
    } catch (e) {
      toaster.update(toastId, { title: "Thao tác thất bại", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const toastId = toaster.create({ title: "Đang xóa...", type: "loading" });
    try {
      await removeDepartment(deleteId);
      toaster.update(toastId, { title: "Đã xóa phòng ban", type: "success" });
      setDeleteId(null);
    } catch (e) {
      toaster.update(toastId, { title: "Xóa thất bại", type: "error" });
    }
  };

  return (
    <Box p={6} maxW="1000px" mx="auto">
      <Flex mb={6} align="center">
        <Box>
          <Heading size="lg">Phòng ban</Heading>
          <Text color="gray.500" fontSize="sm">Quản lý cơ cấu tổ chức công ty</Text>
        </Box>
        <Spacer />
        {!showCreate && !editingId && (
          <Button colorPalette="blue" onClick={() => setShowCreate(true)}>
            <Plus size={16} style={{ marginRight: '8px' }} /> Thêm phòng ban
          </Button>
        )}
      </Flex>

      {/* FORM TẠO/SỬA */}
      {(showCreate || editingId) && (
        <Card.Root mb={6} variant="outline" borderColor="blue.200" bg="blue.50/30">
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Heading size="sm">{editingId ? "Chỉnh sửa phòng ban" : "Tạo phòng ban mới"}</Heading>
              <HStack gap={4} width="full">
                <Input
                  bg="white"
                  placeholder="Tên phòng ban"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  bg="white"
                  placeholder="Mô tả"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </HStack>
              <HStack justify="flex-end">
                <Button variant="ghost" onClick={resetForm} disabled={isSubmitting}>Hủy</Button>
                <Button colorPalette="blue" onClick={save} loading={isSubmitting}>
                  <Check size={16} style={{ marginRight: '8px' }} /> Lưu thay đổi
                </Button>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* DANH SÁCH PHÒNG BAN */}
      <VStack align="stretch" gap={4}>
        {loading && departments.length === 0 ? (
          <Flex justify="center" py={10}><Spinner /></Flex>
        ) : departments.length === 0 ? (
          <Card.Root variant="outline" py={10} textAlign="center" borderStyle="dashed">
            <Card.Body>
              <Text color="gray.500">Chưa có dữ liệu phòng ban.</Text>
            </Card.Body>
          </Card.Root>
        ) : (
          departments.map((d) => (
            <Card.Root key={d.id} size="sm" _hover={{ shadow: "md", borderColor: "blue.200" }}>
              <Card.Body>
                <Flex align="center">
                  <Box>
                    <Text fontWeight="bold" fontSize="md" color="blue.700">{d.name}</Text>
                    <Text fontSize="sm" color="gray.600">{d.description || "Chưa có mô tả"}</Text>
                  </Box>
                  <Spacer />
                  <HStack gap={2}>
                    <IconButton
                      aria-label="Edit"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(d)}
                    >
                      <Edit2 size={16} />
                    </IconButton>
                    <IconButton
                      aria-label="Delete"
                      variant="ghost"
                      size="sm"
                      colorPalette="red"
                      onClick={() => setDeleteId(d.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </HStack>
                </Flex>
              </Card.Body>
            </Card.Root>
          ))
        )}
      </VStack>

      {/* DIALOG XÁC NHẬN XÓA */}
      <Dialog.Root open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Xác nhận xóa</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              Bạn có chắc chắn muốn xóa phòng ban này? Hành động này không thể hoàn tác.
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Hủy</Button>
              <Button colorPalette="red" onClick={confirmDelete} ml={3}>Xác nhận xóa</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}