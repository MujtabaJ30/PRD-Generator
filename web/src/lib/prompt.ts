import type { ChatMessage } from "./types";
import type { PrdOutput } from "./validator";

const SYSTEM_PROMPT =
  "You are a senior product manager at a fast-moving startup. You write structured, specific, and actionable PRDs. You never use generic placeholders. Every metric must be quantitative or time-bound.";

function buildInitialPrompt(problemStatement: string): string {
  return `Given the following problem statement, draft a structured Product Requirements Document (PRD).

Problem Statement:
${problemStatement}

Output a JSON object with exactly these keys:
- "problem_statement": A clear, reframed problem statement (not a copy-paste of the input)
- "persona": A specific target user persona with role and context
- "user_stories": An array of 3-5 user stories in "As a [user], I want [action], so that [benefit]" format
- "acceptance_criteria": An array of 3-5 specific, testable criteria in Given/When/Then format
- "success_metrics": An array of 3-5 metrics, at least one must be quantitative (e.g., "reduce churn by 15%")
- "edge_cases": An array of 3-5 real-world failure modes or edge cases
- "open_questions": An array of 2-3 critical unknowns that need research

Rules:
1. Be specific. Use concrete numbers, roles, and scenarios.
2. Do not use generic placeholders like "improve user experience" or "increase engagement".
3. Every success metric must be measurable or time-bound.
4. Edge cases must be realistic (e.g., "what if the API is down?", "what if the user has no internet?").
5. Open questions must show critical thinking about unknowns, not just restate the problem.

Return ONLY the JSON object. No markdown, no explanations, no code blocks.`;
}

function buildRefinePrompt(
  currentPrd: PrdOutput,
  action: "add_metrics" | "expand_edge_cases" | "exec_ready"
): string {
  const actions: Record<string, string> = {
    add_metrics:
      "Add 3 more specific, quantitative success metrics. Each must include a target number or percentage. Append them to the existing success_metrics array.",
    expand_edge_cases:
      "Add 3 more realistic edge cases and failure modes. Think about networking, data integrity, user errors, abuse, and scale issues. Append them to the existing edge_cases array.",
    exec_ready:
      "Rewrite this PRD to be executive-ready: tighten language, add a one-line summary, make metrics business-facing, and add a risk assessment as the last open_questions entry.",
  };

  return `Here is the current PRD as a JSON object:

${JSON.stringify(currentPrd, null, 2)}

Instruction: ${actions[action]}

Rules:
1. Keep all existing sections and content unless the instruction asks to change them.
2. Preserve the exact same JSON structure with all 7 keys.
3. Every success metric must be quantitative or time-bound.
4. Return ONLY the updated JSON object. No markdown, no explanations.`;
}

function buildRetryPrompt(problemStatement: string, currentPrd?: PrdOutput): string {
  const context = currentPrd
    ? `\nCurrent PRD:\n${JSON.stringify(currentPrd, null, 2)}`
    : "";

  return `The previous output was missing required sections or was too generic.

Problem Statement:
${problemStatement}${context}

Please regenerate the PRD with the same JSON structure, but this time:
1. Ensure ALL 7 sections are present and non-empty.
2. Make every metric specific and quantitative.
3. Make every edge case a realistic failure mode.
4. Make every open question a genuine unknown, not a restatement.

Return ONLY the JSON object.`;
}

function buildConversationalUserPrompt(
  problemStatement: string,
  followUpInstruction: string,
  currentPrd: PrdOutput | null
): string {
  if (!currentPrd) {
    return buildInitialPrompt(problemStatement);
  }

  return `Original problem statement: ${problemStatement}

Current PRD (JSON):
${JSON.stringify(currentPrd, null, 2)}

User's follow-up instruction:
${followUpInstruction}

Update the PRD to incorporate the instruction while keeping all 7 sections and the same JSON structure. Return ONLY the updated JSON object.`;
}

function buildConversationalMessages(
  systemPrompt: string,
  messages: ChatMessage[],
  userMessage: string
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const result: Array<{ role: "system" | "user" | "assistant"; content: string }> =
    [{ role: "system", content: systemPrompt }];

  for (const msg of messages) {
    if (msg.role === "user") {
      result.push({ role: "user", content: msg.content });
    } else if (msg.role === "assistant" && msg.prd) {
      result.push({
        role: "assistant",
        content: JSON.stringify(msg.prd),
      });
    }
  }

  result.push({ role: "user", content: userMessage });

  return result;
}

export {
  SYSTEM_PROMPT,
  buildInitialPrompt,
  buildRefinePrompt,
  buildRetryPrompt,
  buildConversationalUserPrompt,
  buildConversationalMessages,
};
