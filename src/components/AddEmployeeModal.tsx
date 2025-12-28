import { Button, Input, Stack, Dialog } from "@chakra-ui/react";
import { useState } from "react";
import { supabase } from "../lib/supabase";

// Thêm interface để quản lý props
interface Props {
  onSuccess?: () => void;
  [key: string]: any; // Cho phép nhận các props khác như mt, mb...
}

export default function AddEmployeeModal({ onSuccess, ...props }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    phone: "",
    position: "",
    level: "",
  });

  const submit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-employee", {
        body: {
          ...form,
          password: "123456", // Password mặc định
        },
      });

      if (error) throw error;

      // Reset form và đóng modal
      setForm({ email: "", full_name: "", phone: "", position: "", level: "" });
      setOpen(false);

      // Gọi callback để load lại danh sách ở trang EmployeesPage
      if (onSuccess) onSuccess();

    } catch (error: any) {
      alert("Error: " + (error.message || "Could not create employee"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>
        <Button colorScheme="blue" {...props}>Add Employee</Button>
      </Dialog.Trigger>

      <Dialog.Content>
        <Dialog.Header>Add New Employee</Dialog.Header>

        <Dialog.Body>
          <Stack gap={4}>
            <Input
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
            <Input
              placeholder="Full name"
              value={form.full_name}
              onChange={e => setForm({...form, full_name: e.target.value})}
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})}
            />
            <Input
              placeholder="Position"
              value={form.position}
              onChange={e => setForm({...form, position: e.target.value})}
            />
            <Input
              placeholder="Level"
              value={form.level}
              onChange={e => setForm({...form, level: e.target.value})}
            />
          </Stack>
        </Dialog.Body>

        <Dialog.Footer>
          <Button variant="outline" mr={3} onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} loading={loading} colorScheme="blue">
            Create
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
