import { create } from "zustand";
import type { CreateEmployeePayload, Employee } from "../services/employeeService";
import { createEmployee, fetchEmployees } from "../services/employeeService";

interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  error: string | null;

  fetchAll: () => Promise<void>;
  create: (payload: CreateEmployeePayload) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchEmployees();
      set({ employees: data, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  create: async (payload) => {
    set({ loading: true, error: null });
    try {
      await createEmployee(payload);
      const data = await fetchEmployees(); // refresh list
      set({ employees: data, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
}));
