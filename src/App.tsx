import { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { useAuthStore } from "./store/authStore";

const Login = lazy(() => import("./pages/Login"));
const AdminRoutes = lazy(() => import("./routes/AdminRoutes"));
const EmployeeDetailPage = lazy(() => import("./pages/EmployeeDetailPage"));
const ForbiddenPage = lazy(() => import("./pages/ForbiddenPage"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

const LoadingScreen = () => (
  <Center h="100vh" w="100vw">
    <VStack gap="4">
      <Spinner size="xl" color="blue.500" borderWidth="4px" />
      <Text fontWeight="medium" color="gray.600">Đang kiểm tra quyền truy cập...</Text>
    </VStack>
  </Center>
);

export default function App() {
  const { initAuth, loading, user } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Nếu vẫn đang load lần đầu, hiện màn hình loading toàn trang
  if (loading) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public: Nếu đã login rồi thì không cho vào trang login nữa */}
          <Route
            path="/login"
            element={user ? <Navigate to="/admin" replace /> : <Login />}
          />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <EmployeeDetailPage />
              </ProtectedRoute>
            }
          />

          <Route path="/forbidden" element={<ForbiddenPage />} />

          {/* Điều hướng gốc thông minh hơn */}
          <Route
            path="/"
            element={<Navigate to={user ? "/admin" : "/login"} replace />}
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
