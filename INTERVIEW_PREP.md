# PRD Generator – Interview Prep

## Anticipated Questions & Answers

### Q: "Why did you build this?"
**A:** "I noticed PMs spend 2-3 hours on repetitive PRD boilerplate. I wanted to see if I could automate the first 80% using an LLM, while keeping the output structured and usable. It also let me practice prompt engineering and API integration at zero cost."

### Q: "How is this different from a simple ChatGPT prompt?"
**A:** "ChatGPT gives a wall of text. This tool forces structured output with a specific JSON format: user stories, acceptance criteria, success metrics, edge cases, and open questions. I added a validation layer that checks if the output is missing any section, and I scored it against real PRDs from Google and Intercom."

### Q: "What API did you use?"
**A:** "Google Gemini 2.0 Flash. I chose it because the free tier gives 1,000 requests per day — zero cost for a portfolio project. I also had to think about rate limits (60 requests/minute), which is a real constraint I had to design around."

### Q: "How did you handle the hallucination problem?"
**A:** "I used a few-shot prompt with 2 real PRD examples so the model knows the expected format. I also added a post-processing validation layer: if the output is missing a section or has no metrics, it retries with a stricter prompt. I documented the error rates so I know where it still fails."

### Q: "What would you do in version 2?"
**A:** "Three things: 1) Add user feedback loop — thumbs up/down on each section so the model improves over time. 2) Export to Notion/Confluence — PRDs are useless if they sit in a terminal. 3) Add a domain-specific mode — the current version is generic, but a PRD for an OKR tool should look different from one for a payments app."

### Q: "How did you evaluate the quality?"
**A:** "I built a rubric with 6 sections scored 1-5. I tested it on 10 problem statements, compared outputs against real PRDs from public blogs, and got an average score of 4.2/5.0. I documented the gaps in the README so anyone can see exactly where the tool falls short."

### Q: "What edge cases did you handle?"
**A:** "Input validation: reject empty or vague input. Output validation: if a section is missing, retry. API failure: exponential backoff. I also tested with ambiguous problem statements — the tool sometimes gives generic answers, which I documented as a known limitation."

### Q: "How would you deploy this for a real product team?"
**A:** "For a real team, I'd use the OpenAI API instead of Gemini because it has better structured output support. I'd add a database layer to store user-generated PRDs, and build a Notion integration for export. The UI would be a web app with user auth so teams can collaborate."

### Q: "What would you do if the company had proprietary PRDs?"
**A:** "I'd use retrieval-augmented generation (RAG) — index the company's past PRDs and use them as few-shot examples in the prompt. That would improve quality and keep the output aligned with the company's style."

### Q: "How did you handle data privacy?"
**A:** "For this demo, I only used synthetic problem statements — no real company data. If deployed, I'd ensure the API key is stored in environment variables, and the app does not log or store any user inputs."

### Q: "What is the hardest part of this project?"
**A:** "The prompt engineering. Getting the LLM to output consistently structured JSON with specific sections was harder than the code. I had to iterate 10+ times on the prompt to get it to follow the format reliably."

### Q: "Why did you choose Streamlit over React?"
**A:** "I wanted to ship fast. Streamlit let me go from zero to a working UI in 30 minutes. For a portfolio project, recruiters care more about the idea and the output than the frontend framework."
