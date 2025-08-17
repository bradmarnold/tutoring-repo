import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(req) {
  // Check admin authentication
  const authError = requireAdmin(req);
  if (authError) return authError;

  if (!supabaseAdmin) {
    return new Response("Database not configured", { status: 500 });
  }

  try {
    const { pool_id } = await req.json();
    
    if (!pool_id) {
      return new Response("Missing pool_id", { status: 400 });
    }

    // Delete the pool
    const { error } = await supabaseAdmin
      .from("quiz_pools")
      .delete()
      .eq("id", pool_id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete pool error:", error);
    return new Response("Failed to delete pool", { status: 500 });
  }
}