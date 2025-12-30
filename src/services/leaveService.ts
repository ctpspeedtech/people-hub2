import { supabase } from "../lib/supabase";
import type { Leave } from "../types/leaves";

export const leaveService = {
  getAll: async (): Promise<Leave[]> => {
    const { data, error } = await supabase.from("leaves").select(`
      id,
      employee_id,
      start_date,
      end_date,
      reason,
      status,
      profiles!inner(full_name)
    `); // profiles!inner lấy dữ liệu từ bảng profiles dựa trên foreign key

    if (error) throw error;

    return data.map((d: any) => ({
      id: d.id,
      employeeId: d.employee_id, // Map từ snake_case sang camelCase cho Frontend
      employeeName: d.profiles.full_name,
      startDate: d.start_date,
      endDate: d.end_date,
      reason: d.reason,
      status: d.status,
    }));
  },

  create: async (payload: {
    employeeId: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }): Promise<Leave> => {
    // Chuyển payload sang snake_case để insert vào DB
    const dbPayload = {
      employee_id: payload.employeeId,
      start_date: payload.startDate,
      end_date: payload.endDate,
      reason: payload.reason,
    };

    const { data, error } = await supabase
      .from("leaves")
      .insert(dbPayload)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      employeeId: data.employee_id,
      startDate: data.start_date,
      endDate: data.end_date,
      employeeName: "",
    };
  },

  update: async (
    id: string,
    payload: Partial<Pick<Leave, "startDate" | "endDate" | "reason" | "status">>
  ): Promise<Leave> => {
    // Map payload sang snake_case nếu có thay đổi ngày tháng
    const dbPayload: any = { ...payload };
    if (payload.startDate) dbPayload.start_date = payload.startDate;
    if (payload.endDate) dbPayload.end_date = payload.endDate;

    // Xóa các key camelCase cũ để tránh lỗi query
    delete dbPayload.startDate;
    delete dbPayload.endDate;

    const { data, error } = await supabase
      .from("leaves")
      .update(dbPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      employeeId: data.employee_id,
      startDate: data.start_date,
      endDate: data.end_date,
      employeeName: "",
    };
  },

  remove: async (id: string): Promise<void> => {
    const { error, count } = await supabase
      .from("leaves")
      .delete({ count: "exact" }) // Yêu cầu trả về số lượng dòng bị ảnh hưởng
      .eq("id", id);

    if (error) {
      console.error("Lỗi xóa:", error.message);
      throw error;
    }

    if (count === 0) {
      console.warn("Không tìm thấy dòng nào để xóa hoặc bị chặn bởi RLS.");
    }
  },
};
