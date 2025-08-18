// lib/ai/validate.js - Validation helpers for template system

// Normalize difficulty values
export function normalizeDifficulty(difficulty) {
  if (typeof difficulty !== 'string') return 'med';
  
  const normalized = difficulty.toLowerCase().trim();
  switch (normalized) {
    case 'easy':
    case 'e':
      return 'easy';
    case 'medium':
    case 'med':
    case 'm':
      return 'med';
    case 'hard':
    case 'h':
    case 'difficult':
      return 'hard';
    default:
      return 'med';
  }
}

// Dedupe options to avoid duplicate distractors
export function dedupeOptions(options) {
  const seen = new Set();
  const result = [];
  
  for (const option of options) {
    const normalized = option.toString().trim().toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(option);
    }
  }
  
  return result;
}

// Validate variable definitions
export function validateVariables(variables) {
  const errors = [];
  
  if (!variables || typeof variables !== 'object') {
    return ['Variables must be an object'];
  }
  
  for (const [name, def] of Object.entries(variables)) {
    if (!name.match(/^[a-zA-Z][a-zA-Z0-9_]*$/)) {
      errors.push(`Variable name "${name}" must start with letter and contain only letters, numbers, and underscores`);
      continue;
    }
    
    if (!def || typeof def !== 'object') {
      errors.push(`Variable "${name}" must have a definition object`);
      continue;
    }
    
    if (def.choices && Array.isArray(def.choices)) {
      if (def.choices.length === 0) {
        errors.push(`Variable "${name}" choices array cannot be empty`);
      }
    } else if (def.min !== undefined || def.max !== undefined) {
      if (typeof def.min !== 'number' || typeof def.max !== 'number') {
        errors.push(`Variable "${name}" min and max must be numbers`);
      } else if (def.min >= def.max) {
        errors.push(`Variable "${name}" min must be less than max`);
      }
    } else {
      errors.push(`Variable "${name}" must have either choices array or min/max range`);
    }
  }
  
  return errors;
}

// Validate markdown template
export function validateTemplate(markdown, variables) {
  const errors = [];
  
  if (!markdown || typeof markdown !== 'string') {
    return ['Template must be a non-empty string'];
  }
  
  // Find all placeholders
  const placeholders = markdown.match(/\{\{([^}]+)\}\}/g) || [];
  const variableNames = Object.keys(variables || {});
  
  for (const placeholder of placeholders) {
    const varName = placeholder.slice(2, -2).trim();
    if (!variableNames.includes(varName)) {
      errors.push(`Placeholder {{${varName}}} has no corresponding variable definition`);
    }
  }
  
  return errors;
}

// Basic content safety check
export function contentSafetyLint(text) {
  const issues = [];
  
  if (!text || typeof text !== 'string') {
    return issues;
  }
  
  const lower = text.toLowerCase();
  
  // Check for potentially problematic content
  const problematicPatterns = [
    /\b(password|secret|token|key)\b/i,
    /\b(kill|die|death|suicide)\b/i,
    /\b(hate|racist|sexist)\b/i
  ];
  
  for (const pattern of problematicPatterns) {
    if (pattern.test(text)) {
      issues.push(`Content may contain inappropriate material: ${pattern.source}`);
    }
  }
  
  return issues;
}

// Math equivalence check using basic comparison
export function mathEquivalent(a, b) {
  if (a === b) return true;
  
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  
  if (!isNaN(numA) && !isNaN(numB)) {
    return Math.abs(numA - numB) < 0.0001;
  }
  
  // Basic algebraic equivalence (simplified)
  const normalizeA = a.toString().replace(/\s+/g, '').replace(/\*\*/g, '^');
  const normalizeB = b.toString().replace(/\s+/g, '').replace(/\*\*/g, '^');
  
  return normalizeA === normalizeB;
}