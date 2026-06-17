import { createClient } from "@supabase/supabase-js";

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.https://exovfiaalghyuslbhbnf.supabase.co || "";
const supabaseAnonKey = metaEnv.sb_publishable_8Qvs7KDRFxLGs7PvbVGiOQ_b55_Ipn8 || "";

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
