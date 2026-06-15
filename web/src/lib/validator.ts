import { MIN_INPUT_LENGTH, MAX_INPUT_LENGTH, REQUIRED_SECTIONS } from "./config";

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateInput(text: string): void {
  if (!text?.trim()) {
    throw new ValidationError(
      "Input cannot be empty. Please describe the problem you want to solve."
    );
  }

  const stripped = text.trim();

  if (stripped.length < MIN_INPUT_LENGTH) {
    throw new ValidationError(
      `Input is too short (${stripped.length} chars). Please provide at least ${MIN_INPUT_LENGTH} characters.`
    );
  }

  if (stripped.length > MAX_INPUT_LENGTH) {
    throw new ValidationError(
      `Input is too long (${stripped.length} chars). Please keep it under ${MAX_INPUT_LENGTH} characters.`
    );
  }

  const wordCount = stripped.split(/\s+/).length;
  if (wordCount < 3) {
    throw new ValidationError(
      "Input is too vague. Please add more detail about the users, context, or goals."
    );
  }
}

interface PrdOutput {
  problem_statement: string;
  persona: string;
  user_stories: string[];
  acceptance_criteria: string[];
  success_metrics: string[];
  edge_cases: string[];
  open_questions: string[];
}

function validateOutput(rawOutput: string): PrdOutput {
  let cleaned = rawOutput.trim();

  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  let data: unknown;
  try {
    data = JSON.parse(cleaned);
  } catch (e) {
    throw new ValidationError(`Output is not valid JSON: ${e}`);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new ValidationError(
      "Output must be a JSON object (dictionary), not a list or string."
    );
  }

  const obj = data as Record<string, unknown>;

  const missing = REQUIRED_SECTIONS.filter((key) => !(key in obj));
  if (missing.length) {
    throw new ValidationError(
      `Missing required sections: ${missing.join(", ")}`
    );
  }

  const empty = REQUIRED_SECTIONS.filter((key) => !obj[key]);
  if (empty.length) {
    throw new ValidationError(`Empty required sections: ${empty.join(", ")}`);
  }

  // Check for at least one quantitative metric
  const metrics = obj.success_metrics as string[];
  const hasQuantitative = metrics.some((m) =>
    /\d+%?|\d+\s*(hours|days|weeks|minutes|seconds|users|requests)/i.test(m)
  );
  if (!hasQuantitative) {
    throw new ValidationError(
      "No quantitative metric found in success_metrics. At least one metric must contain a number or time unit."
    );
  }

  return data as PrdOutput;
}

function needsRetry(rawOutput: string): boolean {
  try {
    validateOutput(rawOutput);
    return false;
  } catch {
    return true;
  }
}

export { validateInput, validateOutput, needsRetry, ValidationError };
export type { PrdOutput };
