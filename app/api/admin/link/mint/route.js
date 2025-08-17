import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { randomBytes } from "crypto";

export async function POST(req) {
  // Check admin authentication
  const authError = requireAdmin(req);
  if (authError) return authError;

  if (!supabaseAdmin) {
    return new Response("Database not configured", { status: 500 });
  }

  try {
    const { quiz_id, student_email, max_attempts, days } = await req.json();
    
    if (!quiz_id || !student_email) {
      return new Response("quiz_id and student_email are required", { status: 400 });
    }

    // Generate a random token
    const token = randomBytes(16).toString("hex");
    
    // Set expiration
    const daysToExpire = days || 7;
    const expiresAt = new Date(Date.now() + daysToExpire * 24 * 60 * 60 * 1000).toISOString();
    
    // Insert student_links row
    const { data: link, error } = await supabaseAdmin
      .from("student_links")
      .insert({
        quiz_id,
        student_email,
        token,
        expires_at: expiresAt,
        max_attempts: max_attempts || 1
      })
      .select("id, token")
      .single();

    if (error) throw error;

    // Build the full URL
    const url = new URL(req.url);
    const siteUrl = process.env.SITE_URL || url.origin;
    const fullUrl = `${siteUrl}/quiz/${quiz_id}?token=${token}`;

    return Response.json({ 
      token: link.token,
      url: fullUrl,
      expires_at: expiresAt,
      max_attempts: max_attempts || 1
    });
  } catch (error) {
    console.error("Link minting error:", error);
    return new Response("Failed to mint link", { status: 500 });
  }
}