// import { useEffect } from "react";
// import { Box, Heading, Button, Table, Spinner } from "@chakra-ui/react";
// import { useEmployeeStore } from "../../store/employeeStore";
// import AddEmployeeModal from "../../components/AddEmployeeModal";

// export default function EmployeesPage() {
//   // ✅ HOOK PHẢI Ở ĐÂY
//   const employees = useEmployeeStore((s) => s.employees);
//   const loading = useEmployeeStore((s) => s.loading);
//   const fetchAll = useEmployeeStore((s) => s.fetchAll);

//   useEffect(() => {
//     fetchAll();
//   }, [fetchAll]);

//   console.log("EMPLOYEES FROM STORE:", employees);

//   return (
//     <Box p={6}>
//       <Heading mb={4}>Employees</Heading>

//       {loading && <Spinner />}

//       <Table.Root size="sm">
//         <Table.Header>
//           <Table.Row>
//             <Table.ColumnHeader>Email</Table.ColumnHeader>
//             <Table.ColumnHeader>Full name</Table.ColumnHeader>
//             <Table.ColumnHeader>Department</Table.ColumnHeader>
//           </Table.Row>
//         </Table.Header>

//         <Table.Body>
//           {employees.length === 0 && (
//             <Table.Row>
//               <Table.Cell colSpan={3}>No employees</Table.Cell>
//             </Table.Row>
//           )}

//           {employees.map((e) => (
//             <Table.Row key={e.id}>
//               <Table.Cell>{e.email}</Table.Cell>
//               <Table.Cell>{e.full_name}</Table.Cell>
//               <Table.Cell>{e.departments?.name ?? "-"}</Table.Cell>
//             </Table.Row>
//           ))}
//         </Table.Body>
//       </Table.Root>

//       {/* <Button mt={4} colorScheme="blue">
//           Create Employee
//         </Button> */}
//       <AddEmployeeModal mt={4}/>
//     </Box>
//   );
// }


import { useEffect } from "react";
import { Box, Heading, Table, Spinner, Text } from "@chakra-ui/react";
import { useEmployeeStore } from "../../store/employeeStore";
import AddEmployeeModal from "../../components/AddEmployeeModal";

export default function EmployeesPage() {
  const employees = useEmployeeStore((s) => s.employees);
  const loading = useEmployeeStore((s) => s.loading);
  const fetchAll = useEmployeeStore((s) => s.fetchAll);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <Box p={6}>
      <Heading mb={6}>Employees Management</Heading>

      <Table.Root size="sm" variant="line" showColumnBorder>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader px={4} py={3}>Email</Table.ColumnHeader>
            <Table.ColumnHeader px={4} py={3}>Full Name</Table.ColumnHeader>
            <Table.ColumnHeader px={4} py={3}>Department</Table.ColumnHeader>
            <Table.ColumnHeader px={4} py={3}>Position</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && employees.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={4} textAlign="center" py={10}>
                <Spinner />
              </Table.Cell>
            </Table.Row>
          ) : employees.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={4} textAlign="center" py={10}>
                <Text color="gray.500">No employees found.</Text>
              </Table.Cell>
            </Table.Row>
          ) : (
            employees.map((e) => (
              <Table.Row key={e.id}>
                <Table.Cell px={4} py={3}>{e.email}</Table.Cell>
                <Table.Cell px={4} py={3}>{e.full_name}</Table.Cell>
                <Table.Cell px={4} py={3}>{e.departments?.name ?? "-"}</Table.Cell>
                <Table.Cell px={4} py={3}>{e.position ?? "-"}</Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>

      {/* Truyền fetchAll vào onSuccess để tự động cập nhật danh sách */}
      <AddEmployeeModal mt={6} onSuccess={fetchAll} />
    </Box>
  );
}
