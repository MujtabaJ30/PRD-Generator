# PRD Generator — Architecture & System Design

## Overview

A full-stack web app that takes a product problem statement and generates a structured PRD using an LLM. Built with Next.js, deployed on Vercel, powered by OpenCode GO.

## System Architecture

```
┌─────────────────────────────────────────────────┐
│  Browser (React 19)                             │
│  ┌─────────────┐  ┌──────────────────────────┐  │
│  │ Chat Panel   │  │ PRD Preview (editable)   │  │
│  │ - messages   │  │ - live editor            │  │
│  │ - input      │  │ - version dropdown       │  │
│  │ - refine     │  │ - copy/download          │  │
│  └──────┬───────┘  └──────────┬───────────────┘  │
│         │                     │                  │
│         └──────────┬──────────┘                  │
│                    │ POST /api/generate           │
└────────────────────┼────────────────────────────┘
                     │
┌────────────────────┼────────────────────────────┐
│  Next.js API Route (Vercel Serverless)          │
│                    │                             │
│  ┌─────────────────▼───────────────────────┐    │
│  │  1. Validate input                      │    │
│  │  2. Build prompt (initial / refine)     │    │
│  │  3. Call OpenCode GO (streaming)        │    │
│  │  4. Validate JSON output                │    │
│  │  5. Retry if malformed (up to 2x)       │    │
│  │  6. Stream SSE events to client         │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
└──────────────────────────────────────────────────┘
                     │
┌────────────────────┼────────────────────────────┐
│  OpenCode GO API   │  (OpenAI-compatible)        │
│  Model: DeepSeek V4 Flash                       │
│  Endpoint: https://opencode.ai/zen/go/v1        │
└──────────────────────────────────────────────────┘
```

## Data Flow

### Generate PRD
1. User types a problem statement in the chat input
2. Client sends `POST /api/generate` with `{ problemStatement }`
3. API route validates input (length, vagueness)
4. Builds prompt: system prompt + user prompt (structured JSON instruction)
5. Calls OpenCode GO with `stream: true`
6. Streams `data: { type: "token" }` events to client as tokens arrive
7. On stream end, parses full response as JSON
8. Validates all 7 sections exist + at least one quantitative metric
9. If invalid, retries with stricter prompt (up to 2 times)
10. Sends `data: { type: "done", prd: {...} }` to client
11. Client renders the PRD in the editable preview panel

### Refine PRD
1. User clicks Quick Refine button or types a follow-up
2. Client sends `{ problemStatement, currentPrd, refineAction }`
3. API route builds a refine prompt with the current PRD as JSON context
4. Same streaming + validation flow as above
5. Client adds the new PRD as a new version

## Key Components

### `web/src/lib/prompt.ts`
- `SYSTEM_PROMPT` — role context + output format
- `buildInitialPrompt()` — first-time generation
- `buildRefinePrompt()` — add metrics, expand edges, exec-ready
- `buildRetryPrompt()` — stricter prompt for malformed output
- `buildConversationalPrompt()` — follow-up questions

### `web/src/lib/validator.ts`
- `validateInput()` — min/max length, vagueness check
- `validateOutput()` — JSON parse, all 7 sections, quantitative metric check

### `web/src/lib/config.ts`
- `OPENCODE_API_KEY` — from `process.env.OPENCODE_API_KEY`
- `BASE_URL` — `https://opencode.ai/zen/go/v1`
- `MODEL_NAME` — `deepseek-v4-flash`
- `MAX_RETRIES` — 2

### `web/src/app/api/generate/route.ts`
- Streaming API route using `ReadableStream`
- Instantiates OpenAI client at module scope
- Sends SSE events: `token`, `retry`, `done`, `error`

### `web/src/app/page.tsx`
- Split-screen UI: chat on left, editable PRD preview on right
- State: messages, versions, prd, editablePrd, usage count
- `parseEditablePrd()` — parses user-edited markdown back to JSON
- `formatPrd()` — converts JSON PRD to formatted markdown text

## Prompt Strategy

The prompt is the core feature. It forces the LLM to return a strict JSON object with 7 keys:

```json
{
  "problem_statement": "...",
  "persona": "...",
  "user_stories": ["..."],
  "acceptance_criteria": ["..."],
  "success_metrics": ["..."],
  "edge_cases": ["..."],
  "open_questions": ["..."]
}
```

**Why JSON over Markdown:**
- Easier to validate programmatically (check for missing keys)
- Structured rendering in the UI
- Refinements preserve structure better when the LLM receives JSON and returns JSON

**Validation rules:**
- All 7 sections must be present
- At least one `success_metrics` item must contain a number
- If validation fails, retry with explicit "MUST include all sections" instruction

## Error Handling

| Scenario | Handling |
|----------|----------|
| Empty / too short input | Client-side validation, show inline error |
| Malformed JSON from LLM | Auto-retry up to 2 times with stricter prompt |
| Missing sections | Auto-retry with explicit section list |
| API rate limit (429) | Show "rate limit" error to user |
| Network error | Show error with retry button |
| User cancels generation | AbortController cancels the fetch |

## Evaluation System

`scripts/evaluate.py` implements an LLM-as-judge evaluator:

1. Reads `data/test_inputs.json` (10 synthetic problem statements)
2. For each input, calls the live deployed API
3. Sends the generated PRD to a separate LLM judge (DeepSeek V4 Flash)
4. Judge scores each of 7 sections 1–5 against a rubric
5. Results saved incrementally to `data/evaluation_results.json`
6. Script is resumable — skips already-evaluated inputs on rerun

## Deployment

- **Platform:** Vercel (free tier)
- **URL:** https://mujtaba-prd.vercel.app
- **Build:** `cd web && npm run build`
- **Env vars:** `OPENCODE_API_KEY` set in Vercel dashboard (Production + Preview)
- **CI/CD:** Git push to `master` triggers auto-deploy

## Tech Choices Summary

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | Next.js 16 | App Router, API routes, Vercel-native |
| State | React useState | No need for Redux/Zustand in a single-page app |
| Streaming | SSE via ReadableStream | Simpler than WebSockets for one-way server→client |
| Validation | Custom TS validators | Tight control over JSON schema |
| Styling | Tailwind CSS 4 | Fast iteration, no CSS files |
| API | OpenCode GO | Cheap, reliable, OpenAI-compatible |
| Eval | LLM-as-judge | Consistent, reproducible, with manual spot-checks |
