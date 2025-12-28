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
  async create(payload: { name: string; description?: string }) {
    const { data, error } = await supabase.from('departments').insert([payload]).select().limit(1);
    if (error) throw error;
    return (data ?? [])[0];
  },
  async update(id: string, payload: { name?: string; description?: string }) {
    const { data, error } = await supabase.from('departments').update(payload).eq('id', id).select().limit(1);
    if (error) throw error;
    return (data ?? [])[0];
  },
  async remove(id: string) {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
