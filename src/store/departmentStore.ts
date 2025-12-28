import { create } from "zustand";
import { departmentService } from "../services/departmentService";
import type { Department } from "../types/department";

type DepartmentStore = {
  departments: Department[];
  loading: boolean;
  fetchDepartments: () => Promise<void>;
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
}));
