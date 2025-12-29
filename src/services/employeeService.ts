import { supabase } from "../lib/supabase";

/* =======================
   TYPES
======================= */
// Core profile fields shared between payloads and DB rows
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
};

// Payload used when creating an employee (requires password and department)
export type CreateEmployeePayload = Pick<EmployeeBase, 'email' | 'full_name' | 'position' | 'phone' | 'birthday' | 'address' | 'education' | 'note' | 'level'> & {
  password: string;
  department_id: string;
};

export type Employee = EmployeeBase & {
  id: string;
  // Supabase returns related rows as an array when selecting the relation
  departments?: { id: string; name: string } | null;
  created_at?: string | null;
  role?: string | null;
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
  return data as Employee;
}

// load danh sách employee
const PROFILE_SELECT = `
  id,
  email,
  full_name,
  position,
  phone,
  birthday,
  level,
  created_at,
  role,
  education,
  note,
  address,
  avatar_url,
  departments (
    id,
    name
  )
`;

export async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    // .eq('role', 'employee')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as Employee[];
}

// upload avatar file to storage and return upload result
export type UploadResult = { path: string; publicUrl: string | null };

export async function uploadAvatar(file: File, userId: string): Promise<UploadResult> {
  const bucket = "avatars";
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true } as any);

  if (uploadError) {
    // provide clearer hint if the bucket doesn't exist
    const msg = (uploadError?.message || String(uploadError)).toLowerCase();
    if (msg.includes('bucket') && msg.includes('not found')) {
      throw new Error(`Bucket '${bucket}' not found. Create it with the script: node scripts/create-avatar-bucket.js (requires SUPABASE_SERVICE_ROLE_KEY env var)`);
    }
    throw uploadError;
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  const publicUrl = urlData?.publicUrl ?? null;
  return { path, publicUrl };
}

export async function getAvatarUrl(pathOrUrl: string, expiresSec = 60): Promise<string | null> {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;

  const bucket = 'avatars';
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(pathOrUrl);
  if (urlData?.publicUrl) return urlData.publicUrl;

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(pathOrUrl, expiresSec);
  if (error) {
    console.warn('getAvatarUrl: createSignedUrl failed', error);
    return null;
  }
  return data?.signedUrl ?? null;
}

// Get single employee/profile by id
export async function getEmployee(id: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", id)
    .limit(1);

  if (error) throw error;
  const row = (data ?? [])[0];
  return row ? (row as unknown as Employee) : null;
}

// Update profile
export async function updateEmployee(id: string, payload: Partial<CreateEmployeePayload> | Record<string, any>): Promise<Employee> {
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", id)
    .select()
    .limit(1);

  if (error) throw error;
  const row = (data ?? [])[0];
  return row as Employee;
}

// Delete profile
// export async function deleteEmployee(id: string): Promise<void> {
//   const { error } = await supabase.from("profiles").delete().eq("id", id);
//   if (error) throw error;
// }

// Remove avatar file from storage
export async function removeAvatar(path: string): Promise<void> {
  if (!path) return;

  const bucket = 'avatars';

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw error;
  }
}

export async function removeEmployeeAvatar(
  employeeId: string,
  avatarPath: string
): Promise<void> {
  // 1. remove file
  await removeAvatar(avatarPath);

  // 2. clear avatar_url trong profile
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', employeeId);

  if (error) throw error;
}

export async function deleteEmployee(id: string): Promise<void> {
  // 1. lấy avatar_path trước
  const { data } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', id)
    .single();

  const avatarPath = data?.avatar_url;

  // 2. delete profile
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;

  // 3. delete avatar file (không block nếu lỗi)
  if (avatarPath && !avatarPath.startsWith('http')) {
    try {
      await removeAvatar(avatarPath);
    } catch (err) {
      console.warn('Failed to remove avatar file:', err);
    }
  }
}
