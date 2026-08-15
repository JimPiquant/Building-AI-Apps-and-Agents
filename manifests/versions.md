# Pinned versions — 2026 baseline

This manifest fixes the runtime and SDK versions used across every day and lab in the current release. Manifest will be refreshed post-Ignite 2026.

## Runtimes
| Runtime | Version |
|---------|---------|
| Python | 3.11 or 3.12 |
| .NET SDK | 10.0 (LTS) |
| Node.js (for MCP tooling only) | 20 LTS |

## Python packages
Managed with [**uv**](https://docs.astral.sh/uv/). Each day's lab has a `pyproject.toml`; pinned versions live in the committed `uv.lock`.

```bash
cd labs/dayN/python
uv sync
uv run python <script>.py
```

Core dependencies (see each day's `requirements.txt` for the full pinned set):
- `agent-framework` (core)
- `agent-framework-foundry`
- `agent-framework-foundry-hosting` (Day 3+ hosted-agent scenarios)
- `agent-framework-azure-ai-search` (Day 2+)
- `agent-framework-hosting-mcp` (Day 3+)
- `azure-identity`
- `python-dotenv`

## .NET packages
Each lab's `.csproj` pins the versions. Core references:
- `Microsoft.Agents.AI`
- `Microsoft.Agents.AI.Foundry`
- `Azure.AI.Projects`
- `Azure.Identity`

## Foundry
- Foundry project in a region that supports the target model deployment.
- At least one model deployment (default: `gpt-5.6-luna` or `gpt-4o` — verify at kickoff).

## Notes
- Preview packages are called out in each lab's README as we introduce them.
- **Rule:** if the version manifest and a lab disagree, the lab is out of date — file an issue.
