import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { JSX } from 'react';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, profile, loading } = useAuthStore();

  if (loading) return null; // Hoặc một cái spinner nhỏ, đừng dùng LoadingScreen to đùng ở đây

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Chỉ check admin nếu route này nằm trong /admin
  // Nếu bạn bọc cả trang Profile bằng cái này, user thường sẽ bị văng ra
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  if (isAdminRoute && profile?.role !== "admin") {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}
