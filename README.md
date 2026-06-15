# PRD Generator — [Live Demo](https://mujtaba-prd.vercel.app)

> Turn a problem statement into a structured, interview-ready Product Requirements Document in under 20 seconds.

[![Stack](https://img.shields.io/badge/Stack-Next.js%2016%20%7C%20React%2019%20%7C%20TypeScript%20%7C%20Tailwind-black)]()
[![Model](https://img.shields.io/badge/Model-DeepSeek%20V4%20Flash-green)]()
[![Score](https://img.shields.io/badge/Eval%20Score-4.83%20%2F%205.0-blue)]()
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)]()

## Screenshots

| Input | Generating | Output |
|-------|-----------|--------|
| ![Initial Input](./pics/Initial%20Input.png) | ![Generating](./pics/PRD%20Generating.png) | ![Final Result](./pics/Final%20PRD%20Result.png) |

## What It Does

Describe a product problem. Get a structured PRD with:

- **Problem Statement** — reframed with specifics
- **Persona** — a believable target user
- **User Stories** — 3–5, in "As a… I want… so that…" format
- **Acceptance Criteria** — testable Given/When/Then
- **Success Metrics** — at least one quantitative
- **Edge Cases** — realistic failure modes
- **Open Questions** — decision-driving unknowns

Then iterate: edit the PRD directly, type a follow-up, or use **Quick Refine** buttons to add metrics, expand edge cases, or make it exec-ready.

## Try It

**[→ Live Demo](https://mujtaba-prd-generator-4wqjku6ib-mujtabajafri12-3315s-projects.vercel.app)**

Or try one of these example prompts:

- *"Freelancers waste hours chasing clients for invoices across Gmail, spreadsheets, and apps."*
- *"University students struggle to find and book available study rooms on campus."*
- *"Remote teams miss important Slack threads because channels move too fast."*

## How It Works

```
Problem Statement → Input Validation → LLM Prompt (JSON) → Output Validation → PRD
                                        ↑                        |
                                        └── retry if malformed ──┘
```

**Prompt engineering is the core feature.** The prompt forces a strict JSON schema with all 7 sections. A validation layer checks for missing sections and non-quantitative metrics. If the output is malformed, the system retries automatically with a stricter prompt.

## Features

| Feature | What It Does |
|---------|-------------|
| **Streaming generation** | Real-time progress bar while the PRD generates |
| **Version history** | Dropdown to switch between v1, v2, v3… |
| **Live editor** | Edit the PRD directly; edits are parsed back to JSON on blur |
| **Conversational refinement** | Type follow-ups like *"make the metrics more aggressive"* |
| **Quick Refine** | One-click: Add Metrics, Expand Edge Cases, Make Exec-Ready |
| **Copy / Download** | Export as formatted text |
| **Input validation** | Rejects empty, too-short, or too-long inputs |
| **Output validation** | Ensures all 7 sections exist; at least one metric is quantitative |
| **Retry logic** | Auto-retries malformed JSON up to 2 times |
| **Usage counter** | Per-browser daily limit (localStorage only, no server tracking) |
| **Mobile responsive** | Chat and preview stack on small screens |

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Backend | Next.js API Routes with Server-Sent Events for streaming |
| AI | [OpenCode GO](https://opencode.ai) API — DeepSeek V4 Flash |
| Validation | Custom input/output validators with structured JSON schema |
| Deployment | Vercel |

## Evaluation

Tested on 10 synthetic problem statements across SaaS, EdTech, fintech, health, marketplace, productivity, e-commerce, logistics, social, and developer tools domains.

Each output scored 1–5 by an LLM judge (DeepSeek V4 Flash) on 7 dimensions:

| Section | Avg Score |
|---------|-----------|
| Problem Statement | 4.20 |
| Persona | 4.90 |
| User Stories | 5.00 |
| Acceptance Criteria | 4.90 |
| Success Metrics | 4.90 |
| Edge Cases | 4.90 |
| Open Questions | 4.90 |
| **Overall** | **4.83** |

**Key finding:** Problem statements are strong but slightly less quantified than other sections. This is the highest-leverage prompt improvement.

Full methodology: [`DATA.md`](./DATA.md) · Raw scores: [`data/evaluation_results.json`](./data/evaluation_results.json) · Rerun: `python scripts/evaluate.py`

## Project Structure

```
├── web/                           Next.js application
│   ├── src/app/page.tsx           Main UI (split-screen chat + preview)
│   ├── src/app/api/generate/      Streaming API route
│   ├── src/lib/                   Config, prompts, validator, types
│   └── package.json
├── data/
│   ├── test_inputs.json           10 synthetic problem statements
│   └── evaluation_results.json    LLM-as-judge scores
├── scripts/evaluate.py            Re-runnable evaluator
├── docs/                          Decisions, roadmap, session logs
├── ARCHITECTURE.md                System design
├── INTERVIEW_PREP.md              Q&A for PM interviews
└── PRD.md                         The PRD for this tool (meta!)
```

## Run Locally

```bash
cd web
npm install
cp .env.example .env.local   # add your OpenCode GO API key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Design Decisions

Key choices documented in [`docs/decisions.md`](./docs/decisions.md):

1. **Next.js over Streamlit** — real web app, full UI control, Vercel-native
2. **JSON output over Markdown** — enables validation, retry, structured rendering
3. **OpenCode GO over Gemini** — reliable paid API, no more 429 errors
4. **LLM-as-judge evaluation** — consistent, reproducible, with manual spot-checks
5. **No database for v1** — keeps it lightweight and free to host

## Known Limitations

- Output quality depends on input specificity (vague input → generic output)
- Usage counter is per-browser; clearing localStorage resets it
- No persistent storage; history is lost on "New"

## Roadmap

- [ ] Few-shot examples in prompt for higher-quality first drafts
- [ ] Export to Notion / Confluence
- [ ] Shareable links for generated PRDs
- [ ] User accounts with saved history
- [ ] RAG with company-specific PRDs for style alignment

## Contact

Built by **Mujtaba Jafri** — [GitHub](https://github.com/MujtabaJ30) · [LinkedIn](https://linkedin.com/in/mujtaba30)
