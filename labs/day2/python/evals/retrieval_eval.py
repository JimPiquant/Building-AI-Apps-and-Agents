"""
Retrieval + Groundedness eval driver — provided as-is.

Reads part_a_transcript.jsonl (written by part_a_grounded_agent.py) and scores
each row with retrieval, groundedness, relevance, and answerability evaluators.

Definition of done:
    - Retrieval score >= 3.5 on the answerable set
    - Groundedness score >= 4.0 across the whole set

Setup:
    Set EVALUATION_MODEL to the deployment name of a reasoning model available at
    AZURE_OPENAI_ENDPOINT. For example:

        EVALUATION_MODEL=gpt-5.6-luna uv run python evals/retrieval_eval.py

Reference: Module 3 (Evaluating Retrieval) + Learn:
    https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/develop/evaluate-sdk
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from statistics import mean

from dotenv import load_dotenv

from azure.ai.evaluation import GroundednessEvaluator, RelevanceEvaluator, RetrievalEvaluator
from azure.identity import AzureCliCredential

load_dotenv(Path(__file__).resolve().parents[2] / ".env")
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

TRANSCRIPT = Path(__file__).parent / "part_a_transcript.jsonl"
BASELINE_OUT = Path(__file__).parent / "part_a_baseline.json"

EVALUATION_MODEL = os.environ.get("EVALUATION_MODEL")
if not EVALUATION_MODEL:
    raise SystemExit(
        "Set EVALUATION_MODEL to a deployed reasoning model, "
        "for example gpt-5.6-luna."
    )

MODEL_CONFIG = {
    "azure_endpoint": os.environ["AZURE_OPENAI_ENDPOINT"],
    "azure_deployment": EVALUATION_MODEL,
}

# The built-in quality evaluators return scores from 1 (poor) to 5 (excellent).
RETRIEVAL_THRESHOLD = 3.5
GROUNDEDNESS_THRESHOLD = 4.0
RELEVANCE_THRESHOLD = 3.5
ANSWERABILITY_THRESHOLD = 1.0


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


def _abstained(answer: str) -> bool:
    answer = answer.casefold().replace("’", "'")
    return "i don't have" in answer or "i do not have" in answer


def main() -> None:
    rows = _load_transcript()
    if any(row["should_answer"] and not row.get("context") for row in rows):
        raise SystemExit(
            "The transcript has no retrieved context. Rerun part_a_grounded_agent.py "
            "before evaluating it."
        )

    credential = AzureCliCredential()
    evaluator_options = {
        "model_config": MODEL_CONFIG,
        "credential": credential,
        # Reasoning models require different token parameters than older models.
        "is_reasoning_model": True,
    }
    retrieval = RetrievalEvaluator(**evaluator_options)
    groundedness = GroundednessEvaluator(**evaluator_options)
    relevance = RelevanceEvaluator(**evaluator_options)

    per_row = []
    try:
        for row in rows:
            query = row["query"]
            answer = row["answer"]
            context = row["context"]

            retrieval_score = None
            if row["should_answer"]:
                retrieval_score = float(retrieval(query=query, context=context)["retrieval"])

            groundedness_score = float(
                groundedness(query=query, response=answer, context=context)["groundedness"]
            )
            relevance_score = float(relevance(query=query, response=answer)["relevance"])
            answerability = float(_abstained(answer) != row["should_answer"])

            per_row.append({
                "query": query,
                "should_answer": row["should_answer"],
                "retrieval": retrieval_score,
                "groundedness": groundedness_score,
                "relevance": relevance_score,
                "answerability": answerability,
            })
    finally:
        credential.close()

    ret_mean = mean(row["retrieval"] for row in per_row if row["retrieval"] is not None)
    gnd_mean = mean(row["groundedness"] for row in per_row)
    rel_mean = mean(row["relevance"] for row in per_row)
    answerability_mean = mean(row["answerability"] for row in per_row)

    print("\n--- Part A eval results ---")
    for row in per_row:
        marker = "A" if row["should_answer"] else "R"
        retrieval_text = "n/a" if row["retrieval"] is None else f"{row['retrieval']:.1f}"
        print(
            f"  {marker} Ret={retrieval_text}  Gnd={row['groundedness']:.1f}  "
            f"Rel={row['relevance']:.1f}  A={row['answerability']:.0f}  {row['query']}"
        )
    print(f"\n  Retrieval mean (answerable): {ret_mean:.2f}  (target >= {RETRIEVAL_THRESHOLD})")
    print(f"  Groundedness mean (all):     {gnd_mean:.2f}  (target >= {GROUNDEDNESS_THRESHOLD})")
    print(f"  Relevance mean (all):        {rel_mean:.2f}  (target >= {RELEVANCE_THRESHOLD})")
    print(
        f"  Answerability mean (all):    {answerability_mean:.2f}  "
        f"(target >= {ANSWERABILITY_THRESHOLD})"
    )

    summary = {
        "retrieval_mean_answerable": ret_mean,
        "groundedness_mean_all": gnd_mean,
        "relevance_mean_all": rel_mean,
        "answerability_mean_all": answerability_mean,
        "retrieval_target": RETRIEVAL_THRESHOLD,
        "groundedness_target": GROUNDEDNESS_THRESHOLD,
        "relevance_target": RELEVANCE_THRESHOLD,
        "answerability_target": ANSWERABILITY_THRESHOLD,
        "judge_model": EVALUATION_MODEL,
        "pass": (
            ret_mean >= RETRIEVAL_THRESHOLD
            and gnd_mean >= GROUNDEDNESS_THRESHOLD
            and rel_mean >= RELEVANCE_THRESHOLD
            and answerability_mean == ANSWERABILITY_THRESHOLD
        ),
        "per_row": per_row,
    }
    BASELINE_OUT.write_text(json.dumps(summary, indent=2))
    print(f"\nBaseline written to {BASELINE_OUT}")
    if not summary["pass"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
