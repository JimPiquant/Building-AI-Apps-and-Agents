# Copyright (c) Microsoft. All rights reserved.
#
# Minimal, clearly-noted adaptation of the official `concurrent_agents.py`
# sample (python/samples/03-workflows/orchestrations/concurrent_agents.py —
# the same sample this workshop's Module 2 "Concurrent in code" slide
# quotes from) — same three domain agents, same eBike prompt.
#
# Two adaptations, both flagged:
#   1. Instructions ask for a SHORT (2-3 sentence) answer instead of the
#      official sample's long-form output — kept for a time-boxed live
#      demo, not because short answers are somehow more "correct."
#   2. A tiny AgentMiddleware records each agent's own start/end wall-clock
#      offset, and the script also runs the same three agents SEQUENTIALLY
#      afterward for a side-by-side timing comparison — neither addition
#      exists in the official sample, which doesn't need to prove
#      parallelism live.

import asyncio
import os
import time
from collections.abc import Awaitable, Callable

from agent_framework import Agent, AgentContext, AgentMiddleware, AgentResponse
from agent_framework.foundry import FoundryChatClient
from agent_framework.orchestrations import ConcurrentBuilder
from azure.identity import AzureCliCredential
from dotenv import load_dotenv

load_dotenv()

PROMPT = "We are launching a new budget-friendly electric bike for urban commuters."

INSTRUCTIONS = {
    "researcher": (
        "You're an expert market and product researcher. In 2-3 sentences, "
        "give one concise, factual insight about the prompt."
    ),
    "marketer": (
        "You're a creative marketing strategist. In 2-3 sentences, craft one "
        "compelling value proposition for the prompt."
    ),
    "legal": (
        "You're a cautious legal/compliance reviewer. In 2-3 sentences, "
        "highlight one constraint or disclaimer relevant to the prompt."
    ),
}


class TimingMiddleware(AgentMiddleware):
    """Records each agent's own start/end offset relative to a shared clock.

    Not part of the official sample — this is the one thing a live demo
    needs that a docs page doesn't: proof, not just a claim, that three
    agents actually overlapped in wall-clock time.
    """

    def __init__(self, clock_start: float, log: list[tuple[str, float, float]]) -> None:
        self._clock_start = clock_start
        self._log = log

    async def process(self, context: AgentContext, call_next: Callable[[], Awaitable[None]]) -> None:
        name = context.agent.name or "agent"
        start = time.monotonic() - self._clock_start
        print(f"  [{name}] START  @ t={start:5.2f}s")
        await call_next()
        end = time.monotonic() - self._clock_start
        print(f"  [{name}] FINISH @ t={end:5.2f}s")
        self._log.append((name, start, end))


def print_timeline(log: list[tuple[str, float, float]], width: int = 50) -> None:
    """Render a crude ASCII Gantt bar so overlap is visible, not just implied by the numbers."""
    if not log:
        return
    total = max(end for _, _, end in log) or 1.0
    print()
    for name, start, end in log:
        left = int((start / total) * width)
        bar_len = max(1, int(((end - start) / total) * width))
        print(f"  {name:<11} {' ' * left}{'#' * bar_len}")
    print()


async def run_concurrent(client: FoundryChatClient) -> list[tuple[str, float, float]]:
    log: list[tuple[str, float, float]] = []
    clock_start = time.monotonic()

    agents = [
        Agent(client=client, instructions=INSTRUCTIONS[name], name=name, middleware=[TimingMiddleware(clock_start, log)])
        for name in ("researcher", "marketer", "legal")
    ]

    workflow = ConcurrentBuilder(participants=agents).build()

    wall_start = time.monotonic()
    events = await workflow.run(PROMPT)
    wall_elapsed = time.monotonic() - wall_start

    outputs = events.get_outputs()
    print("\n===== Concurrent — aggregated responses =====")
    for output in outputs:
        if not isinstance(output, AgentResponse):
            continue
        for msg in output.messages:
            print(f"{'-' * 60}\n[{msg.author_name or 'agent'}]\n{msg.text}")

    print(f"\nConcurrent total wall-clock time: {wall_elapsed:.2f}s")
    print_timeline(log)
    return log


async def run_sequential(client: FoundryChatClient) -> float:
    """The same three agents, same prompt, run one at a time. No ConcurrentBuilder."""
    wall_start = time.monotonic()
    for name in ("researcher", "marketer", "legal"):
        agent = Agent(client=client, instructions=INSTRUCTIONS[name], name=name)
        t0 = time.monotonic() - wall_start
        await agent.run(PROMPT)
        t1 = time.monotonic() - wall_start
        print(f"  [{name}] ran from t={t0:5.2f}s to t={t1:5.2f}s")
    wall_elapsed = time.monotonic() - wall_start
    print(f"\nSequential total wall-clock time: {wall_elapsed:.2f}s")
    return wall_elapsed


async def main() -> None:
    client = FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ["FOUNDRY_MODEL"],
        credential=AzureCliCredential(),
    )

    print("=" * 70)
    print("PART 1 — ConcurrentBuilder: all three agents, same prompt")
    print("=" * 70)
    await run_concurrent(client)

    print("\n" + "=" * 70)
    print("PART 2 — the same three agents, run one at a time (no ConcurrentBuilder)")
    print("=" * 70)
    await run_sequential(client)

    print(
        "\nCompare the two 'total wall-clock time' lines above. If Concurrent's "
        "total is close to ONE agent's own response time, and Sequential's total "
        "is close to the SUM of all three — that's the proof: ConcurrentBuilder "
        "didn't just run the agents one after another and print them together, "
        "it actually ran them at the same time."
    )


if __name__ == "__main__":
    asyncio.run(main())
