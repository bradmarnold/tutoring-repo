import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req){
  if (!supabaseAdmin) {
    return new Response("Database not configured", { status: 500 });
  }
  
  const { course, since } = await req.json().catch(()=>({}));
  const { data, error } = await supabaseAdmin.rpc("topic_accuracy", { p_course: course || null, p_since: since || null });
  if (error) return new Response("DB error", { status: 500 });
  return Response.json({ topics: data });
}
