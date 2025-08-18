// lib/ai/generator.js - Template generation and distractor creation

import { openai } from '@/lib/openaiClient';

// Choose random values from variable definitions
export function chooseValues(variables) {
  const values = {};
  
  for (const [name, def] of Object.entries(variables)) {
    if (def.choices && Array.isArray(def.choices)) {
      // Choose from predefined list
      values[name] = def.choices[Math.floor(Math.random() * def.choices.length)];
    } else if (def.min !== undefined && def.max !== undefined) {
      // Choose from range
      const range = def.max - def.min;
      if (def.int) {
        values[name] = def.min + Math.floor(Math.random() * (range + 1));
      } else {
        values[name] = def.min + Math.random() * range;
        if (def.precision) {
          values[name] = parseFloat(values[name].toFixed(def.precision));
        }
      }
    } else {
      // Default to 1 if no definition
      values[name] = 1;
    }
  }
  
  return values;
}

// Replace {{var}} placeholders in markdown
export function renderTemplate({ markdown, values }) {
  let result = markdown;
  
  for (const [name, value] of Object.entries(values)) {
    const placeholder = new RegExp(`\\{\\{${name}\\}\\}`, 'g');
    result = result.replace(placeholder, value.toString());
  }
  
  return result;
}

// Generate distractors for multiple choice questions
export async function makeDistractors({ topic, difficulty, correct, values, prompt }) {
  const distractors = [];
  
  // Rule-based distractors for math
  if (topic?.toLowerCase().includes('calc') || topic?.toLowerCase().includes('math')) {
    distractors.push(...generateMathDistractors(correct, values));
  }
  
  // If we have fewer than 3 distractors, try OpenAI
  if (distractors.length < 3 && openai) {
    try {
      const aiDistractors = await generateAIDistractors({ prompt, correct, topic, difficulty });
      distractors.push(...aiDistractors);
    } catch (error) {
      console.error('AI distractor generation failed:', error?.error?.type || error?.message);
    }
  }
  
  // Fill remaining slots with basic variations
  while (distractors.length < 3) {
    const variation = generateBasicVariation(correct, distractors.length);
    if (!distractors.includes(variation)) {
      distractors.push(variation);
    }
  }
  
  // Remove duplicates and take first 3
  return [...new Set(distractors)].slice(0, 3);
}

// Rule-based math distractors
function generateMathDistractors(correct, values) {
  const distractors = [];
  const numericCorrect = parseFloat(correct);
  
  if (!isNaN(numericCorrect)) {
    // Power rule errors (off by one)
    if (values.n) {
      distractors.push(`${values.n - 1}·x^{${values.n - 2}}`);
      distractors.push(`x^{${values.n - 1}}`);
    }
    
    // Sign errors
    if (numericCorrect > 0) {
      distractors.push((-numericCorrect).toString());
    } else if (numericCorrect < 0) {
      distractors.push((-numericCorrect).toString());
    }
    
    // Missing coefficient/chain rule
    if (values.a && values.a !== 1) {
      distractors.push((numericCorrect / values.a).toString());
    }
    
    // Common fraction errors
    if (numericCorrect === 0.5) {
      distractors.push('1/√x', '2√x');
    }
  }
  
  return distractors.filter(d => d !== correct);
}

// AI-generated distractors
async function generateAIDistractors({ prompt, correct, topic, difficulty }) {
  if (!openai) return [];
  
  try {
    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: `Generate 3 plausible but incorrect answers for this ${topic} question:

Question: ${prompt}
Correct answer: ${correct}
Difficulty: ${difficulty}

Requirements:
- Each distractor should be concise (under 15 words)
- Represent common student mistakes
- Be mathematically or conceptually related
- Avoid the correct answer

Return only the 3 distractors, one per line.`
    });
    
    const text = response.output_text?.trim() || '';
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line && line !== correct)
      .slice(0, 3);
  } catch (error) {
    console.error('OpenAI distractor error:', error);
    return [];
  }
}

// Basic variation generator
function generateBasicVariation(correct, index) {
  const numericCorrect = parseFloat(correct);
  
  if (!isNaN(numericCorrect)) {
    switch (index) {
      case 0: return (numericCorrect * 2).toString();
      case 1: return (numericCorrect / 2).toString();
      case 2: return (numericCorrect + 1).toString();
      default: return (numericCorrect - 1).toString();
    }
  }
  
  // For non-numeric answers
  return `Option ${index + 1}`;
}

// Create shuffled options array with correct answer
export function toOptions({ correct, distractors }) {
  const allOptions = [correct, ...distractors.slice(0, 3)];
  
  // Shuffle using Fisher-Yates
  for (let i = allOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
  }
  
  // Find the correct index after shuffling
  const correctIndex = allOptions.indexOf(correct);
  
  return {
    options: allOptions,
    correctIndex
  };
}