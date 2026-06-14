# Architecture & Design Decisions

## Decision 1: Python + Streamlit over React/Next.js
**Context:** I needed a UI for a portfolio project.

**Options considered:**
1. React + Next.js — more impressive to frontend-focused recruiters
2. Streamlit — fastest path to a working demo
3. Flask + Jinja — middle ground, but requires more CSS

**Decision:** Streamlit.

**Why:**
- I wanted to ship in a weekend, not a month.
- Streamlit gave me a working UI in 30 minutes with zero CSS.
- For a portfolio project, recruiters care more about the *idea* and *output* than the frontend framework.
- This is a PM tool, not a consumer app — polish matters less than functionality.

**Trade-off:** Streamlit looks generic. I accept that because the value is in the generated PRD content, not the UI chrome.

**Interview defense:** "I chose Streamlit because I wanted to prove the concept fast. For a real product team, I'd rebuild the UI in React or embed it in a tool like Notion."

---

## Decision 2: Google Gemini 2.0 Flash over OpenAI GPT-4
**Context:** I needed an LLM API with zero cost.

**Options considered:**
1. OpenAI GPT-4 — best output quality, but costs $0.03/1K tokens
2. Google Gemini 2.0 Flash — free tier (1,000 requests/day), good enough quality
3. Local LLM (Llama 3) — truly free, but requires GPU and setup complexity

**Decision:** Google Gemini 2.0 Flash.

**Why:**
- Free tier = $0 cost for a portfolio project.
- 1,000 requests/day is more than enough for testing and demos.
- Quality is good enough for structured PRD generation with proper prompting.
- API is simple and well-documented.

**Trade-off:** Gemini's structured output is less reliable than OpenAI's. I compensate with a stricter validation layer.

**Interview defense:** "I chose Gemini because the free tier let me build this at zero cost. For a real product team, I'd switch to OpenAI for better structured output and reliability."

---

## Decision 3: JSON Output over Markdown
**Context:** LLM output needs to be parsed into sections.

**Options considered:**
1. Markdown — human-readable, but hard to parse reliably
2. JSON — structured, easy to validate, but requires the LLM to follow format strictly
3. XML — middle ground, but verbose and less standard for LLMs

**Decision:** JSON with strict schema.

**Why:**
- Validation is easier: I can check for missing keys programmatically.
- Formatting is cleaner: I control how each section is rendered in the UI.
- It forces the LLM to be structured, which improves output quality.

**Trade-off:** LLMs sometimes hallucinate JSON syntax or miss keys. I handle this with retry logic.

**Interview defense:** "I used JSON because it makes validation easy. If a section is missing, I can retry with a stricter prompt. Markdown would be harder to parse reliably."

---

## Decision 4: Manual Evaluation over Automated Scoring
**Context:** I need to measure output quality.

**Options considered:**
1. Automated scoring (BLEU, ROUGE, LLM-as-judge) — fast, but less reliable for PRDs
2. Manual rubric scoring — slow, but transparent and defensible
3. Hybrid (manual + LLM-as-judge) — good compromise, but adds complexity

**Decision:** Manual rubric scoring.

**Why:**
- PRD quality is subjective. A rubric makes it transparent.
- I can honestly say "I scored this manually" in an interview.
- It forces me to actually read the outputs and understand the gaps.
- Real PMs don't use automated metrics — they use judgment.

**Trade-off:** Takes 2-3 hours to evaluate 10 outputs. I accept this because it's a one-time investment.

**Interview defense:** "I used manual evaluation because PRD quality is subjective. I built a rubric with 6 sections scored 1-5, and I tested it on real problem statements. I also documented the gaps so anyone can see where the tool falls short."

---

## Decision 5: Synthetic Test Inputs over Real Company Data
**Context:** I needed test data to evaluate the tool.

**Options considered:**
1. Real company PRDs — proprietary, can't share
2. Synthetic problem statements — no IP risk, fully shareable
3. Public PRDs as ground truth — available, but limited in quantity

**Decision:** Synthetic inputs + public PRDs as ground truth.

**Why:**
- Real PRDs are confidential. I can't use them in a portfolio.
- Synthetic inputs let me test edge cases I care about (e.g., vague vs. specific inputs).
- Public PRDs from Google, Intercom, and Basecamp are credible ground truth.

**Trade-off:** Synthetic inputs may not reflect real-world complexity. I address this by making them realistic and domain-agnostic.

**Interview defense:** "I used synthetic problem statements because real PRDs are confidential. I used public PRDs from Google and Intercom as ground truth. I documented exactly what I tested and how I scored it."

---

## Decision 6: No Database (for now)
**Context:** I need to store generated PRDs and evaluation results.

**Options considered:**
1. SQLite — simple, but adds complexity for a demo
2. JSON files — zero overhead, easy to version control
3. Cloud database (Firebase, Supabase) — overkill for a portfolio project

**Decision:** JSON files.

**Why:**
- No setup required. Just read/write JSON.
- Easy to version control and share.
- Evaluation results are static once generated.
- For a demo, persistence is optional.

**Trade-off:** No multi-user support. No history. I accept this for v1.

**Interview defense:** "I used JSON files for v1 because it's a demo. For a real deployment, I'd add a database and user auth so teams can collaborate."

---

## Decision 7: Single-File Prompt over RAG
**Context:** I want to improve prompt quality with examples.

**Options considered:**
1. Static few-shot prompt — simple, but limited to 2-3 examples
2. RAG (Retrieval-Augmented Generation) — powerful, but requires vector DB and setup
3. No examples — fastest, but lowest quality

**Decision:** Static few-shot prompt for v1.

**Why:**
- RAG is overkill for a demo. It adds vector DB, embedding model, and indexing complexity.
- 2-3 well-chosen examples in the prompt are enough to guide the LLM.
- I can add RAG in v2 as a clear upgrade path.

**Trade-off:** Output style is generic. No company-specific tone.

**Interview defense:** "I used a static few-shot prompt for v1 because it's simple and effective. For v2, I'd add RAG with the company's past PRDs so the output matches their style."

---

## Decision 8: Model Fallback Strategy (Multiple Models)
**Context:** We hit a 429 error with `gemini-2.0-flash` on the free tier. The API returned `limit: 0` for that model.

**Options considered:**
1. Single model (`gemini-2.0-flash`) — simplest, but fails if rate limited
2. Multiple fallback models — tries `gemini-1.5-flash`, then `gemini-1.5-flash-latest`, etc.
3. Use OpenAI API instead — more reliable, but costs money

**Decision:** Multiple fallback models with automatic retry.

**Why:**
- Free tier limits vary by model. `gemini-1.5-flash` has 1,500 requests/day on free tier.
- `gemini-2.0-flash` may not be available on all free tiers or has lower limits.
- Automatic fallback means the app degrades gracefully instead of crashing.
- We handle 429 errors with a clear user message explaining the free tier limits.

**Trade-off:** Output quality might vary slightly between model versions. We accept this because the alternative is a complete failure.

**Interview defense:** "I added model fallback because the free tier has rate limits. If one model is exhausted, the app tries the next one. I also handle 429 errors gracefully with user-friendly messages instead of raw stack traces."

---

## Decisions Log

| Date | Decision | What Changed | Why |
|------|----------|--------------|-----|
| (Today) | Initial setup | Created project memory files | Following global agent instructions for project organization |
| (Next) | TBD | TBD | TBD |

---

*This document is a living record. Every major architectural choice should be added here with context, trade-offs, and interview defense.*
