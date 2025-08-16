import { createClient } from "@supabase/supabase-js";

// Handle missing environment variables gracefully during build
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

export const supabaseAdmin = supabaseUrl && supabaseServiceRole ? createClient(
  supabaseUrl,
  supabaseServiceRole,
  {
    auth: { persistSession: false },
    global: { headers: { "X-Client-Info": "tutoring-site/1.0" } }
  }
) : null;
