import { useAuthStore } from "../store/authStore";

export default function AdminDashboard() {
  const profile = useAuthStore((s) => s.profile);

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>

      <p>
        Xin chào <b>{profile?.full_name}</b>
      </p>

      <p>Role: {profile?.role}</p>

      <hr />

      <p>Dashboard content sẽ làm sau...</p>
    </div>
  );
}
