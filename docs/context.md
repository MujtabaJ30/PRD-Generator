# Context Log — What We Did Today

**Date:** 2026-06-15
**Session:** Project setup & documentation

---

## What We Did

1. **Read global AGENTS.md** — Reviewed coding partner rules (ask before building, break into chunks, teach & suggest, maintain project memory).

2. **Read all existing project files** — `README.md`, `PRD.md`, `ARCHITECTURE.md`, `DATA.md`, `INTERVIEW_PREP.md`.

3. **Identified gaps** — Missing project memory files: `AGENTS.md`, `docs/plan.md`, `docs/decisions.md`, `docs/context.md`.

4. **Created project memory files:**
   - `AGENTS.md` — Project-specific rules (lightweight, prompt-first, evaluation-first, interview-ready)
   - `docs/plan.md` — 5-phase roadmap (Foundation → Core Feature → Data & Evaluation → Polish → Stretch Goals)
   - `docs/decisions.md` — 7 major architectural decisions documented with trade-offs and interview defense
   - `docs/context.md` — This file (today's log)

---

## Observations

- The project has strong planning docs (PRD, ARCHITECTURE, DATA, INTERVIEW_PREP) but no code yet.
- README.md has a placeholder `[link]` for portfolio URL.
- The directory structure in README.md lists `src/`, `data/`, `.env.example` — none of these exist yet.
- This is a well-scoped portfolio project. Risk of over-engineering is low if we follow the "keep it lightweight" rule.

---

## Next Steps

- Phase 2: Core Feature — add few-shot examples to prompt, test with real API key.
- Phase 3: Data & Evaluation — create test inputs, run evaluation script.
- Phase 4: Polish — UI improvements, copy-to-clipboard, screenshots.

---

## Files Changed

| File | Action | Notes |
|------|--------|-------|
| `AGENTS.md` | Created | Project-specific agent instructions |
| `docs/plan.md` | Created | 5-phase roadmap |
| `docs/decisions.md` | Created | 7 architectural decisions with interview defense |
| `docs/context.md` | Created | This session log |
| `.env.example` | Created | Template for Google API key |
| `requirements.txt` | Created | streamlit, google-generativeai, python-dotenv |
| `src/` | Created | Source code directory |
| `data/` | Created | Test data directory |
| `README.md` | Updated | Added "Current Status" section; made evaluation target explicit |
| `src/config.py` | Created | API key loader, validation settings, model config |
| `src/prompt.py` | Created | v1 prompt template + retry prompt |
| `src/validator.py` | Created | Input validation + JSON output validation with metric check |
| `src/main.py` | Created | Minimal Streamlit UI with error handling |
| `.gitignore` | Created | Python venv, .env, IDE files |
| `src/config.py` | Updated | Changed to MODEL_NAMES list with fallback models |
| `src/main.py` | Updated | Added generate_with_fallback() for 429 errors, better error messages |
| `~/.config/opencode/AGENTS.md` | Updated | Added 3 security rules about .env files and secrets |
| `requirements.txt` | Updated | Changed google-generativeai to google-genai |

---

## Session 2: Switch to OpenCode GO

**Date:** 2026-06-15

### What We Did

1. **Hit Google Gemini rate limits** — 429 errors on free tier. `gemini-2.0-flash` had `limit: 0`.

2. **Researched OpenCode GO** — Checked docs at https://opencode.ai/docs/go
   - Found OpenCode GO is a real API provider ($5 first month, then $10/month)
   - Endpoint: `https://opencode.ai/zen/go/v1/chat/completions` (OpenAI-compatible)
   - Models: GLM-5.1, GLM-5, Kimi K2.7 Code, Kimi K2.6, MiMo-V2.5, MiMo-V2.5-Pro, MiniMax M3, MiniMax M2.7, Qwen3.7 Max, Qwen3.7 Plus, Qwen3.6 Plus, DeepSeek V4 Pro, DeepSeek V4 Flash

3. **Selected DeepSeek V4 Flash** — Reasons:
   - **Cheapest**: $0.14/1M input tokens, $0.28/1M output tokens
   - **Highest rate limit**: 31,650 requests per 5 hours
   - **Good for coding**: 790 input, 68,000 cached, 280 output tokens per request
   - **Reliable**: Hosted in US, EU, Singapore

4. **Cleaned up project** — Removed all Google Gemini code:
   - Uninstalled `google-genai` and `google-generativeai`
   - Installed `openai` library
   - Updated `src/config.py` to use OpenCode GO endpoint and DeepSeek V4 Flash
   - Updated `src/main.py` to use OpenAI client with custom base URL
   - Updated `.env.example` for `OPENCODE_API_KEY`
   - Updated `README.md` with new setup instructions

5. **Updated docs/decisions.md** — Added Decision 8: Model Fallback Strategy

### Why the Switch

Google Gemini free tier was unreliable for a demo project. OpenCode GO provides:
- Predictable pricing ($5/month)
- Much higher rate limits
- Better model selection
- OpenAI-compatible API (easy to implement)

### What the User Needs to Do

1. Go to **https://opencode.ai/auth**
2. Sign in and subscribe to **OpenCode Go** ($5 first month, then $10/month)
3. Copy API key from console
4. Paste into `.env` file (copy from `.env.example` first)
5. Run: `streamlit run src/main.py`

### Files Changed

| File | Action | Notes |
|------|--------|-------|
| `requirements.txt` | Updated | Replaced google-genai with openai |
| `.env.example` | Updated | Now shows OPENCODE_API_KEY |
| `src/config.py` | Updated | OpenCode GO endpoint + DeepSeek V4 Flash |
| `src/main.py` | Updated | Uses OpenAI client with custom base URL |
| `README.md` | Updated | New setup instructions for OpenCode GO |
| `docs/decisions.md` | Updated | Added Decision 8: Model Fallback Strategy |
| `docs/context.md` | Updated | Added Session 2 log |

---

*This file is updated after every session. It answers: "What did we do today?"*
