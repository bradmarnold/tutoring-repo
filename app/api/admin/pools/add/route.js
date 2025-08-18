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
    const { quiz_id, topic_slug, difficulty = 'med', draw_count } = await req.json();
    
    if (!quiz_id || !topic_slug || !draw_count) {
      return new Response("Missing required fields: quiz_id, topic_slug, draw_count", { status: 400 });
    }

    if (draw_count < 1) {
      return new Response("draw_count must be at least 1", { status: 400 });
    }

    // Parse topic_slug to get course and unit
    const slugParts = topic_slug.split('-');
    if (slugParts.length < 2) {
      return new Response("Invalid topic_slug format. Expected 'course-unit'", { status: 400 });
    }
    
    const course = slugParts[0];
    const unit = slugParts.slice(1).join('-');

    // Upsert topic
    const { data: existingTopic } = await supabaseAdmin
      .from("topics")
      .select("id")
      .eq("slug", topic_slug)
      .single();

    let topicId;
    if (existingTopic) {
      topicId = existingTopic.id;
    } else {
      const { data: newTopic, error: topicError } = await supabaseAdmin
        .from("topics")
        .insert({ course, unit, slug: topic_slug })
        .select("id")
        .single();
      
      if (topicError) throw topicError;
      topicId = newTopic.id;
    }

    // Insert quiz pool
    const { data: pool, error: poolError } = await supabaseAdmin
      .from("quiz_pools")
      .insert({
        quiz_id,
        topic_id: topicId,
        difficulty,
        draw_count
      })
      .select("id")
      .single();

    if (poolError) throw poolError;

    return Response.json({ id: pool.id });
  } catch (error) {
    console.error("Add pool error:", error);
    return new Response("Failed to add pool", { status: 500 });
  }
}