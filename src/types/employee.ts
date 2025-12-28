export type Employee = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "employee";

  phone?: string;
  birthday?: string;
  address?: string;
  education?: string;
  note?: string;
  position?: string;
  level?: string;

  avatar_url?: string;
};
