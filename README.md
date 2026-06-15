# PRD Generator

> AI that turns problem statements into structured, interview-ready Product Requirements Documents.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-blue)](https://mujtaba-prd-generator-4wqjku6ib-mujtabajafri12-3315s-projects.vercel.app)
[![Stack](https://img.shields.io/badge/Stack-Next.js%2016%20%7C%20React%2019%20%7C%20TypeScript%20%7C%20Tailwind-black)]()
[![Model](https://img.shields.io/badge/Model-DeepSeek%20V4%20Flash-green)]()

![Demo screenshot](./docs/screenshot.png)

## What It Does

Input a product problem statement. Get a structured PRD with:

- Reframed problem statement
- Target user persona
- 3–5 user stories
- 3–5 acceptance criteria
- 3–5 success metrics (at least one quantitative)
- 3–5 edge cases
- 2–3 open questions

Then iterate: edit the PRD, ask follow-ups, or use **Quick Refine** buttons to add metrics, expand edge cases, or make it exec-ready. Every generation becomes a version you can switch between.

## Live Demo

**[mujtaba-prd-generator-4wqjku6ib-mujtabajafri12-3315s-projects.vercel.app](https://mujtaba-prd-generator-4wqjku6ib-mujtabajafri12-3315s-projects.vercel.app)**

Try it with one of these examples:

- *"Freelancers waste hours chasing clients for invoices across Gmail, spreadsheets, and apps."*
- *"University students struggle to find and book available study rooms on campus."*
- *"Remote teams miss important Slack threads because channels move too fast."*

## Why I Built This

PMs spend 2–3 hours on repetitive PRD boilerplate. I wanted to automate the first 80% so PMs can focus on judgment, not formatting. This project let me practice:

- **Product thinking:** defining the right scope, user stories, and success metrics
- **Prompt engineering:** forcing structured JSON output with validation and retry logic
- **Full-stack execution:** shipping a real web app end-to-end on Vercel
- **Quality evaluation:** measuring output against a rubric and iterating

## Features

| Feature | Why It Matters |
|---------|---------------|
| **Streaming generation** | See progress in real time with an animated progress bar |
| **Version history** | Switch between v1, v2, v3… without losing earlier work |
| **Editable PRD preview** | Edit the generated text directly, then refine from your edits |
| **Conversational refinement** | Type follow-ups like *"make the metrics more aggressive"* |
| **Quick Refine buttons** | One-click enhancements: Add Metrics, Expand Edge Cases, Make Exec-Ready |
| **Copy / Download** | Export the PRD as text in one click |
| **Input validation** | Rejects empty, too-short, or vague inputs before wasting an API call |
| **Output validation** | Ensures all 7 sections exist and at least one metric is quantitative |
| **Retry logic** | If the LLM returns malformed JSON, the system retries automatically |
| **Rate-limit transparency** | Shows daily usage count stored only in the browser |
| **Mobile responsive** | Chat and preview panels stack on small screens |

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend:** Next.js API Routes (Server-Sent Events for streaming)
- **AI:** OpenCode GO API with DeepSeek V4 Flash
- **Deployment:** Vercel
- **Validation:** Custom input/output validators with structured JSON schema

## Project Structure

```
AI project Prodman/
├── web/                      # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx      # Main UI
│   │   │   ├── layout.tsx
│   │   │   └── api/generate/ # Streaming API route
│   │   ├── lib/
│   │   │   ├── config.ts     # API settings
│   │   │   ├── prompt.ts     # Prompt templates
│   │   │   ├── validator.ts  # Input/output validation
│   │   │   └── types.ts      # Shared types
│   │   └── app/globals.css
│   ├── .env.local            # API key (not committed)
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── plan.md               # Roadmap
│   ├── decisions.md          # Architecture decisions
│   ├── context.md            # Session logs
│   └── checkpoint.md         # Latest checkpoint
├── PRD.md                    # Product requirements
├── ARCHITECTURE.md           # System design
├── DATA.md                   # Evaluation methodology
├── INTERVIEW_PREP.md         # Q&A for interviews
├── README.md                 # This file
└── AGENTS.md                 # Project-specific agent rules
```

## How to Run Locally

```bash
# 1. Enter the web app
cd "AI project Prodman/web"

# 2. Install dependencies
npm install

# 3. Add your OpenCode GO API key
cp .env.example .env.local
# Edit .env.local and paste your key

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Evaluation

I tested the generator on 10 synthetic problem statements across domains (SaaS, marketplace, fintech, education, health). Each output was scored 1–5 on:

1. Problem clarity
2. Persona specificity
3. User story quality
4. Acceptance criteria testability
5. Metric quantitativeness
6. Edge case realism
7. Open question depth

**Result:** Average score **4.3 / 5.0** across all sections.

See `DATA.md` for the full rubric and `docs/context.md` for the evaluation log.

## Key Design Decisions

1. **Next.js over Streamlit** — A real web app is more impressive to recruiters and gives full UI control.
2. **JSON output over Markdown** — Easier to validate, structure, and render consistently.
3. **OpenCode GO over Google Gemini** — Predictable paid API with higher rate limits; no more 429 failures.
4. **Client-side usage counter** — Simple and private; each visitor has their own count.
5. **No database for v1** — Keeps the project lightweight and free to host.

See `docs/decisions.md` for the full decision log with trade-offs and interview defenses.

## Resume Bullets

Paste these directly into your resume:

> Built and deployed a full-stack AI PRD generator on Vercel (Next.js, React 19, TypeScript) that turns problem statements into structured product requirements with real-time streaming, version history, and conversational refinement.

> Designed a prompt-engineering and validation pipeline that enforces 7-section JSON output with quantitative metrics, achieving a 4.3/5.0 average quality score across 10 synthetic test cases.

> Owned end-to-end product development: user research, UX design, API integration, error handling, deployment, and quality evaluation for a portfolio-facing AI tool.

## Known Limitations

- Output quality depends on input specificity (generic input → generic output).
- Usage counter is per-browser; clearing cookies resets it.
- No persistent cloud storage; history is lost on "New".

## Future Roadmap

- [ ] Add few-shot examples to the prompt for higher-quality first drafts
- [ ] Export directly to Notion / Confluence
- [ ] Shareable links for generated PRDs
- [ ] User accounts with saved history
- [ ] RAG with company-specific PRDs for style alignment

## Contact

Built by **Mujtaba Jafri** for PM/APM portfolio demonstration.

