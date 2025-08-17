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
    const { quiz_id, prompt, options, correct_index, points, teks_code } = await req.json();
    
    if (!quiz_id || !prompt || !options || correct_index == null) {
      return new Response("Missing required fields", { status: 400 });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return new Response("Options must be an array with at least 2 items", { status: 400 });
    }

    if (correct_index < 0 || correct_index >= options.length) {
      return new Response("Invalid correct_index", { status: 400 });
    }

    const { data: question, error } = await supabaseAdmin
      .from("questions")
      .insert({
        quiz_id,
        prompt,
        options,
        correct_index,
        points: points || 1,
        teks_code: teks_code || null
      })
      .select("id")
      .single();

    if (error) throw error;

    return Response.json({ id: question.id });
  } catch (error) {
    console.error("Question creation error:", error);
    return new Response("Failed to add question", { status: 500 });
  }
}