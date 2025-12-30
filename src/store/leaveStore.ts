import { create } from "zustand";
import { leaveService } from "../services/leaveService";
import type {
  CreateLeaveInput,
  Leave,
  UpdateLeaveInput,
} from "../types/leaves";
import { supabase } from "../lib/supabase";

interface LeaveState {
  leaves: Leave[];
  loading: boolean;
  error: string | null;
  fetchLeaves: () => Promise<void>;
  updateLeave: (id: string, payload: UpdateLeaveInput) => Promise<void>;
  removeLeave: (id: string) => Promise<void>;
  addLeave: (payload: CreateLeaveInput) => Promise<void>;
  // Thêm vào interface LeaveState
  employees: { id: string; full_name: string }[];
  fetchEmployees: () => Promise<void>;
}

export const useLeaveStore = create<LeaveState>((set, get) => ({
  leaves: [],
  loading: false,
  error: null,

  fetchLeaves: async () => {
    set({ loading: true, error: null });
    try {
      const data = await leaveService.getAll();
      set({ leaves: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateLeave: async (id, payload) => {
    try {
      const updated = await leaveService.update(id, payload);
      set((state) => ({
        leaves: state.leaves.map((l) =>
          l.id === id ? { ...l, ...payload } : l
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  removeLeave: async (id) => {
    try {
      await leaveService.remove(id);
      set((state) => ({
        leaves: state.leaves.filter((l) => l.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Thêm vào hàm tạo store
  addLeave: async (payload) => {
    set({ loading: true });
    try {
      const newLeave = await leaveService.create(payload);
      // Sau khi tạo thành công, nên fetch lại để lấy employeeName từ bảng profiles
      const data = await leaveService.getAll();
      set({ leaves: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Thêm vào hàm tạo store
  employees: [],
  fetchEmployees: async () => {
    const { data } = await supabase.from("profiles").select("id, full_name");
    if (data) set({ employees: data });
  },
}));
