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
  departments?: { id: string; name: string }[] | null;
  created_at?: string | null;
  role?: string | null;
};

export type EmployeeWithProfile = Employee;

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
  return data as EmployeeWithProfile;
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
  avatar_url,
  departments (
    id,
    name
  )
`;

export async function fetchEmployees(): Promise<EmployeeWithProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    // .eq('role', 'employee')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as EmployeeWithProfile[];
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
export async function getEmployee(id: string): Promise<EmployeeWithProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      position,
      phone,
      birthday,
      level,
      created_at,
      role,
      avatar_url,
      departments (
        id,
        name
      )
    `)
    .eq("id", id)
    .limit(1);

  if (error) throw error;
  const row = (data ?? [])[0];
  return (row ?? null) as EmployeeWithProfile | null;
}

// Update profile
export async function updateEmployee(id: string, payload: Partial<CreateEmployeePayload> | Record<string, any>): Promise<EmployeeWithProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", id)
    .select()
    .limit(1);

  if (error) throw error;
  const row = (data ?? [])[0];
  return row as EmployeeWithProfile;
}

// Delete profile
export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) throw error;
}
