"""
Day 4 Lab — printing the workflow event stream.

PROVIDED COMPLETE. This is how you SEE a workflow run, and in Parts A and B
it is the primary deliverable: not a score, but a trace you can read.

There is one generic `WorkflowEvent` class in Python, discriminated by the
`event.type` string. There are no per-type event classes -- you branch on
`event.type` and read the accessors that type carries:

    output / intermediate ......... .executor_id, .data
    executor_invoked / _completed . .executor_id, .data
    executor_failed ............... .executor_id, .details
    superstep_started / _completed  .iteration
    request_info .................. .request_id, .source_executor_id
    status ........................ .state
    failed ........................ .details

Verified against the SDK's own observability sample,
`python/samples/03-workflows/observability/executor_io_observation.py`.
"""

from __future__ import annotations

import textwrap
from typing import Any

# Internal plumbing nodes the orchestration builders insert. They are real and
# they will appear in the stream; hiding them by default keeps Part A's trace
# readable, but pass show_internal=True when you want the whole truth.
_INTERNAL_PREFIXES = ("input-conversation", "to-conversation:", "complete")


def _is_internal(executor_id: str | None) -> bool:
    return bool(executor_id) and any(
        executor_id.startswith(p) for p in _INTERNAL_PREFIXES
    )


def _text(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, str):
        return value
    text = getattr(value, "text", None)
    if text is None:
        agent_response = getattr(value, "agent_response", None)
        text = getattr(agent_response, "text", None) if agent_response else None
    if text is None:
        return None
    return str(text)


def _short(value: Any, width: int = 100) -> str:
    text = _text(value)
    if text is None:
        text = str(value) if value is not None else ""
    text = " ".join(str(text).split())
    return text if len(text) <= width else text[: width - 1] + "\u2026"


def _print_output(executor_id: str | None, value: Any) -> None:
    text = " ".join((_text(value) or str(value)).split())
    if not text:
        return
    print(f"\n  == workflow output from {executor_id} ==")
    print(textwrap.fill(text, width=100, initial_indent="     ", subsequent_indent="     "))


def print_event(event: Any, *, show_internal: bool = False, verbose: bool = False) -> None:
    """Print one workflow event as a single readable line."""
    etype = event.type
    executor_id = getattr(event, "executor_id", None)

    if not show_internal and _is_internal(executor_id):
        return

    if etype == "superstep_started":
        print(f"\n  superstep {getattr(event, 'iteration', '?')} ---------------------")

    elif etype == "executor_invoked":
        print(f"    -> {executor_id}")
        if verbose:
            print(f"         in : {_short(event.data)}")

    elif etype == "executor_completed":
        if verbose:
            print(f"         out: {_short(event.data)}")

    elif etype == "executor_failed":
        print(f"    !! {executor_id} FAILED: {getattr(event, 'details', '')}")

    elif etype == "output":
        _print_output(executor_id, event.data)

    elif etype == "failed":
        print(f"\n  !! workflow FAILED: {getattr(event, 'details', '')}")


async def run_and_trace(
    workflow: Any,
    message: Any,
    *,
    show_internal: bool = False,
    verbose: bool = False,
) -> list[Any]:
    """Run a workflow in streaming mode, printing the trace. Returns outputs.

    `workflow.run(msg, stream=True)` is async-iterable and is NOT awaited.
    (The non-streaming form, `await workflow.run(msg)`, returns a
    WorkflowRunResult instead. There is no `run_stream` method.)
    """
    outputs: list[Any] = []
    output_executor: str | None = None
    output_chunks: list[str] = []
    output_values: list[Any] = []

    def flush_output() -> None:
        nonlocal output_executor, output_chunks, output_values
        if output_chunks:
            _print_output(output_executor, "".join(output_chunks))
            outputs.extend(output_values)
            output_chunks = []
            output_values = []
            output_executor = None

    async for event in workflow.run(message, stream=True):
        if event.type == "output":
            executor_id = getattr(event, "executor_id", None)
            text = _text(event.data)
            if text is not None:
                if output_chunks and executor_id != output_executor:
                    flush_output()
                output_executor = executor_id
                output_chunks.append(text)
                output_values.append(event.data)
                continue

            flush_output()
            outputs.append(event.data)
        else:
            flush_output()

        print_event(event, show_internal=show_internal, verbose=verbose)
    flush_output()
    print()
    return outputs


def print_answer(answer: Any) -> None:
    """Pretty-print an Answer (or whatever the workflow produced)."""
    summary = getattr(answer, "summary", None)
    if summary is None:
        print(_short(answer, 600))
        return

    print("  ANSWER")
    print(f"    summary    : {summary}")
    for bullet in getattr(answer, "bullets", []) or []:
        print(f"      - {bullet}")
    citations = getattr(answer, "citations", []) or []
    print(f"    citations  : {', '.join(citations) if citations else '(none)'}")
    print(f"    confidence : {getattr(answer, 'confidence', '?')}")
