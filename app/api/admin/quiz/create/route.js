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
    const { title, duration_seconds } = await req.json();
    
    if (!title) {
      return new Response("Title is required", { status: 400 });
    }

    const { data: quiz, error } = await supabaseAdmin
      .from("quizzes")
      .insert({
        title,
        duration_seconds: duration_seconds || 900 // default 15 minutes
      })
      .select("id")
      .single();

    if (error) throw error;

    return Response.json({ id: quiz.id });
  } catch (error) {
    console.error("Quiz creation error:", error);
    return new Response("Failed to create quiz", { status: 500 });
  }
}