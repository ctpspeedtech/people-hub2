import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import DepartmentsPage from "../pages/admin/DepartmentsPage";
import EmployeesPage from "../pages/admin/EmployeesPage";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="employees" />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
      </Route>
    </Routes>
  );
}
