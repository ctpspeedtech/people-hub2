export interface Leave {
  id: string;
  employeeId: string;
  employeeName: string; // Tên từ bảng profiles
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
}

// Sửa dòng này: Thêm "status" vào danh sách Omit
export type CreateLeaveInput = Omit<Leave, "id" | "employeeName" | "createdAt" | "status">;
export type UpdateLeaveInput = Partial<Pick<Leave, "startDate" | "endDate" | "reason" | "status">>;