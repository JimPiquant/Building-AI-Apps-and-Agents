# Day 4 Demo — Module 6 — Option A: a plain AgentLoopMiddleware(predicate,
# max_iterations=N), no judge model.
#
# Adapted from the official microsoft/agent-framework SDK sample
# python/samples/02-agents/middleware/agent_loop_middleware_refinement.py —
# same agent, same should_continue/record_feedback/fresh_context mechanics,
# same streamed user/assistant printing. The adaptation: run the SAME agent
# instructions through TWO should_continue predicates back to back (BOUNDED
# vs RUNAWAY) instead of one, so the safety cap's payoff is observable
# live instead of asserted verbally, and report which one stopped the loop.
#
# Copyright (c) Microsoft. All rights reserved.

from __future__ import annotations

import asyncio
import os

from agent_framework import Agent, AgentLoopMiddleware, AgentResponse
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential
from dotenv import load_dotenv

load_dotenv()

PROMPT = "Suggest a name for a note-taking app."

# The agent's own instructions never change between cases — it is always told to emit
# this exact marker once it is confident its answer is final.
COMPLETE_MARKER = "<promise>COMPLETE</promise>"

INSTRUCTIONS = (
    "You are iteratively refining a product name for a note-taking app. Each turn, build "
    "on the progress log: propose an improved candidate with a short reason. When you are "
    f"confident the name is final, end your message with the exact marker {COMPLETE_MARKER}."
)

# BOUNDED's should_continue checks the marker the agent was actually told to emit — the
# loop is expected to stop on its own, well under the cap.
#
# RUNAWAY's should_continue checks a plausible one-word typo of it (COMPLETED vs
# COMPLETE) that can never appear verbatim in the agent's text. This is a real bug
# shape — the developer wrote the predicate against a slightly different string than
# the one in the agent's instructions — and it means should_continue can never return
# False on its own. max_iterations is the ONLY thing that stops this case. That is
# this module's slide, reproduced as code: "Always bound autonomous loops. A completion
# condition can fail, a model can stall, and an evaluator can be probabilistic."
CASES = {
    "BOUNDED": {"marker_to_check": COMPLETE_MARKER, "max_iterations": 5},
    "RUNAWAY": {"marker_to_check": "<promise>COMPLETED</promise>", "max_iterations": 3},
}


def build_client() -> FoundryChatClient:
    return FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
        credential=AzureCliCredential(),
    )


async def run_case(label: str, marker_to_check: str, max_iterations: int) -> None:
    client = build_client()

    def should_continue(*, last_result: AgentResponse, **kwargs: object) -> bool:
        return marker_to_check not in last_result.text

    def record_feedback(*, iteration: int, last_result: AgentResponse, **kwargs: object) -> str:
        return f"iteration {iteration}: {last_result.text.strip()[:80]}"

    # This is the whole of Option A: one predicate, one iteration cap, no judge client,
    # no second model call to decide whether to keep going.
    loop = AgentLoopMiddleware(
        should_continue,
        max_iterations=max_iterations,
        record_feedback=record_feedback,
        fresh_context=True,
    )

    agent = Agent(client=client, name="refiner", instructions=INSTRUCTIONS, middleware=[loop])

    print(f"\n===== {label} (max_iterations={max_iterations}) =====")

    # Same iteration-counting technique as the official sample: streaming surfaces the
    # loop's injected "user" nudge messages between iterations, so a new contiguous user
    # block marks the boundary into the next agent run. Track the last iteration's
    # assistant text too, so we can report which case actually stopped the loop.
    iterations = 1
    in_user_block = False
    assistant_open = False
    last_iteration_text = ""
    async for update in agent.run(PROMPT, stream=True):
        if update.role == "user":
            if not in_user_block:
                iterations += 1
                last_iteration_text = ""
                in_user_block = True
            assistant_open = False
            print(f"  user: {update.text}", flush=True)
            continue
        in_user_block = False
        if update.text:
            if not assistant_open:
                print("  assistant: ", end="", flush=True)
                assistant_open = True
            print(update.text, end="", flush=True)
            last_iteration_text += update.text

    stopped_naturally = marker_to_check in last_iteration_text
    print(f"\n\n  Ran {iterations} iteration(s) against a max_iterations={max_iterations} cap.")
    if stopped_naturally:
        print("  STOPPED: should_continue found its marker — the agent signaled it was done.")
    else:
        print(
            "  STOPPED: the max_iterations safety cap — should_continue never found its "
            "marker and, left unbounded, this loop would never have stopped on its own."
        )


async def main() -> None:
    print("=" * 70)
    print("BOUNDED — should_continue checks the marker the agent actually emits")
    print("=" * 70)
    await run_case("BOUNDED", **CASES["BOUNDED"])

    print("\n" + "=" * 70)
    print("RUNAWAY — should_continue has a one-word typo in the marker it checks")
    print("=" * 70)
    await run_case("RUNAWAY", **CASES["RUNAWAY"])

    print(
        "\nSame agent, same instructions, same tiny marker-based predicate shape. The "
        "only difference between BOUNDED and RUNAWAY is a one-word typo in the string "
        "should_continue checks for — and that's exactly the kind of bug max_iterations "
        "exists to survive."
    )


if __name__ == "__main__":
    asyncio.run(main())
