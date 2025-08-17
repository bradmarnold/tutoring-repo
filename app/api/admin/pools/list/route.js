import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req) {
  // Check admin authentication
  const authError = requireAdmin(req);
  if (authError) return authError;

  if (!supabaseAdmin) {
    return new Response("Database not configured", { status: 500 });
  }

  try {
    const url = new URL(req.url);
    const quiz_id = url.searchParams.get('quiz_id');
    
    if (!quiz_id) {
      return new Response("Missing quiz_id parameter", { status: 400 });
    }

    // Get pools for the quiz with topic info and available count
    const { data: pools, error } = await supabaseAdmin
      .from("quiz_pools")
      .select(`
        id,
        difficulty,
        draw_count,
        topics!inner(id, slug, course, unit)
      `)
      .eq("quiz_id", quiz_id);

    if (error) throw error;

    // For each pool, get the available count from question_bank
    const poolsWithCounts = await Promise.all(
      pools.map(async (pool) => {
        const { count } = await supabaseAdmin
          .from("question_bank")
          .select("*", { count: "exact", head: true })
          .eq("topic_id", pool.topics.id)
          .eq("difficulty", pool.difficulty);

        return {
          id: pool.id,
          topic_slug: pool.topics.slug,
          difficulty: pool.difficulty,
          draw_count: pool.draw_count,
          available: count || 0
        };
      })
    );

    return Response.json({ pools: poolsWithCounts });
  } catch (error) {
    console.error("List pools error:", error);
    return new Response("Failed to list pools", { status: 500 });
  }
}