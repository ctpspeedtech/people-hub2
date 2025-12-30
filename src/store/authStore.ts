import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";

type AuthState = {
  user: any;
  profile: any;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      loading: false,
      isAdmin: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;

          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (profileError) throw profileError;

          set({
            user: data.user,
            profile,
            isAdmin: profile?.role === "admin",
            loading: false,
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: async () => {
        // Tuyệt đối không set loading: true ở đây để tránh treo UI
        set({ loading: true });
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Xóa sạch state ngay lập tức
          set({ user: null, profile: null, isAdmin: false, loading: false });
          localStorage.removeItem("auth-storage");
        }
      },

      initAuth: async () => {
        set({ loading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            set({ user: null, profile: null, isAdmin: false, loading: false });
            return;
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          set({
            user: session.user,
            profile,
            isAdmin: profile?.role === "admin",
            loading: false,
          });
        } catch (error) {
          set({ user: null, profile: null, isAdmin: false, loading: false });
        }
      },

      changePassword: async (newPassword) => {
        set({ loading: true });
        try {
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if (error) throw error;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAdmin: state.isAdmin,
      }),
    }
  )
);

// Listener: Cập nhật state khi có thay đổi từ hệ thống Supabase
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") {
    useAuthStore.setState({
      user: null,
      profile: null,
      isAdmin: false,
      loading: false
    });
    localStorage.removeItem("auth-storage");
  } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
    if (session) {
      // Chỉ init nếu chưa có dữ liệu trong store để tránh loop
      const store = useAuthStore.getState();
      if (!store.user || !store.profile) {
        store.initAuth();
      }
    }
  }
});
