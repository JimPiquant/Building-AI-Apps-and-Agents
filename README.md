# Building AI Apps and Agents

A 5-day, hands-on workshop for professional developers and solution architects building AI applications on Azure with **Microsoft Foundry** and the **Microsoft Agent Framework (MAF)**.

## Audience
Professional developers, senior engineers, and solution architects with working knowledge of Azure. See [`docs/prereqs.md`](docs/prereqs.md) for the self-check.

## Format
- 5 days total, split **2 + 2 + 1**, with time between blocks to apply the material
- Each day: ~4 hours live + ~2 hours async lab
- Content and reference implementations are **Python-primary**; C# is provided where the MAF .NET surface is stable

## Weekly arc
| Day | Theme | What you build |
|-----|-------|----------------|
| 1 | Foundations: Foundry + MAF + Toolbox + Foundry IQ | A Prompt agent, your own code calling the Responses API, and a Hosted agent — the three ways to run an agent with Foundry |
| 2 | Grounding & Tools | A grounded, tool-using docs assistant with a Foundry IQ knowledge source |
| 3 | MAF Single Agent Deep Dive + MCP | The same agent, production-shaped, using the official Azure DevOps MCP server against real ADO work items |
| 4 | Multi-Agent Patterns + Evaluation | A planner + retriever + summarizer + critic workflow with a trajectory eval |
| 5 | Production + Capstone Kickoff | Observability, identity, RAI, cost, deployment; capstone scoping |

A **post-workshop capstone project** (solo or teams of 2–3, ~4–6 weeks) closes the program with a 1:1 architecture review.

## Repository layout
```
docs/          Prerequisites, curriculum overview, terminology
manifests/     Pinned SDK / runtime versions for each cohort
slides/        Markdown slides, one folder per day
labs/          Lab instructions and starter templates (labs/dayN/{python,csharp})
```

## Sources of truth
Content in this repo aligns with:
- **Azure AI Foundry docs:** https://learn.microsoft.com/en-us/azure/foundry/
- **Foundry samples:** https://github.com/microsoft-foundry/foundry-samples
- **MAF docs:** https://learn.microsoft.com/en-us/agent-framework/
- **MAF SDK samples (Python + C#):** https://github.com/microsoft/agent-framework

When docs and code disagree, we run the code, follow the working sample, and file an upstream issue if warranted.

## Out of scope
This workshop does **not** cover Copilot Studio, Semantic Kernel, or AutoGen. See the curriculum overview for the full out-of-scope list and the rationale.

## Status
This is workshop material under active development for Publix Cohort 1 (Aug–Oct 2026). Content will be refreshed for Cohort 2 (Jan–Mar 2027) post-Ignite 2026.

## License
Materials in this repository are provided for educational use by workshop attendees. See `LICENSE` when published.
