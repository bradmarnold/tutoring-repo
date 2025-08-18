import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { validateVariables, validateTemplate, normalizeDifficulty } from "@/lib/ai/validate";

export async function POST(req) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  if (!supabaseAdmin) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { 
      title, 
      topic_slug, 
      difficulty, 
      teks_code, 
      prompt_md, 
      variables, 
      solution_steps_md, 
      explanation_md,
      notes 
    } = await req.json();

    if (!title || !topic_slug || !prompt_md || !variables) {
      return Response.json({ 
        error: "Missing required fields: title, topic_slug, prompt_md, variables" 
      }, { status: 400 });
    }

    // Validate variables
    const variableErrors = validateVariables(variables);
    if (variableErrors.length > 0) {
      return Response.json({ 
        error: "Variable validation failed", 
        details: variableErrors 
      }, { status: 400 });
    }

    // Validate template
    const templateErrors = validateTemplate(prompt_md, variables);
    if (templateErrors.length > 0) {
      return Response.json({ 
        error: "Template validation failed", 
        details: templateErrors 
      }, { status: 400 });
    }

    // Get or create topic
    const { data: existingTopic } = await supabaseAdmin
      .from("topics")
      .select("id")
      .eq("slug", topic_slug)
      .single();

    let topicId;
    if (existingTopic) {
      topicId = existingTopic.id;
    } else {
      // Parse topic_slug to create topic
      const slugParts = topic_slug.split('-');
      if (slugParts.length < 2) {
        return Response.json({ 
          error: "Invalid topic_slug format. Expected 'course-unit'" 
        }, { status: 400 });
      }
      
      const course = slugParts[0];
      const unit = slugParts.slice(1).join('-');

      const { data: newTopic, error: topicError } = await supabaseAdmin
        .from("topics")
        .insert({ course, unit, slug: topic_slug })
        .select("id")
        .single();
      
      if (topicError) throw topicError;
      topicId = newTopic.id;
    }

    // Create template
    const { data: template, error: templateError } = await supabaseAdmin
      .from("question_templates")
      .insert({
        topic_id: topicId,
        title,
        prompt_md,
        variables,
        difficulty: normalizeDifficulty(difficulty),
        teks_code: teks_code || null,
        notes: notes || null,
        solution_steps_md: solution_steps_md || null,
        explanation_md: explanation_md || null,
        created_by: 'admin'
      })
      .select("id")
      .single();

    if (templateError) throw templateError;

    return Response.json({ id: template.id });
  } catch (error) {
    console.error("Create template error:", error);
    return Response.json({ error: "Failed to create template" }, { status: 500 });
  }
}