# Day 1 lab — Python

We use [**uv**](https://docs.astral.sh/uv/) as the Python package/project manager.

## One-time setup

Install uv if you don't have it:

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
irm https://astral.sh/uv/install.ps1 | iex
```

## Install deps

```bash
cd labs/day1/python
uv sync
```

This creates a `.venv` and installs everything pinned by `uv.lock`.

## Run

```bash
uv run python part_a_prompt_agent.py     # Part A — Prompt agent
uv run python part_b_responses_api.py    # Part B — your code, calling the Responses API
uv run python part_c_hosted_agent.py     # Part C — Hosted agent
```

Make sure `../.env` is filled in first — see [`../README.md`](../README.md).
