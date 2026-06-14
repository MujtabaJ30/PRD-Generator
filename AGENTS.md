# Project-Specific Agent Instructions

## Project
PRD Generator — A lightweight AI tool that generates structured product requirement documents (PRDs) from a simple problem statement.

## Quick Context
- **Stack:** Python 3.11+, Streamlit, Google Gemini 2.0 Flash API
- **Goal:** Portfolio project + PM interview prep
- **Status:** Planning complete, build phase starting
- **Budget:** $0 (free tier only)

## Rules for This Project

### 1. Keep It Lightweight
- This is a demo project. Don't over-engineer.
- One feature at a time. No premature abstraction.
- If a library can save 30 minutes of code, ask before installing.

### 2. Prompt Engineering Is the Core Feature
- The prompt template (`src/prompt.py`) is the most important file.
- Treat prompt iterations as code commits — document what changed and why.
- Validation layer (`src/validator.py`) must catch missing sections and generic output.

### 3. Evaluation Is First-Class
- Every code change must be testable against `data/test_inputs.json`.
- Document scores in `docs/context.md` after each evaluation run.
- If a prompt change hurts quality, revert it.

### 4. Documentation Drives the Portfolio
- Recruiters will read README.md, PRD.md, and ARCHITECTURE.md before the code.
- Keep docs in sync with code. If a feature changes, update the docs.
- Use this project as a case study: explain *why* you made every decision.

### 5. Interview-Ready Output
- Every file should be defensible in an interview.
- If you take a shortcut, document it honestly (e.g., "Streamlit chosen for speed, not scale").
- Known limitations are features, not bugs — if documented well.

## File Reference
| File | Purpose |
|------|---------|
| `PRD.md` | What this tool does |
| `ARCHITECTURE.md` | How it works |
| `DATA.md` | Test data + evaluation methodology |
| `README.md` | How to run + portfolio pitch |
| `INTERVIEW_PREP.md` | Q&A for interviews |
| `docs/plan.md` | Roadmap |
| `docs/decisions.md` | Why we chose X not Y |
| `docs/context.md` | What we did today |

## Global Rules Still Apply
All rules from `~/.config/opencode/AGENTS.md` (global instructions) remain in effect.
