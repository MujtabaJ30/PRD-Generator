# PRD Generator – Data & Evaluation Plan

## Why This Data Strategy Is Defensible
Real PRDs are proprietary. We cannot access them. Instead, we use:
1. **Publicly available PRDs** from well-known companies (Google, Intercom, Buffer, Basecamp) as ground truth
2. **Synthetic problem statements** that we write ourselves (no IP risk)
3. **Manual evaluation** against a defined rubric (subjective but transparent)

This is honest and interview-defensible: you can say "I used public PRDs as ground truth and wrote my own test inputs because real PRDs are confidential."

## Data Sources

### Ground Truth PRDs (Real Examples)
- Google: "PRD Template for Google Docs" (public blog)
- Intercom: "How we write product specs at Intercom" (public blog)
- Basecamp: "Shape Up" methodology (public book)
- Buffer: "The Anatomy of a Product Spec" (public blog)

Collect 5-10 real PRDs. Extract their sections, user stories, and acceptance criteria.

### Test Inputs (Synthetic Problem Statements)
Write 10-15 problem statements yourself. Examples:
1. "Design a class/lecture hall booking system for a university campus"
2. "Build a feature that lets users split payments in a food delivery app"
3. "Create a system for managers to track 1-on-1 meetings with their team"
4. "Design a notification system that reduces email overload for remote teams"
5. "Build a referral tracking dashboard for a SaaS product"

These are realistic, domain-agnostic, and easy to validate.

## Evaluation Rubric

For each generated PRD, score each section on a 1-5 scale:

| Section | What "Good" Looks Like | Score |
|---------|------------------------|-------|
| Problem Statement | Clearly reframes the input, not just copy-pasted | 1-5 |
| User Stories | Follows "As a [user], I want [action], so that [benefit]" | 1-5 |
| Acceptance Criteria | Specific, measurable, testable (Given/When/Then format) | 1-5 |
| Success Metrics | Contains at least 1 quantitative metric (e.g., "reduce churn by 15%") | 1-5 |
| Edge Cases | Covers real-world failure modes (e.g., "what if API is down?") | 1-5 |
| Open Questions | Shows critical thinking about unknowns | 1-5 |

**Target:** Average score ≥ 4.0 per section (80% quality)

## How to Validate
1. Generate PRDs for all 10-15 test inputs
2. For each output, score every section against the rubric
3. Record scores in a spreadsheet or JSON
4. Compare with real PRDs: "How close is this to what a real PM would write?"
5. Document in README: "Average score: 4.2/5.0. Key gap: open questions were sometimes too generic."

## Interview Defense
- **Q:** "Why should I trust your evaluation?"
- **A:** "I used public PRDs from Google and Intercom as ground truth. I wrote my own test inputs because real PRDs are confidential. I scored outputs manually with a rubric, and I documented the gaps so you can see exactly where the tool falls short."

## Data Files to Create
- `data/test_inputs.json` — 10-15 problem statements
- `data/real_prds.json` — excerpts from public PRDs
- `data/evaluation_results.json` — scores for each generation
