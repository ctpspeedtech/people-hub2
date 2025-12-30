import { supabase } from "../lib/supabase";

export async function getStorageUsageMB() {
  const { data, error } = await supabase.rpc(
    "get_storage_usage_mb"
  );

  if (error) throw error;
  return data as number;
}
