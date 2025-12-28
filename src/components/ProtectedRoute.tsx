import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, profile, loading } = useAuthStore();

  // ⏳ ĐANG LOAD → ĐỪNG CHECK GÌ CẢ
  if (loading) {
    return <div>Checking permission...</div>;
  }

  // ❌ Chưa login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Đã login nhưng không phải admin
  if (!profile || profile.role !== "admin") {
    return <div>403 - Forbidden</div>;
  }

  // ✅ OK
  return children;
}
