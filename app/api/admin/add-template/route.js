import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req){
  if (!supabaseAdmin) {
    return new Response("Database not configured", { status: 500 });
  }
  
  const template = await req.json();
  const { error } = await supabaseAdmin.from("quiz_templates").insert(template);
  if (error) {
    console.error("Database error:", error);
    return new Response("DB error", { status: 500 });
  }
  return new Response("OK");
}