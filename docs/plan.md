# Project Roadmap

## Phase 1: Foundation ✅
**Goal:** Working app with core generation.

- [x] Set up Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
- [x] Build streaming API route with OpenCode GO / DeepSeek V4 Flash
- [x] Implement split-screen UI (chat + PRD preview)
- [x] Add input/output validation and retry logic
- [x] Deploy to Vercel

**Deliverable:** Live app at mujtaba-prd-generator.vercel.app

## Phase 2: Polish & Refinement ✅
**Goal:** Make it demo-ready and defensible.

- [x] Version history with dropdown selector
- [x] Editable PRD preview with markdown-to-JSON parsing
- [x] Conversational refinement and Quick Refine buttons
- [x] Copy / Download exports
- [x] Time-based progress bar and streaming indicator
- [x] Example prompt cards and sample PRD preview
- [x] Brand identity (indigo, logo, inline SVG icons)
- [x] Mobile responsive layout with bottom tab bar

**Deliverable:** Polished, recruiter-ready UI

## Phase 3: Evaluation ✅
**Goal:** Prove the tool works with data.

- [x] Create `data/test_inputs.json` (10 synthetic problem statements)
- [x] Build `scripts/evaluate.py` (LLM-as-judge evaluator)
- [x] Run evaluation against live deployed API
- [x] Document results: 4.83/5.0 average score
- [x] Update README, DATA.md, and INTERVIEW_PREP.md

**Deliverable:** Defensible quality score with reproducible methodology

## Phase 4: Portfolio Packaging ✅
**Goal:** Make it presentable on GitHub.

- [x] Rewrite README for public GitHub audience
- [x] Add screenshots to README
- [x] Update ARCHITECTURE.md, INTERVIEW_PREP.md, PRD.md
- [x] Push clean commit history to GitHub
- [x] Harden .gitignore for secrets

**Deliverable:** Portfolio-ready GitHub repo

## Phase 5: Stretch Goals (Post-Portfolio)
**Goal:** Show what v2 could look like.

- [ ] Few-shot examples in prompt for higher-quality first drafts
- [ ] Export to Notion / Confluence
- [ ] Shareable links for generated PRDs
- [ ] User accounts with saved history
- [ ] RAG with company-specific PRDs for style alignment
- [ ] Custom domain

**Deliverable:** Clear roadmap for v2

## Current Status

**Phase 1–4 complete.** The app is live, evaluated, and pushed to GitHub.
