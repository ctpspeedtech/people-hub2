import { useEffect, useState } from "react";
import { Box, Heading, Table, Spinner, Text, HStack, Button, Input, Flex, Spacer, useBreakpointValue } from "@chakra-ui/react";
import { useEmployeeStore } from "../../store/employeeStore";

import type { Employee } from "../../services/employeeService";
import { getAvatarUrl } from "../../services/employeeService";
import EmployeeModal from "../../components/EmployeeModal";

export default function EmployeesPage() {
  const employees = useEmployeeStore((s) => s.employees) as Employee[];
  console.log('EmployeesPage employees:', employees);
  const loading = useEmployeeStore((s) => s.loading);
  const fetchAll = useEmployeeStore((s) => s.fetchAll);
  const remove = useEmployeeStore((s) => (s as any).remove);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [avatarMap, setAvatarMap] = useState<Record<string, string | null>>({});
  const [query, setQuery] = useState("");
  const showDetails = useBreakpointValue({ base: true, md: true });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: number; text: string; type?: 'success' | 'error' }>>([]);

  const pushToast = (text: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const map: Record<string, string | null> = {};
      for (const e of employees) {
        const raw = e.avatar_url as string | undefined | null;
        if (!raw) {
          map[e.id] = null;
          continue;
        }

        if (raw.startsWith("http://") || raw.startsWith("https://")) {
          map[e.id] = raw;
          continue;
        }

        try {
          const url = await getAvatarUrl(raw, 60);
          map[e.id] = url;
        } catch (err) {
          map[e.id] = null;
        }
      }
      if (mounted) setAvatarMap(map);
    })();
    return () => { mounted = false; };
  }, [employees]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = employees.filter((e) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      e.email?.toLowerCase().includes(q) ||
      e.full_name?.toLowerCase().includes(q) ||
      (e.departments?.name ?? "-").toLowerCase().includes(q)
    );
  });

  return (
    <Box p={6}>
      <Flex mb={6} align="center">
        <Heading size="lg">Employees Management</Heading>
        <Spacer />
        <HStack maxW="360px" mr={4} gap={2}>
          <Box as="span" aria-hidden mr={2}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-4.35-4.35" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" stroke="#718096" strokeWidth="2"/></svg>
          </Box>
          <Input placeholder="Search by name, email or department" value={query} onChange={(e) => setQuery(e.target.value)} />
        </HStack>
        <EmployeeModal colorScheme="blue" mr={2} onSuccess={fetchAll} />
      </Flex>

      <Box overflowX="auto">
      <Table.Root size="sm" variant="line" showColumnBorder>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader px={4} py={3}>Avatar</Table.ColumnHeader>
            <Table.ColumnHeader px={4} py={3}>Email</Table.ColumnHeader>
            <Table.ColumnHeader px={4} py={3}>Full Name</Table.ColumnHeader>
            <Table.ColumnHeader px={4} py={3}>Department</Table.ColumnHeader>
            {showDetails && <Table.ColumnHeader px={4} py={3}>Position</Table.ColumnHeader>}
            {showDetails && <Table.ColumnHeader px={4} py={3}>Role</Table.ColumnHeader>}
            {showDetails && <Table.ColumnHeader px={4} py={3}>Phone</Table.ColumnHeader>}
            {showDetails && <Table.ColumnHeader px={4} py={3}>Birthday</Table.ColumnHeader>}
            {showDetails && <Table.ColumnHeader px={4} py={3}>Level</Table.ColumnHeader>}
            {showDetails && <Table.ColumnHeader px={4} py={3}>Created</Table.ColumnHeader>}
            <Table.ColumnHeader px={4} py={3}></Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && employees.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={11} textAlign="center" py={10}>
                <Spinner />
              </Table.Cell>
            </Table.Row>
          ) : employees.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={11} textAlign="center" py={10}>
                <Text color="gray.500">No employees found.</Text>
              </Table.Cell>
            </Table.Row>
          ) : (
            filtered.map((e) => (
              <Table.Row key={e.id}>
                <Table.Cell px={4} py={3}>
                  {avatarMap[e.id] ? (
                    <img src={avatarMap[e.id] as string} alt={e.full_name} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6 }} />
                  ) : (
                    <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#edf2f7', borderRadius: 6 }}>{(e.full_name || e.email || '').charAt(0).toUpperCase()}</div>
                  )}
                </Table.Cell>
                <Table.Cell px={4} py={3}>{e.email}</Table.Cell>
                <Table.Cell px={4} py={3}>{e.full_name}</Table.Cell>
                <Table.Cell px={4} py={3}>{e.departments?.name ?? "-"}</Table.Cell>
                {showDetails && <Table.Cell px={4} py={3}>{e.position ?? "-"}</Table.Cell>}
                {showDetails && <Table.Cell px={4} py={3}>{e.role ?? "-"}</Table.Cell>}
                {showDetails && <Table.Cell px={4} py={3}>{e.phone ?? "-"}</Table.Cell>}
                {showDetails && <Table.Cell px={4} py={3}>{e.birthday ? new Date(e.birthday).toLocaleDateString() : "-"}</Table.Cell>}
                {showDetails && <Table.Cell px={4} py={3}>{e.level ?? "-"}</Table.Cell>}
                {showDetails && <Table.Cell px={4} py={3}>{e.created_at ? new Date(e.created_at).toLocaleDateString() : "-"}</Table.Cell>}
                <Table.Cell px={4} py={3}>
                  <HStack gap={2}>
                    <Button size="sm" onClick={() => setEditing(e)}>Edit</Button>
                    <Button size="sm" colorScheme="red" onClick={() => setConfirmDeleteId(e.id)}>Delete</Button>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
      </Box>

      {/* Confirm delete overlay */}
      {confirmDeleteId && (
        <Box position="fixed" inset={0} bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center" zIndex={40} onClick={() => setConfirmDeleteId(null)}>
          <Box bg="white" width={["90%","420px"]} p={6} borderRadius="md" onClick={(e) => e.stopPropagation()}>
            <Box fontWeight="semibold" mb={4}>Delete employee?</Box>
            <Box color="gray.600" mb={6}>This action cannot be undone. Are you sure?</Box>
            <Box display="flex" justifyContent="flex-end">
              <Button variant="outline" mr={3} onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
              <Button colorScheme="red" onClick={async () => {
                try {
                  await remove(confirmDeleteId);
                  pushToast('Employee deleted', 'success');
                  setConfirmDeleteId(null);
                  fetchAll();
                } catch (err: any) {
                  pushToast(err?.message || 'Could not delete', 'error');
                }
              }}>Delete</Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Toasts */}
      <Box position="fixed" bottom={6} right={6} zIndex={60}>
        {toasts.map((t) => (
          <Box key={t.id} mb={3} px={4} py={2} bg={t.type === 'success' ? 'green.500' : 'red.500'} color="white" borderRadius="md" boxShadow="md">
            {t.text}
          </Box>
        ))}
      </Box>



      {/* Create modal is available in the toolbar above */}

      {/* Edit modal (mounted when editing) */}
      {editing && (
        <EmployeeModal
          employee={editing}
          defaultOpen
          onSuccess={() => { fetchAll(); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
    </Box>
  );
}
