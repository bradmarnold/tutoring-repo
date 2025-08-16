import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req){
  if (!supabaseAdmin) {
    return new Response("Database not configured", { status: 500 });
  }
  
  const bq = await req.json();
  bq.options = Array.isArray(bq.options) ? bq.options : [];
  const { error } = await supabaseAdmin.from("bank_questions").insert(bq);
  if (error) return new Response("DB error", { status: 500 });
  return new Response("OK");
}
