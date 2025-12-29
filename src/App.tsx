import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoutes from "./routes/AdminRoutes";
import { useAuthStore } from "./store/authStore";

export default function App() {
  const initAuth = useAuthStore((s) => s.initAuth);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    initAuth();
  }, []);

  if (loading) {
    return <div>Loading auth...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
