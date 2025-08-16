import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(){
  if (!supabaseAdmin) {
    return Response.json([]);
  }
  
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_templates')
      .select('id,name,course,exam')
      .order('name');
    
    if (error) {
      console.error("Database error:", error);
      return Response.json([]);
    }
    
    return Response.json(data || []);
  } catch (error) {
    console.error("API error:", error);
    return Response.json([]);
  }
}
