import { supabase } from "../lib/supabase";

/* =======================
   TYPES
======================= */
export type CreateEmployeePayload = {
  email: string;
  password: string;
  full_name: string;
  department_id: string;
  phone?: string;
  birthday?: string;
  address?: string;
  education?: string;
  note?: string;
  position?: string;
  level?: string;
};

export type Employee = {
  id: string;
  email: string;
  full_name: string;
  departments?: {
    id: string;
    name: string;
  } | null;
};

/* =======================
   API CALLS
======================= */

// gọi edge function
export async function createEmployee(payload: CreateEmployeePayload) {
  const { data, error } = await supabase.functions.invoke(
    "create-employee",
    { body: payload }
  );

  if (error) throw error;
  return data;
}

// load danh sách employee
export async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      departments (
        id,
        name
      )
    `)
    // .eq("role", "employee")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
