# Building AI Apps and Agents

A 5-day, hands-on workshop for professional developers and solution architects building AI applications on Azure with **Microsoft Foundry** and the **Microsoft Agent Framework (MAF)**.

## Audience
Professional developers, senior engineers, and solution architects with working knowledge of Azure. See [`docs/prereqs.md`](docs/prereqs.md) for the self-check and [`docs/pre-workshop-prep.md`](docs/pre-workshop-prep.md) for the full pre-workshop preparation guide (environment setup + pre-reading for Days 1 and 2).

## Format
- 5 days total, split **2 + 2 + 1**, with time between blocks to apply the material
- Each day: ~4 hours live + ~2 hours lab
- Content and reference implementations are **Python-primary**; C# is provided where the MAF .NET surface is stable

## Weekly arc
| Day | Theme | What you build |
|-----|-------|----------------|
| 1 | Foundations: Foundry + MAF + Toolbox + Foundry IQ | A Prompt agent, your own code calling the Responses API, and a Hosted agent — the three ways to run an agent with Foundry |
| 2 | Grounding & Tools | A grounded, tool-using docs assistant with a Foundry IQ knowledge source |
| 3 | MAF Single Agent Deep Dive + MCP | The same agent, production-shaped, using the official Azure DevOps MCP server against real ADO work items |
| 4 | Multi-Agent Patterns + Evaluation | A planner + retriever + critic workflow (with optional ticket-agent stretch) with a trajectory eval |
| 5 | Production + Capstone Kickoff | Observability, identity, RAI, cost, deployment; capstone scoping |

A **post-workshop capstone project** (solo or teams of 2–3, ~4–6 weeks) closes the program with a 1:1 architecture review.

## Repository layout
```
docs/          Prerequisites, curriculum overview, terminology
manifests/     Pinned SDK / runtime versions for each workshop delivery
slides/        Markdown slides, one folder per day
labs/          Lab instructions and starter templates (labs/dayN/{python,csharp})
```

### A note about the uv utility
The workshop uses uv, the modern replacement for environment and package management for python applications.  uv replaces other tools like pip, poetry and conda. https://docs.astral.sh/uv/ 

Installing https://docs.astral.sh/uv/#installation

uv can manage your local python installations https://docs.astral.sh/uv/guides/install-python/ — for example:

```bash
uv python install 3.14     # install the latest 3.14
uv python list             # see what's installed and available
uv python upgrade 3.14     # upgrade to the current 3.14 patch release
```

A `pyproject.toml` with `requires-python = ">=3.11"` will pick up whatever matching interpreter uv has, so you don't need to install Python separately if you're using uv.

uv sync https://docs.astral.sh/uv/reference/cli/#uv-sync Syncing ensures that all project dependencies (defined in pyproject.toml) are installed and up-to-date with the lockfile (uv.lock). If a virtual environment does not exist it will create one.  If the lockfile does not exist it will create it.  Re-running uv sync will correct any drift from the lockfile.

uv run https://docs.astral.sh/uv/reference/cli/#uv-run Ensures that the command runs in a Python environment. When used with a file ending in .py the file will be treated as a script and run with a Python interpreter, i.e., uv run file.py is equivalent to uv run python file.py.

## Sources of truth
Content in this repo aligns with:
- **Azure AI Foundry docs:** https://learn.microsoft.com/en-us/azure/foundry/
- **Foundry samples:** https://github.com/microsoft-foundry/foundry-samples
- **MAF docs:** https://learn.microsoft.com/en-us/agent-framework/
- **MAF SDK samples (Python + C#):** https://github.com/microsoft/agent-framework

## Out of scope
This workshop does **not** cover Copilot Studio, Semantic Kernel, or AutoGen. See the curriculum overview for the full out-of-scope list and the rationale.

## Status
This is workshop material under active development. Content will be refreshed periodically as the underlying SDKs evolve.

## License
Materials in this repository are provided for educational use by workshop attendees. See `LICENSE` when published.
