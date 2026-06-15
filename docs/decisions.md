# Architecture & Design Decisions

## Decision 1: Next.js + React over Streamlit

**Context:** I needed a UI for a portfolio project that would impress recruiters.

**Options considered:**
1. Streamlit — fastest path to a working demo, but limited styling and interactivity
2. Flask + Jinja — middle ground, but still requires manual frontend work
3. Next.js + React — full control over UI/UX, modern stack, deployable on Vercel

**Decision:** Next.js 16 with React 19, TypeScript, and Tailwind CSS.

**Why:**
- Recruiters judge portfolio projects partly by execution quality. A real web app signals stronger technical ownership than a Streamlit dashboard.
- Next.js gives me server-side API routes, so I can keep backend logic (prompts, validation, API calls) in one codebase.
- Vercel deployment is free and one-click, making the project live and shareable.
- Tailwind lets me build a polished split-screen UI without writing custom CSS files.

**Trade-off:** More code and complexity than Streamlit. I accept this because the portfolio value of a standalone web app is much higher.

**Interview defense:** "I started with Streamlit to prove the concept quickly, then rebuilt in Next.js because a portfolio project needs to feel like a real product. Next.js let me own the full stack — UI, API routes, streaming, and deployment."

---

## Decision 2: OpenCode GO over Google Gemini

**Context:** I needed a reliable LLM API with predictable availability and rate limits.

**Options considered:**
1. Google Gemini free tier — $0 cost, but hit 429 errors with `limit: 0`
2. OpenAI GPT-4 — best quality, but $0.03/1K tokens adds up for a portfolio demo
3. OpenCode GO — paid but cheap ($5/month), high rate limits, OpenAI-compatible API

**Decision:** OpenCode GO with the DeepSeek V4 Flash model.

**Why:**
- Gemini's free tier was unreliable for a demo project. A recruiter testing the live app and hitting a 429 error is a bad look.
- OpenCode GO is affordable ($5 first month) and offers 31,650 requests per 5 hours.
- DeepSeek V4 Flash is the cheapest model ($0.14/1M input tokens) with strong structured-output performance.
- The OpenAI-compatible API meant I could use the standard `openai` library with a custom `base_url`.

**Trade-off:** Small monthly cost. I accept this because reliability and recruiter experience matter more than $5/month.

**Interview defense:** "I switched from Gemini to OpenCode GO because free-tier rate limits made the demo unreliable. I chose DeepSeek V4 Flash for the best cost-to-rate-limit ratio, and the OpenAI-compatible API kept the implementation simple."

---

## Decision 3: JSON Output over Markdown

**Context:** LLM output needs to be parsed into sections and validated.

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

## Decision 4: LLM-Assisted Evaluation over Pure Manual Scoring

**Context:** I need to measure output quality across 10+ test cases.

**Options considered:**
1. Manual rubric scoring — most transparent, but slow and subjective
2. Automated metrics (BLEU, ROUGE) — fast, but poor fit for PRD quality
3. LLM-as-judge with manual review — fast, consistent, and still explainable

**Decision:** LLM-as-judge with manual spot-checking.

**Why:**
- Manual scoring of 10 outputs × 7 sections would take hours and still be subjective.
- An LLM judge applies the rubric consistently and documents reasoning for each score.
- I spot-check the results to catch obvious errors and retain ownership of the evaluation.

**Trade-off:** The evaluator is itself an LLM, so it can be lenient. I mitigate this by using a detailed rubric and reviewing edge cases.

**Interview defense:** "I used an LLM-as-judge with manual spot-checks to scale the evaluation. I defined a clear rubric across 7 dimensions and verified the results, so the scores are defensible even though they're automated."

---

## Decision 5: Synthetic Test Inputs over Real Company Data

**Context:** I needed test data to evaluate the tool.

**Options considered:**
1. Real company PRDs — proprietary, can't share
2. Synthetic problem statements — no IP risk, fully shareable
3. Public PRDs as ground truth — available, but limited in quantity

**Decision:** Synthetic inputs + public PRDs as informal ground truth.

**Why:**
- Real PRDs are confidential. I can't use them in a portfolio.
- Synthetic inputs let me test edge cases I care about (e.g., vague vs. specific inputs).
- Public PRDs from Google, Intercom, and Basecamp are credible reference points.

**Trade-off:** Synthetic inputs may not reflect real-world complexity. I address this by making them realistic and domain-agnostic.

**Interview defense:** "I used synthetic problem statements because real PRDs are confidential. I referenced public PRDs from Google and Intercom for structure, and I documented exactly what I tested."

---

## Decision 6: No Database (for now)

**Context:** I need to store generated PRDs and evaluation results.

**Options considered:**
1. SQLite — simple, but adds complexity for a demo
2. JSON files + localStorage — zero overhead, easy to version control
3. Cloud database (Firebase, Supabase) — overkill for a portfolio project

**Decision:** JSON files for evaluation data + localStorage for per-browser usage counts.

**Why:**
- No setup required. Just read/write JSON.
- Easy to version control and share.
- Evaluation results are static once generated.
- For a demo, persistence is optional. "New" clears the session, which is acceptable for v1.

**Trade-off:** No multi-user support. No persistent history. I accept this for v1.

**Interview defense:** "I skipped the database for v1 to keep the project lightweight and free. For a real deployment, I'd add a database and user auth so teams can collaborate."

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

## Decision 8: DeepSeek V4 Flash over Other OpenCode GO Models

**Context:** OpenCode GO offers many models (GLM, Kimi, MiniMax, Qwen, DeepSeek).

**Options considered:**
1. DeepSeek V4 Pro — best quality, but more expensive
2. DeepSeek V4 Flash — cheapest, highest rate limit, good for structured output
3. Kimi K2.7 Code — strong for coding tasks, but overkill for PRDs

**Decision:** DeepSeek V4 Flash.

**Why:**
- Cheapest option at $0.14/1M input tokens and $0.28/1M output tokens.
- Highest rate limit: 31,650 requests per 5 hours.
- Good enough quality for structured PRD generation with proper prompting and validation.

**Trade-off:** Not the absolute highest quality model. I compensate with strict validation and retry logic.

**Interview defense:** "I chose DeepSeek V4 Flash because it offered the best cost-to-rate-limit ratio for a demo. For a production product team, I'd benchmark against Pro models and pick based on quality targets."

---

## Decision 9: Vercel for Deployment

**Context:** I needed a free, fast way to host the Next.js app.

**Options considered:**
1. Vercel — native Next.js support, free tier, custom domains
2. Netlify — good alternative, but slightly less optimized for Next.js App Router
3. Self-hosting on a VPS — more control, but adds cost and maintenance

**Decision:** Vercel.

**Why:**
- Native support for Next.js App Router, Server Components, and Edge Functions.
- Free tier is generous enough for a portfolio project.
- Git-based deployments make updates trivial.
- Easy custom domain if I want one later.

**Trade-off:** Vendor lock-in. I accept this for a portfolio project.

**Interview defense:** "I deployed on Vercel because it's the fastest way to ship a Next.js app. For a real product, I'd evaluate Netlify, AWS, or a containerized setup based on team needs."

---

## Decision 10: JSON PRD Context for Refinements

**Context:** When a user clicks "Add Metrics" or edits the PRD and refines, the LLM needs to see the current PRD.

**Options considered:**
1. Send markdown-formatted PRD as text — human-readable, but harder for the LLM to edit reliably
2. Send structured JSON PRD — easier for the LLM to preserve structure and append sections
3. Send only the problem statement — loses all prior context

**Decision:** Send the PRD as structured JSON for refinements.

**Why:**
- The LLM makes fewer structural errors when it receives JSON and is asked to return JSON.
- Appending items to arrays (e.g., more metrics, more edge cases) is more reliable.
- User edits are parsed back into JSON before being sent, so refinements reflect changes.

**Trade-off:** Parsing user-edited markdown back to JSON is imperfect. I fall back to the original JSON if parsing fails.

**Interview defense:** "I send the PRD as JSON during refinements because it preserves structure better than markdown. I also parse user edits back into JSON so refinements reflect their changes, with a fallback to the last valid version."

---

## Decisions Log

| Date | Decision | What Changed | Why |
|------|----------|--------------|-----|
| 2026-06-15 | Next.js over Streamlit | Rebuilt UI in Next.js 16 | Better portfolio execution |
| 2026-06-15 | OpenCode GO over Gemini | Switched API provider | Reliability and rate limits |
| 2026-06-15 | DeepSeek V4 Flash | Selected model | Best cost/rate-limit ratio |
| 2026-06-15 | JSON PRD context | Send JSON for refinements | More reliable structured edits |
| 2026-06-15 | Vercel deployment | Deployed live app | Free, native Next.js hosting |

---

*This document is a living record. Every major architectural choice should be added here with context, trade-offs, and interview defense.*
