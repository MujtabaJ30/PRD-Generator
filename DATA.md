# PRD Generator – Data & Evaluation

## Why This Evaluation Is Defensible

Real PRDs are proprietary, so we cannot use them directly. Instead, we use:

1. **Synthetic problem statements** written to cover diverse domains (no IP risk).
2. **An LLM-as-judge evaluator** (DeepSeek V4 Flash via OpenCode GO) scoring against a fixed rubric.
3. **Public PRDs** from Google, Intercom, Buffer, Basecamp, and Shape Up as qualitative ground truth for what "good" looks like.

This is honest and interview-defensible: you can say *"I wrote my own test inputs because real PRDs are confidential, then used a consistent LLM judge with a public rubric so the scoring is reproducible."*

## Data Files

| File | Purpose |
|------|---------|
| `data/test_inputs.json` | 10 synthetic problem statements across 10 domains |
| `data/evaluation_results.json` | Per-section scores and overall scores for each input |
| `scripts/evaluate.py` | Re-runnable LLM-as-judge evaluation script |

## Test Inputs

The 10 synthetic problem statements span:

- SaaS / freelancer tools
- EdTech
- Fintech
- HealthTech
- Marketplace
- Productivity / B2B
- E-commerce
- Logistics
- Social / consumer
- Developer Tools / AI

See `data/test_inputs.json` for the exact prompts.

## Evaluation Rubric

Each generated PRD is scored 1–5 on seven sections:

| Section | What "Good" Looks Like |
|---------|------------------------|
| Problem Statement | Clear, specific, and quantified; describes who, what, and why |
| Persona | Specific, believable, actionable target user with relevant context |
| User Stories | Follows "As a [role], I want [goal], so that [benefit]"; relevant and distinct |
| Acceptance Criteria | Testable Given/When/Then format; specific and unambiguous |
| Success Metrics | At least one quantitative metric; realistic, measurable, time-bound |
| Edge Cases | Covers realistic failure modes, race conditions, unusual behavior |
| Open Questions | Decision-driving and relevant to scoping the product |

## Results

**Average overall score: 4.83 / 5.0** across 10 inputs.

| Section | Average Score |
|---------|--------------|
| Problem Statement | 4.20 |
| Persona | 4.90 |
| User Stories | 5.00 |
| Acceptance Criteria | 4.90 |
| Success Metrics | 4.90 |
| Edge Cases | 4.90 |
| Open Questions | 4.90 |

**Key gap:** Problem statements are consistently strong but slightly less quantified than other sections. This is the highest-leverage prompt improvement for Phase 3.

## How to Reproduce

```bash
# Ensure OPENCODE_API_KEY is set in web/.env.local
cd "AI project Prodman"
.venv\Scripts\python scripts\evaluate.py
```

The script calls the live deployed API for each input, then calls the LLM judge. It saves results incrementally to `data/evaluation_results.json` so a rerun resumes where it left off.

## Interview Defense

- **Q:** "Why should I trust your evaluation?"  
  **A:** "I used synthetic inputs because real PRDs are confidential. I scored outputs with a fixed rubric using an LLM judge so the process is reproducible, and I published the raw scores and reasons in `data/evaluation_results.json`."

- **Q:** "Doesn't the LLM judge just favor your own generator?"  
  **A:** "The judge is a separate model call with no access to the prompt template. It only sees the final PRD and the original problem statement, and it scores against objective criteria like testability and quantification."

- **Q:** "What would improve the score?"  
  **A:** "Problem statements need more built-in quantification. I could add a prompt instruction to always include a baseline metric or time loss in the problem statement."
