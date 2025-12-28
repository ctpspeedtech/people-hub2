import { create } from "zustand";
import { supabase } from "../lib/supabase";

type AuthState = {
  user: any;
  profile: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,

  login: async (email, password) => {
    set({ loading: true });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const user = data.user;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    set({ user, profile, loading: false });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  // ⭐ CỰC KỲ QUAN TRỌNG
  initAuth: async () => {
    set({ loading: true });

    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session) {
      set({ user: null, profile: null, loading: false });
      return;
    }

    const user = session.user;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    set({ user, profile, loading: false });
  },
}));
