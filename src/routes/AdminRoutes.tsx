import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";
import AdminLayout from "../layouts/AdminLayout";

// Lazy loading các trang Admin để tối ưu hiệu năng
const DashboardPage = lazy(() => import("../pages/admin/DashboardPage"));
const EmployeesPage = lazy(() => import("../pages/admin/EmployeesPage"));
const DepartmentsPage = lazy(() => import("../pages/admin/DepartmentsPage"));
const EmployeeDetailPage = lazy(() => import("../pages/EmployeeDetailPage"));
const LeavesPage = lazy(() => import("../pages/admin/LeavesPage"));

// Component chờ riêng cho khu vực Admin (nằm bên trong AdminLayout)
const PageLoader = () => (
  <Center h="200px">
    <Spinner size="lg" color="blue.500" borderWidth="3px" />
  </Center>
);

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Bọc Suspense ở đây để khi chuyển trang trong Admin, Layout không bị load lại */}
        <Route
          index
          element={
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          }
        />
        
        <Route
          path="employees"
          element={
            <Suspense fallback={<PageLoader />}>
              <EmployeesPage />
            </Suspense>
          }
        />
        
        <Route
          path="employees/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <EmployeeDetailPage />
            </Suspense>
          }
        />
        
        <Route
          path="departments"
          element={
            <Suspense fallback={<PageLoader />}>
              <DepartmentsPage />
            </Suspense>
          }
        />
        
        <Route
          path="leaves"
          element={
            <Suspense fallback={<PageLoader />}>
              <LeavesPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}