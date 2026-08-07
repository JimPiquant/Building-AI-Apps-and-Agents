"""
Retrieval + Groundedness eval driver — provided as-is.

Reads part_a_transcript.jsonl (written by part_a_grounded_agent.py) and scores
each row with the Foundry evaluators from azure-ai-evaluation.

Definition of done:
  - Retrieval score >= 0.7 on the answerable set
  - Groundedness score >= 0.8 across the whole set

Reference: Module 3 (Evaluating Retrieval) + Learn:
    https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/develop/evaluate-sdk
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from statistics import mean

from dotenv import load_dotenv

from azure.ai.evaluation import (
    RetrievalEvaluator,
    GroundednessEvaluator,
)

load_dotenv(Path(__file__).resolve().parents[2] / ".env")
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

TRANSCRIPT = Path(__file__).parent / "part_a_transcript.jsonl"
BASELINE_OUT = Path(__file__).parent / "part_a_baseline.json"

MODEL_CONFIG = {
    "azure_endpoint": os.environ["FOUNDRY_PROJECT_ENDPOINT"],
    "azure_deployment": os.environ.get("FOUNDRY_MODEL", "gpt-5.4-mini"),
    # AzureCliCredential is picked up implicitly by azure-ai-evaluation.
}

RETRIEVAL_THRESHOLD = 0.7
GROUNDEDNESS_THRESHOLD = 0.8


def _load_transcript() -> list[dict]:
    if not TRANSCRIPT.exists():
        raise SystemExit(
            f"{TRANSCRIPT} not found. Run part_a_grounded_agent.py first."
        )
    rows = []
    with TRANSCRIPT.open() as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def main() -> None:
    rows = _load_transcript()

    retrieval = RetrievalEvaluator(model_config=MODEL_CONFIG)
    grounded = GroundednessEvaluator(model_config=MODEL_CONFIG)

    scores = {"retrieval": [], "groundedness": []}
    per_row = []

    for r in rows:
        query = r["query"]
        answer = r["answer"]

        # Retrieval evaluator scores 1-5 by default — normalize to 0-1
        ret = retrieval(query=query, response=answer)
        gnd = grounded(query=query, response=answer, context=answer)

        ret_score = float(ret.get("retrieval", ret.get("retrieval_score", 0))) / 5.0
        gnd_score = float(gnd.get("groundedness", gnd.get("groundedness_score", 0))) / 5.0

        per_row.append({
            "query": query,
            "should_answer": r["should_answer"],
            "retrieval": ret_score,
            "groundedness": gnd_score,
        })

        if r["should_answer"]:
            scores["retrieval"].append(ret_score)
        scores["groundedness"].append(gnd_score)

    ret_mean = mean(scores["retrieval"]) if scores["retrieval"] else 0.0
    gnd_mean = mean(scores["groundedness"]) if scores["groundedness"] else 0.0

    print("\n--- Part A eval results ---")
    for row in per_row:
        marker = "✓" if row["should_answer"] else "✗"
        print(f"  {marker} R={row['retrieval']:.2f}  G={row['groundedness']:.2f}  {row['query']}")
    print(f"\n  Retrieval mean (answerable): {ret_mean:.2f}  (target >= {RETRIEVAL_THRESHOLD})")
    print(f"  Groundedness mean (all):     {gnd_mean:.2f}  (target >= {GROUNDEDNESS_THRESHOLD})")

    summary = {
        "retrieval_mean_answerable": ret_mean,
        "groundedness_mean_all": gnd_mean,
        "retrieval_target": RETRIEVAL_THRESHOLD,
        "groundedness_target": GROUNDEDNESS_THRESHOLD,
        "pass": ret_mean >= RETRIEVAL_THRESHOLD and gnd_mean >= GROUNDEDNESS_THRESHOLD,
        "per_row": per_row,
    }
    BASELINE_OUT.write_text(json.dumps(summary, indent=2))
    print(f"\nBaseline written to {BASELINE_OUT}")
    if not summary["pass"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
