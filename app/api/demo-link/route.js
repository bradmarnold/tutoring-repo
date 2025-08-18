import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { randomBytes } from "crypto";

export async function POST() {
  // Guard: if DEMO_QUIZ_ID missing → 503
  if (!process.env.DEMO_QUIZ_ID) {
    return Response.json({ error: "Demo disabled" }, { status: 503 });
  }

  try {
    // Generate fresh token
    const token = randomBytes(16).toString("hex");
    const ttlMinutes = parseInt(process.env.DEMO_TTL_MINUTES) || 15;
    const maxAttempts = parseInt(process.env.DEMO_MAX_ATTEMPTS) || 1;
    
    // Calculate expiration
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
    
    // Insert student_links row
    const { error: linkError } = await supabaseAdmin
      .from("student_links")
      .insert({
        quiz_id: process.env.DEMO_QUIZ_ID,
        student_email: "demo@public.local",
        token: token,
        expires_at: expiresAt,
        max_attempts: maxAttempts
      });

    if (linkError) throw linkError;

    return Response.json({ 
      url: `/quiz/${process.env.DEMO_QUIZ_ID}?token=${token}` 
    });
  } catch (error) {
    console.error("Demo link creation error:", error);
    return Response.json({ error: "Failed to create demo link" }, { status: 500 });
  }
}