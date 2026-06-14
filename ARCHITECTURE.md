# PRD Generator – Architecture & Design

## Overview
A lightweight Python tool that takes a problem statement and generates a structured PRD using an LLM API. Built for local execution and portfolio demonstration.

## Tech Stack
- **Language:** Python 3.11+
- **LLM API:** Google Gemini 2.0 Flash (free tier, 1,000 requests/day)
- **UI:** Streamlit (simple web interface, local + screenshots)
- **Environment:** Python venv (isolated)
- **Validation:** Manual rubric + comparison against real PRDs

## System Architecture

```
User Input (Problem Statement)
    ↓
Input Validation (length, vagueness check)
    ↓
LLM Prompt (structured few-shot)
    ↓
Gemini API Call
    ↓
Response Parsing (extract structured sections)
    ↓
Output Validation (checks for missing sections)
    ↓
Formatted PRD Output
```

## Prompt Engineering Strategy

### Chain-of-Thought Prompt
1. **Role context:** "You are a senior PM at a fast-moving startup."
2. **Task:** "Given a problem statement, draft a structured PRD."
3. **Output format:** JSON with keys: problem_statement, persona, user_stories, acceptance_criteria, success_metrics, edge_cases, open_questions
4. **Few-shot examples:** Include 2 real PRD examples (from public blogs) to show expected quality
5. **Constraints:** "Be specific. Use measurable metrics. Write 3-5 items per section."

### Validation Layer
- Post-LLM check: ensure all 6 sections exist in output
- If missing: retry with stricter prompt
- Quality check: output must contain at least one numerical metric

## Error Handling
- Empty input → reject with reason
- Vague input (<10 chars) → ask for more detail
- API failure → fallback to cached example (if available) or retry with backoff
- Missing sections → auto-retry with explicit instruction

## File Structure
```
AI project Prodman/
├── PRD.md                (this file)
├── ARCHITECTURE.md       (this file)
├── DATA.md               (test data + evaluation)
├── README.md             (how to run)
├── INTERVIEW_PREP.md     (questions + answers)
├── src/
│   ├── main.py           (Streamlit app)
│   ├── prompt.py         (prompt templates)
│   ├── validator.py      (output validation)
│   └── config.py         (API key, settings)
├── data/
│   ├── test_inputs.json      (test problem statements)
│   └── real_prds.json        (public PRD examples for evaluation)
├── .env.example          (template for API key)
└── requirements.txt      (dependencies)
```

## API Integration Notes
- **Google Gemini 2.0 Flash API:** Free tier = 1,000 requests/day, 60 requests/minute
- **Key storage:** `GOOGLE_API_KEY` in `.env` file (never commit to Git)
- **Rate limiting:** built-in with retries (exponential backoff)
- **Cost:** $0 for the free tier

## Deployment
- **Local:** `streamlit run src/main.py`
- **Portfolio:** screenshots + demo video in GitHub README
- **Optional:** Hugging Face Spaces (free, no sleep)
