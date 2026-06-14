"""Prompt templates for PRD generation.

The prompt is the core feature of this tool. Every change should be
documented in docs/context.md with before/after quality scores.
"""

SYSTEM_PROMPT = """You are a senior product manager at a fast-moving startup. You write structured, specific, and actionable PRDs. You never use generic placeholders. Every metric must be quantitative or time-bound."""

PRD_GENERATION_PROMPT = """Given the following problem statement, draft a structured Product Requirements Document (PRD).

Problem Statement:
{problem_statement}

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

Return ONLY the JSON object. No markdown, no explanations, no code blocks.
"""

RETRY_PROMPT = """The previous output was missing required sections or was too generic.

Problem Statement:
{problem_statement}

Please regenerate the PRD with the same JSON structure, but this time:
1. Ensure ALL 7 sections are present and non-empty.
2. Make every metric specific and quantitative.
3. Make every edge case a realistic failure mode.
4. Make every open question a genuine unknown, not a restatement.

Return ONLY the JSON object.
"""


def build_prompt(problem_statement: str) -> str:
    """Build the full prompt from a problem statement.

    Args:
        problem_statement: The raw user input.

    Returns:
        Formatted prompt string ready for the LLM.
    """
    return PRD_GENERATION_PROMPT.format(problem_statement=problem_statement)


def build_retry_prompt(problem_statement: str) -> str:
    """Build a stricter retry prompt for failed outputs.

    Args:
        problem_statement: The raw user input.

    Returns:
        Formatted retry prompt string.
    """
    return RETRY_PROMPT.format(problem_statement=problem_statement)
