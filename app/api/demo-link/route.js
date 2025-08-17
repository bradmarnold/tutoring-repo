import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { randomBytes } from "crypto";

export async function GET(req) {
  // Guard with environment variable
  if (!process.env.ENABLE_PUBLIC_DEMO) {
    return new Response("Public demo not enabled", { status: 503 });
  }

  if (!supabaseAdmin) {
    return new Response("Database not configured", { status: 500 });
  }

  try {
    // Get the latest quiz
    const { data: quizzes, error: quizError } = await supabaseAdmin
      .from("quizzes")
      .select("id, title")
      .order("created_at", { ascending: false })
      .limit(1);

    if (quizError) throw quizError;
    
    if (!quizzes || quizzes.length === 0) {
      return new Response("No quizzes available", { status: 404 });
    }

    const quiz = quizzes[0];
    
    // Generate a random token
    const token = randomBytes(16).toString("hex");
    
    // Set expiration to 7 days from now
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    // Insert student_links row
    const { error: linkError } = await supabaseAdmin
      .from("student_links")
      .insert({
        quiz_id: quiz.id,
        student_email: "demo@local",
        token: token,
        expires_at: expiresAt,
        max_attempts: 5
      });

    if (linkError) throw linkError;

    // Get the site URL from environment or use the request origin
    const url = new URL(req.url);
    const siteUrl = process.env.SITE_URL || url.origin;
    const demoUrl = `${siteUrl}/quiz/${quiz.id}?token=${token}`;

    return Response.json({ url: demoUrl });
  } catch (error) {
    console.error("Demo link creation error:", error);
    return new Response("Failed to create demo link", { status: 500 });
  }
}