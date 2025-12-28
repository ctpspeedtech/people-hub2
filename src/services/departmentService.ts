import { supabase } from "../lib/supabase";

export const departmentService = {
  async getAll() {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  },
};
