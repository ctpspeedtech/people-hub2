import { supabase } from "../lib/supabase";

/* =======================
   TYPES
======================= */
export type EmployeeBase = {
  email: string;
  full_name: string;
  position?: string | null;
  phone?: string | null;
  birthday?: string | null;
  address?: string | null;
  education?: string | null;
  note?: string | null;
  level?: string | null;
  avatar_url?: string | null;
  role?: string | null;
};

export type CreateEmployeePayload = EmployeeBase & {
  password?: string; // Optional cho update, required cho edge function create
  department_id: string;
};

export type Employee = EmployeeBase & {
  id: string;
  departments?: { id: string; name: string } | null;
  created_at?: string | null;
};

/* =======================
   CONSTANTS & HELPERS
======================= */
const BUCKET_NAME = 'avatars';

// Truy vấn chuẩn để tái sử dụng, giúp đồng bộ dữ liệu trả về giữa các hàm
const PROFILE_SELECT = `
  *,
  departments ( id, name )
`;

/* =======================
   API CALLS
======================= */

/**
 * Tạo nhân viên mới qua Edge Function
 */
export async function createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
  const { data, error } = await supabase.functions.invoke("create-employee", {
    body: payload
  });
  if (error) throw error;
  return data;
}

/**
 * Lấy danh sách toàn bộ nhân viên
 */
export async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    // .eq('role', 'employee')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as Employee[];
}

/**
 * Lấy chi tiết 1 nhân viên
 */
export async function getEmployee(id: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", id)
    .maybeSingle(); // Trả về null nếu không thấy, thay vì mảng hoặc lỗi single

  if (error) throw error;
  return data as unknown as Employee;
}

/**
 * Cập nhật thông tin nhân viên
 */
export async function updateEmployee(id: string, payload: Partial<CreateEmployeePayload>): Promise<Employee> {
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", id)
    .select(PROFILE_SELECT)
    .single();

  if (error) throw error;
  return data as unknown as Employee;
}

/**
 * Xóa nhân viên và dọn dẹp avatar liên quan
 */
export async function deleteEmployee(id: string): Promise<void> {
  // 1. Lấy thông tin avatar trước khi xóa profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', id)
    .single();

  // 2. Xóa profile (Cascade sẽ tự lo nếu bạn config DB, nếu không thực hiện thủ công)
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw error;

  // 3. Dọn dẹp Storage (Chạy ngầm, không block UI)
  if (profile?.avatar_url && !profile.avatar_url.startsWith('http')) {
    removeAvatar(profile.avatar_url).catch(console.warn);
  }
}

/* =======================
   STORAGE HELPERS
======================= */

export async function uploadAvatar(file: File, userId: string) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return { path, publicUrl };
}

/**
 * Lấy URL hiển thị Avatar (Ưu tiên Public URL, dự phòng Signed URL)
 */
export async function getAvatarUrl(pathOrUrl: string | null, expiresSec = 3600): Promise<string | null> {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith('http')) return pathOrUrl;

  // 1. Thử lấy Public URL trước (Nếu bucket là Public)
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(pathOrUrl);

  // Kiểm tra xem file có thực sự tồn tại hoặc public không bằng cách fetch nhẹ hoặc dùng trực tiếp
  // Nếu bạn dùng Private Bucket, hãy bỏ qua bước PublicUrl và dùng thẳng SignedURL
  if (data?.publicUrl) return data.publicUrl;

  // 2. Dự phòng Signed URL cho Private Bucket
  const { data: sData, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(pathOrUrl, expiresSec);

  return error ? null : sData?.signedUrl ?? null;
}

export async function removeAvatar(path: string): Promise<void> {
  if (!path || path.startsWith('http')) return;
  await supabase.storage.from(BUCKET_NAME).remove([path]);
}
