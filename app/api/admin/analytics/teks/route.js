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
    const quizId = url.searchParams.get("quiz_id");
    
    if (!quizId) {
      return new Response("quiz_id parameter is required", { status: 400 });
    }

    // Query TEKS analytics using the view
    const { data: teksData, error } = await supabaseAdmin
      .from("v_teks_accuracy")
      .select("teks_code, correct, total")
      .eq("quiz_id", quizId)
      .order("teks_code");

    if (error) throw error;

    // Transform data to include percentage
    const results = teksData.map(row => ({
      teks_code: row.teks_code,
      total: row.total,
      correct: row.correct,
      accuracy: row.total > 0 ? (row.correct / row.total * 100).toFixed(1) : "0.0"
    }));

    return Response.json(results);
  } catch (error) {
    console.error("TEKS analytics error:", error);
    return new Response("Failed to fetch TEKS analytics", { status: 500 });
  }
}