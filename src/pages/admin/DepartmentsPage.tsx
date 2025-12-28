import { useEffect, useState } from "react";
import { Box, Heading, Button, Input, HStack, VStack, Text } from "@chakra-ui/react";
import { useDepartmentStore } from "../../store/departmentStore";

export default function DepartmentsPage() {
  const departments = useDepartmentStore((s) => s.departments);
  const loading = useDepartmentStore((s) => s.loading);
  const fetchDepartments = useDepartmentStore((s) => s.fetchDepartments);
  const createDepartment = useDepartmentStore((s) => s.createDepartment);
  const updateDepartment = useDepartmentStore((s) => s.updateDepartment);
  const removeDepartment = useDepartmentStore((s) => s.removeDepartment);

  const [editing, setEditing] = useState<{ id?: string; name: string; description?: string } | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    if (editing) {
      setName(editing.name || "");
      setDescription(editing.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [editing]);

  const save = async () => {
    if (!name.trim()) return alert('Name is required');
    if (editing && editing.id) {
      await updateDepartment(editing.id, { name, description });
      setEditing(null);
    } else {
      await createDepartment({ name, description });
    }
    setName("");
    setDescription("");
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Departments</Heading>
      <HStack mb={4} gap={3}>
        {(editing || showCreate) ? (
          <>
            <Input placeholder="Department name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button colorScheme="blue" onClick={save}>{editing ? 'Save' : 'Create'}</Button>
            <Button variant="outline" onClick={() => {
              if (editing) setEditing(null);
              setShowCreate(false);
            }}>Cancel</Button>
          </>
        ) : (
          <Button colorScheme="blue" onClick={() => setShowCreate(true)}>Create Department</Button>
        )}
      </HStack>

      <VStack align="stretch" gap={3}>
        {loading && departments.length === 0 ? (
          <Text>Loading...</Text>
        ) : departments.length === 0 ? (
          <Text color="gray.500">No departments found.</Text>
        ) : (
          departments.map(d => (
            <HStack key={d.id} justifyContent="space-between" p={3} borderRadius="md" bg="gray.50">
              <Box>
                <Text fontWeight="semibold">{d.name}</Text>
                {d.description && <Text fontSize="sm" color="gray.600">{d.description}</Text>}
              </Box>
              <HStack>
                <Button size="sm" onClick={() => setEditing({ id: d.id, name: d.name, description: d.description })}>Edit</Button>
                <Button size="sm" colorScheme="red" onClick={async () => { if (confirm('Delete department?')) await removeDepartment(d.id); }}>Delete</Button>
              </HStack>
            </HStack>
          ))
        )}
      </VStack>
    </Box>
  );
}
