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
uv run python part_a_client_side_agent.py
uv run python part_b_foundry_prompt_agent.py   # requires Part B portal setup
uv run python part_c_foundry_hosted_agent.py   # bonus; requires Part C portal setup
```

Make sure `../.env` is filled in first — see [`../README.md`](../README.md).
