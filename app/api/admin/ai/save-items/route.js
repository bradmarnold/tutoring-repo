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
    const { topic_slug, items } = await req.json();
    
    if (!topic_slug || !Array.isArray(items) || items.length === 0) {
      return new Response("Missing required fields: topic_slug, items", { status: 400 });
    }

    // Validate items structure
    for (const item of items) {
      if (!item.prompt || !Array.isArray(item.options) || item.options.length !== 4 || 
          typeof item.correct_index !== 'number' || item.correct_index < 0 || item.correct_index > 3) {
        return new Response("Invalid item structure", { status: 400 });
      }
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

    // Insert items into question_bank
    const bankItems = items.map(item => ({
      topic_id: topicId,
      prompt: item.prompt,
      options: item.options,
      correct_index: item.correct_index,
      difficulty: item.difficulty || 'med',
      teks_code: item.teks_code || null,
      explanation: item.explanation || null,
      created_by: 'ai-assistant'
    }));

    const { error: insertError } = await supabaseAdmin
      .from("question_bank")
      .insert(bankItems);

    if (insertError) throw insertError;

    return Response.json({ saved: items.length });
  } catch (error) {
    console.error("Save items error:", error);
    return new Response("Failed to save items", { status: 500 });
  }
}