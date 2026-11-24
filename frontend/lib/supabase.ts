import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://byfusjuyekdtljielkil.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_SJaVDAQTcwiNRUVFg-V7DQ_RRMmffoS";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
