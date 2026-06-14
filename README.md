# PRD Generator

A lightweight AI tool that generates structured product requirement documents (PRDs) from a simple problem statement. Built for portfolio demonstration and PM interview prep.

## What It Does
- Input: "Design a class booking system for a university"
- Output: A structured PRD with user stories, acceptance criteria, success metrics, edge cases, and open questions

## Current Status
**Build Phase:** Active development. Core docs and project structure are ready. Code (Streamlit app, prompt templates, validation layer) is being built. See `docs/plan.md` for the full roadmap.

## Why I Built This
PMs spend 2-3 hours on repetitive PRD boilerplate. I wanted to see if I could automate the first 80% using an LLM, while keeping the output structured and defensible. This project also let me practice prompt engineering, API integration, and zero-cost deployment.

## How to Run

### 1. Clone & Set Up
```bash
cd "AI project Prodman"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Get OpenCode GO API Key

1. Go to **https://opencode.ai/auth**
2. Sign in and subscribe to **OpenCode Go** ($5 first month, then $10/month)
3. Copy your API key from the console

### 3. Add API Key
```bash
cp .env.example .env
# Edit .env and paste your OpenCode GO API key
```

### 4. Run
```bash
streamlit run src/main.py
```

## Tech Stack
- Python 3.11+
- **OpenCode GO API** (DeepSeek V4 Flash model)
- Streamlit (UI)
- GitHub + Screenshots (portfolio)

## API Rate Limits
This app uses **OpenCode GO** with the **DeepSeek V4 Flash** model:
- **31,650 requests per 5 hours**
- **~$0.14 per 1M input tokens**
- **~$0.28 per 1M output tokens**
- Very generous limits, ideal for testing and demos

If you hit a rate limit, wait a few minutes and try again.

## Project Structure
```
AI project Prodman/
├── PRD.md                    # What this tool does
├── ARCHITECTURE.md           # How it works
├── DATA.md                   # Test data + evaluation
├── INTERVIEW_PREP.md         # Questions they'll ask
├── src/
│   ├── main.py               # Streamlit app
│   ├── prompt.py             # Prompt templates
│   ├── validator.py          # Output validation
│   └── config.py             # Settings
├── data/
│   ├── test_inputs.json      # Test problem statements
│   ├── real_prds.json        # Public PRD examples
│   └── evaluation_results.json
├── .env.example
└── requirements.txt
```

## Evaluation
**Target:** Test on 10 synthetic problem statements and score outputs against a rubric (1-5 per section). Goal: average score ≥ 4.0/5.0. See `DATA.md` for full methodology and `docs/plan.md` for evaluation timeline.

## Known Limitations
- Output quality depends on prompt quality (generic input = generic output)
- No export to Notion/Confluence yet
- Requires manual evaluation (no automated scoring yet)

## Next Steps
- Add feedback loop (thumbs up/down per section)
- Export to Notion
- Add RAG with past PRDs for style alignment

## Contact
Built by Mujtaba Jafri | Portfolio: [link]
