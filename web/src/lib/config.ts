const OPENCODE_API_KEY = process.env.OPENCODE_API_KEY ?? "";

// OpenCode GO API — OpenAI-compatible endpoint
const BASE_URL = "https://opencode.ai/zen/go/v1";
const MODEL_NAME = "deepseek-v4-flash";
const MAX_RETRIES = 2;

// Input validation
const MIN_INPUT_LENGTH = 10;
const MAX_INPUT_LENGTH = 2000;

// Required PRD sections
const REQUIRED_SECTIONS = [
  "problem_statement",
  "persona",
  "user_stories",
  "acceptance_criteria",
  "success_metrics",
  "edge_cases",
  "open_questions",
] as const;

export {
  OPENCODE_API_KEY,
  BASE_URL,
  MODEL_NAME,
  MAX_RETRIES,
  MIN_INPUT_LENGTH,
  MAX_INPUT_LENGTH,
  REQUIRED_SECTIONS,
};
