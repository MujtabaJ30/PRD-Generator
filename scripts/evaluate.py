"""LLM-as-judge evaluation for the PRD Generator.

Usage:
    .venv\Scripts\python scripts\evaluate.py

Requires:
    - Python 3.11+
    - requests and openai packages in the virtual environment
    - OPENCODE_API_KEY in web/.env.local
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import requests
from openai import OpenAI

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent
WEB_DIR = ROOT / "web"
DATA_DIR = ROOT / "data"

API_URL = "https://mujtaba-prd-generator-4wqjku6ib-mujtabajafri12-3315s-projects.vercel.app/api/generate"
JUDGE_BASE_URL = "https://opencode.ai/zen/go/v1"
JUDGE_MODEL = "deepseek-v4-flash"
MAX_RETRIES = 2

SECTIONS = [
    "problem_statement",
    "persona",
    "user_stories",
    "acceptance_criteria",
    "success_metrics",
    "edge_cases",
    "open_questions",
]


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class SectionScore:
    score: float
    reason: str


@dataclass
class EvaluationResult:
    id: str
    domain: str
    prompt: str
    prd: dict[str, Any]
    section_scores: dict[str, SectionScore]
    overall: SectionScore


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_api_key() -> str:
    """Load the OpenCode GO API key from web/.env.local."""
    env_file = WEB_DIR / ".env.local"
    if env_file.exists():
        content = env_file.read_text(encoding="utf-8")
        match = re.search(r"OPENCODE_API_KEY\s*=\s*(.+)", content)
        if match:
            return match.group(1).strip().strip('"').strip("'")

    key = os.environ.get("OPENCODE_API_KEY", "")
    if key:
        return key

    raise RuntimeError(
        "OPENCODE_API_KEY not found. Add it to web/.env.local or set it as an environment variable."
    )


def generate_prd(problem_statement: str) -> dict[str, Any]:
    """Call the live PRD Generator API and return the generated PRD JSON."""
    response = requests.post(
        API_URL,
        json={"problemStatement": problem_statement, "currentPrd": None, "refineAction": None},
        headers={"Content-Type": "application/json"},
        timeout=120,
        stream=True,
    )
    response.raise_for_status()

    buffer = ""
    for chunk in response.iter_content(chunk_size=None):
        if not chunk:
            continue
        buffer += chunk.decode("utf-8")
        while "\n\n" in buffer:
            line, buffer = buffer.split("\n\n", 1)
            if not line.startswith("data: "):
                continue
            payload = line[6:].strip()
            if not payload:
                continue
            try:
                data = json.loads(payload)
            except json.JSONDecodeError:
                continue

            if data.get("type") == "done":
                return data["prd"]
            if data.get("type") == "error":
                raise RuntimeError(f"API error: {data.get('error')}")

    raise RuntimeError("Stream ended without a completed PRD")


def build_judge_prompt(problem_statement: str, prd: dict[str, Any]) -> str:
    """Construct the LLM-as-judge prompt."""
    rubric = """
You are an expert product manager evaluating a PRD generated from a problem statement.

Score each of the 7 sections from 1 (poor) to 5 (excellent):

1. problem_statement: Is it clear, specific, and quantified? Does it describe who, what, and why?
2. persona: Is the target user specific, believable, and actionable? Does it include relevant context?
3. user_stories: Do they follow the "As a [role], I want [goal], so that [benefit]" pattern? Are they relevant and distinct?
4. acceptance_criteria: Are they written in Given/When/Then or equivalent testable form? Are they specific and unambiguous?
5. success_metrics: Is at least one metric quantitative? Are they realistic, measurable, and time-bound?
6. edge_cases: Do they cover realistic failure modes, race conditions, or unusual user behavior?
7. open_questions: Are they decision-driving and relevant to scoping the product?

Respond with ONLY a JSON object in this exact format (no markdown, no extra text):

{
  "problem_statement": {"score": 4, "reason": "One sentence explaining the score"},
  "persona": {"score": 4, "reason": "..."},
  "user_stories": {"score": 4, "reason": "..."},
  "acceptance_criteria": {"score": 4, "reason": "..."},
  "success_metrics": {"score": 4, "reason": "..."},
  "edge_cases": {"score": 4, "reason": "..."},
  "open_questions": {"score": 4, "reason": "..."},
  "overall": {"score": 4.0, "reason": "One sentence summarizing the PRD quality"}
}
""".strip()

    return (
        f"{rubric}\n\n"
        f"Problem statement:\n{problem_statement}\n\n"
        f"Generated PRD (JSON):\n{json.dumps(prd, indent=2)}"
    )


def parse_judge_response(text: str) -> dict[str, SectionScore]:
    """Parse the judge's JSON response into section scores."""
    # Strip markdown code fences if present
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

    data = json.loads(text)
    scores = {}
    for section in SECTIONS + ["overall"]:
        item = data.get(section, {})
        scores[section] = SectionScore(
            score=float(item.get("score", 0)),
            reason=str(item.get("reason", "No reason provided.")),
        )
    return scores


def judge_prd(client: OpenAI, problem_statement: str, prd: dict[str, Any]) -> dict[str, SectionScore]:
    """Score a generated PRD using the LLM judge."""
    prompt = build_judge_prompt(problem_statement, prd)

    for attempt in range(MAX_RETRIES + 1):
        try:
            completion = client.chat.completions.create(
                model=JUDGE_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
            )
            raw = completion.choices[0].message.content or "{}"
            return parse_judge_response(raw)
        except Exception as exc:
            if attempt == MAX_RETRIES:
                raise RuntimeError(f"Judge failed after {MAX_RETRIES + 1} attempts: {exc}") from exc
            time.sleep(2)

    raise RuntimeError("Unexpected end of judge retries")


def average_score(results: list[EvaluationResult], section: str) -> float:
    """Compute the average score for a section across all results."""
    scores = [r.section_scores[section].score for r in results if section in r.section_scores]
    return round(sum(scores) / len(scores), 2) if scores else 0.0


def save_summary(outputs_path: Path, test_inputs: list[dict], results: list[EvaluationResult]) -> None:
    """Write the evaluation summary to disk."""
    overall_scores = [r.overall.score for r in results]
    section_averages = {s: average_score(results, s) for s in SECTIONS}
    grand_average = round(sum(overall_scores) / len(overall_scores), 2) if overall_scores else 0.0

    summary = {
        "methodology": "LLM-as-judge using DeepSeek V4 Flash via OpenCode GO",
        "api_url": API_URL,
        "total_inputs": len(test_inputs),
        "successful_evaluations": len(results),
        "average_overall_score": grand_average,
        "section_averages": section_averages,
        "results": [
            {
                "id": r.id,
                "domain": r.domain,
                "prompt": r.prompt,
                "section_scores": {s: asdict(score) for s, score in r.section_scores.items()},
                "overall": asdict(r.overall),
            }
            for r in results
        ],
    }

    with outputs_path.open("w", encoding="utf-8") as fh:
        json.dump(summary, fh, indent=2, ensure_ascii=False)


def load_existing_results(outputs_path: Path) -> dict[str, EvaluationResult]:
    """Load previously saved results so the script can resume."""
    if not outputs_path.exists():
        return {}

    try:
        with outputs_path.open("r", encoding="utf-8") as fh:
            summary = json.load(fh)
    except json.JSONDecodeError:
        return {}

    existing = {}
    for item in summary.get("results", []):
        existing[item["id"]] = EvaluationResult(
            id=item["id"],
            domain=item["domain"],
            prompt=item["prompt"],
            prd=item.get("prd", {}),
            section_scores={s: SectionScore(**item["section_scores"][s]) for s in SECTIONS},
            overall=SectionScore(**item["overall"]),
        )
    return existing


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    api_key = load_api_key()
    judge_client = OpenAI(api_key=api_key, base_url=JUDGE_BASE_URL, timeout=120)

    inputs_path = DATA_DIR / "test_inputs.json"
    outputs_path = DATA_DIR / "evaluation_results.json"

    with inputs_path.open("r", encoding="utf-8") as fh:
        test_inputs = json.load(fh)

    existing = load_existing_results(outputs_path)
    results: list[EvaluationResult] = list(existing.values())
    completed_ids = set(existing.keys())

    remaining = [item for item in test_inputs if item["id"] not in completed_ids]
    print(f"Evaluating {len(remaining)} remaining inputs against {API_URL}\n")

    for idx, item in enumerate(remaining, start=1):
        test_id = item["id"]
        domain = item["domain"]
        prompt = item["prompt"]

        print(f"[{idx}/{len(remaining)}] {test_id} ({domain})")
        print("  Generating PRD...", end=" ", flush=True)
        try:
            prd = generate_prd(prompt)
            print("done")
        except Exception as exc:
            print(f"FAILED: {exc}")
            continue

        print("  Judging...", end=" ", flush=True)
        try:
            scores = judge_prd(judge_client, prompt, prd)
            print("done")
        except Exception as exc:
            print(f"FAILED: {exc}")
            continue

        results.append(
            EvaluationResult(
                id=test_id,
                domain=domain,
                prompt=prompt,
                prd=prd,
                section_scores={s: scores[s] for s in SECTIONS},
                overall=scores["overall"],
            )
        )

        save_summary(outputs_path, test_inputs, results)
        print(f"  Overall: {scores['overall'].score}/5.0 (saved)\n")
        time.sleep(1)

    if not results:
        print("No successful evaluations. Exiting.")
        return 1

    save_summary(outputs_path, test_inputs, results)
    grand_average = round(
        sum(r.overall.score for r in results) / len(results), 2
    )

    print(f"\nEvaluation complete.")
    print(f"Average overall score: {grand_average}/5.0 across {len(results)} inputs")
    print(f"Results saved to: {outputs_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
