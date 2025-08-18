import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  if (!supabaseAdmin) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const topic = url.searchParams.get("topic");
    const q = url.searchParams.get("q");
    const page = parseInt(url.searchParams.get("page")) || 1;
    const perPage = Math.min(parseInt(url.searchParams.get("perPage")) || 20, 100);

    let query = supabaseAdmin
      .from("question_templates")
      .select(`
        id,
        title,
        difficulty,
        teks_code,
        status,
        created_at,
        updated_at,
        topics:topic_id(slug, course, unit)
      `);

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (topic) {
      // Join with topics to filter by slug
      query = query.eq("topics.slug", topic);
    }

    if (q) {
      // Search in title and TEKS code
      query = query.or(`title.ilike.%${q}%,teks_code.ilike.%${q}%`);
    }

    // Pagination
    const offset = (page - 1) * perPage;
    query = query
      .range(offset, offset + perPage - 1)
      .order("updated_at", { ascending: false });

    const { data: templates, error } = await query;
    if (error) throw error;

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from("question_templates")
      .select("*", { count: "exact", head: true });

    if (status) countQuery = countQuery.eq("status", status);
    if (topic) countQuery = countQuery.eq("topics.slug", topic);
    if (q) countQuery = countQuery.or(`title.ilike.%${q}%,teks_code.ilike.%${q}%`);

    const { count } = await countQuery;

    return Response.json({
      templates: templates || [],
      pagination: {
        page,
        perPage,
        total: count || 0,
        pages: Math.ceil((count || 0) / perPage)
      }
    });
  } catch (error) {
    console.error("List templates error:", error);
    return Response.json({ error: "Failed to list templates" }, { status: 500 });
  }
}