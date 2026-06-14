# Project Roadmap

## Phase 1: Foundation (Setup & Config)
**Goal:** Get a working development environment.

- [ ] Create Python venv and install dependencies
- [ ] Create `.env.example` and `.gitignore`
- [ ] Create `src/config.py` for API key and settings
- [ ] Verify Gemini API key works with a simple call
- [ ] Create `src/prompt.py` with v1 prompt template
- [ ] Create `src/validator.py` with basic section checks
- [ ] Create `src/main.py` with minimal Streamlit UI

**Deliverable:** `streamlit run src/main.py` opens a working UI.

## Phase 2: Core Feature (Generate PRD)
**Goal:** End-to-end flow from input to structured output.

- [ ] Input validation (empty, too short, too vague)
- [ ] Prompt engineering v2 — add few-shot examples
- [ ] JSON parsing and error handling
- [ ] Output validation (all 6 sections present, at least 1 metric)
- [ ] Display formatted PRD in Streamlit
- [ ] Retry logic for missing sections

**Deliverable:** Input a problem statement → get a structured PRD in <10 seconds.

## Phase 3: Data & Evaluation
**Goal:** Prove the tool works with real-ish data.

- [ ] Create `data/test_inputs.json` (10-15 synthetic problem statements)
- [ ] Create `data/real_prds.json` (excerpts from public PRDs)
- [ ] Build evaluation script (`scripts/evaluate.py`)
- [ ] Run evaluation, score each output against rubric
- [ ] Document results in `DATA.md` and `README.md`
- [ ] Identify gaps (e.g., "open questions are too generic")

**Deliverable:** Average score ≥ 4.0/5.0 per section.

## Phase 4: Polish & Portfolio
**Goal:** Make it demo-ready.

- [ ] Add error handling for API failures (exponential backoff)
- [ ] Improve UI styling (markdown rendering, section headers)
- [ ] Add copy-to-clipboard or download-as-markdown
- [ ] Write `README.md` portfolio pitch
- [ ] Record screenshots / demo video
- [ ] Add GitHub repo with clean commit history

**Deliverable:** Portfolio-ready project with screenshots.

## Phase 5: Stretch Goals (Post-Portfolio)
**Goal:** Show what v2 could look like.

- [ ] Export to Notion/Confluence
- [ ] Add thumbs up/down feedback loop per section
- [ ] Add RAG with past PRDs for style alignment
- [ ] Support multi-file input (existing PRD + new requirement)
- [ ] Add "creativity vs. structure" toggle

**Deliverable:** Clear roadmap for v2 in README.md.

## Completed So Far
- [x] Write PRD.md, ARCHITECTURE.md, DATA.md, INTERVIEW_PREP.md
- [x] Create project memory files (AGENTS.md, docs/plan.md, docs/decisions.md, docs/context.md)
