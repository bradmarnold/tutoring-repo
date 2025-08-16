import OpenAI from "openai";

// Handle missing environment variables gracefully during build
const openaiApiKey = process.env.OPENAI_API_KEY;
export const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
