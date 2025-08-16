import { supabaseAdmin } from "@/lib/supabaseAdmin";
export async function GET(){
  const { data } = await supabaseAdmin.from('quiz_templates').select('id,name').order('name');
  return Response.json(data || []);
}
