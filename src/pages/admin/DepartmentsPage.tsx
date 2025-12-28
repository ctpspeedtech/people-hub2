import { useEffect } from "react";
import {
  Heading,
  Table,
} from "@chakra-ui/react";
import { useDepartmentStore } from "../../store/departmentStore";

export default function DepartmentsPage() {
  const { departments, fetchDepartments } = useDepartmentStore();

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <>
      <Heading mb={4}>Departments</Heading>

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Description</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {departments.map((d) => (
            <Table.Row key={d.id}>
              <Table.Cell>{d.name}</Table.Cell>
              <Table.Cell>{d.description}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
}
