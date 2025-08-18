import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(req) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  if (!supabaseAdmin) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return Response.json({ error: "Missing id or status" }, { status: 400 });
    }

    const validStatuses = ['draft', 'review', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return Response.json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 });
    }

    const { data: template, error } = await supabaseAdmin
      .from("question_templates")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("id, title, status")
      .single();

    if (error) throw error;

    return Response.json({ 
      success: true,
      template: {
        id: template.id,
        title: template.title,
        status: template.status
      }
    });
  } catch (error) {
    console.error("Update template status error:", error);
    return Response.json({ error: "Failed to update template status" }, { status: 500 });
  }
}