# PRD Generator — Interview Prep

## Anticipated Questions & Answers

### Q: "Why did you build this?"
**A:** "PMs spend 2–3 hours on repetitive PRD boilerplate — user stories, acceptance criteria, success metrics. I wanted to automate the first 80% so PMs can focus on judgment and prioritization, not formatting. It also let me practice prompt engineering, full-stack shipping, and quality evaluation."

---

### Q: "How is this different from just asking ChatGPT?"
**A:** "Three things. First, ChatGPT gives a wall of text — this forces structured JSON output with exactly 7 sections. Second, there's a validation layer: if a section is missing or a metric isn't quantitative, it retries automatically. Third, the UX is built for iteration — you can edit the PRD directly, use Quick Refine buttons, or type follow-ups, and each version is preserved."

---

### Q: "What LLM did you use and why?"
**A:** "DeepSeek V4 Flash via the OpenCode GO API. I started with Google Gemini's free tier but hit 429 rate limits — unreliable for a demo. OpenCode GO is $5/month with 31,650 requests per 5 hours. DeepSeek V4 Flash is the cheapest model at $0.14 per million input tokens, with good structured-output performance. The API is OpenAI-compatible, so I could use the standard `openai` library."

---

### Q: "How did you handle hallucination?"
**A:** "The prompt forces a strict JSON schema — the LLM must return exactly 7 keys. The validator checks for missing sections and retries with a stricter prompt if anything is missing. I also validate that at least one success metric is quantitative (contains a number). This catches most hallucination — the LLM can't just ramble."

---

### Q: "How did you evaluate quality?"
**A:** "I used an LLM-as-judge approach. I wrote 10 synthetic problem statements across different domains — SaaS, fintech, health, edtech, etc. — and ran each through the generator. Then I sent each output to a separate LLM judge with a detailed rubric scoring 7 dimensions from 1–5. The average score was 4.83/5.0. I documented the methodology and raw scores in `DATA.md` and `data/evaluation_results.json` so anyone can verify."

---

### Q: "Doesn't the LLM judge just favor your own generator?"
**A:** "The judge is a separate model call — it only sees the final PRD and the original problem statement, not the prompt template. It scores against objective criteria like testability and quantification. I also spot-checked the scores manually to catch edge cases."

---

### Q: "What's the weakest part of the tool?"
**A:** "Problem statements are strong but less quantified than other sections — the LLM reframes the problem clearly but doesn't always add baseline metrics or time loss. That's the highest-leverage prompt improvement. I documented this gap in the README."

---

### Q: "Why Next.js over a simpler stack like Streamlit?"
**A:** "I started with Streamlit to prove the concept, then rebuilt in Next.js because a portfolio project needs to feel like a real product. Next.js gave me full control over the UI (split-screen, streaming, version history), server-side API routes, and free Vercel deployment. Recruiters judge execution quality, and a real web app signals stronger technical ownership."

---

### Q: "Why JSON output instead of Markdown?"
**A:** "JSON makes validation easy — I can check for missing keys programmatically. It also makes refinements more reliable: when the LLM receives JSON and returns JSON, it preserves structure better than when it receives markdown. The UI renders from JSON, so I control the formatting."

---

### Q: "What would you do in v2?"
**A:** "Three things. First, add few-shot examples to the prompt — 2–3 real PRD excerpts to guide the LLM toward higher-quality first drafts. Second, export directly to Notion or Confluence — PRDs are useless sitting in a terminal. Third, add a RAG layer with the company's past PRDs so the output matches their style and terminology."

---

### Q: "How would you deploy this for a real product team?"
**A:** "I'd add user authentication (Clerk or NextAuth), a database (Postgres or Supabase) to persist PRDs, and a Notion integration for export. I'd also add team collaboration — shared PRDs, comments, and approval workflows. The current version is a portfolio demo; a production version needs persistence and multi-user support."

---

### Q: "What edge cases did you handle?"
**A:** "Input validation: empty, too short, too long. Output validation: missing sections, non-quantitative metrics. API errors: rate limits, network failures. Race conditions: if the user sends a new request while one is streaming, the old one is aborted. I also handle the case where the user edits the PRD text — the edits are parsed back to JSON before being sent for refinement."

---

### Q: "How did you handle data privacy?"
**A:** "Only synthetic problem statements — no real company data. The API key is stored in environment variables, never in code. The usage counter is in localStorage only — nothing is sent to a server. No user inputs are logged or stored."

---

### Q: "What's the hardest part of this project?"
**A:** "Prompt engineering. Getting the LLM to output consistently structured JSON with all 7 sections was harder than the code. I had to iterate on the prompt, add validation, and build retry logic. The second hardest part was the streaming UX — making the progress bar feel natural while tokens stream in."

---

### Q: "Why no database?"
**A:** "For v1, I wanted to keep it lightweight and free. localStorage handles the usage counter, and the PRD lives in the browser session. Adding a database would let users save and share PRDs, which is a v2 feature."
