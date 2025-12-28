import { create } from "zustand";
import { departmentService } from "../services/departmentService";
import type { Department } from "../types/department";

type DepartmentStore = {
  departments: Department[];
  loading: boolean;
  fetchDepartments: () => Promise<void>;
  createDepartment: (payload: { name: string; description?: string }) => Promise<void>;
  updateDepartment: (id: string, payload: { name?: string; description?: string }) => Promise<void>;
  removeDepartment: (id: string) => Promise<void>;
};

export const useDepartmentStore = create<DepartmentStore>((set) => ({
  departments: [],
  loading: false,

  fetchDepartments: async () => {
    set({ loading: true });
    const data = await departmentService.getAll();
    set({ departments: data });
    set({ loading: false });
  },
  createDepartment: async (payload: { name: string; description?: string }) => {
    set({ loading: true });
    try {
      const d = await departmentService.create(payload);
      set((s) => ({ departments: [...s.departments, d] }));
    } finally {
      set({ loading: false });
    }
  },
  updateDepartment: async (id: string, payload: { name?: string; description?: string }) => {
    set({ loading: true });
    try {
      const updated = await departmentService.update(id, payload);
      set((s) => ({ departments: s.departments.map(dep => dep.id === id ? updated : dep) }));
    } finally {
      set({ loading: false });
    }
  },
  removeDepartment: async (id: string) => {
    set({ loading: true });
    try {
      await departmentService.remove(id);
      set((s) => ({ departments: s.departments.filter(d => d.id !== id) }));
    } finally {
      set({ loading: false });
    }
  }
}));
