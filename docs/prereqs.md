# Prerequisites — self-check

If you can answer **yes** to every item below, you're ready for Day 1. If you can't, use the linked Microsoft Learn modules to close the gap **before the workshop starts**.

## You should already be comfortable with

### Azure fundamentals
- Signing into Azure from the CLI (`az login`) and switching subscriptions.
- Creating resource groups and knowing which region a resource lives in.
- **Azure AI Search** — creating an index and running a basic query (concepts, not deep tuning).
- **Managed Identity** — the difference between system-assigned and user-assigned; assigning a role to an identity.
- **RBAC** — assigning a role at the resource-group level; `Reader`, `Contributor`, `Cognitive Services User`, etc.
- **Azure Container Apps** or **App Service** — deploying a small containerized web app. Familiarity with one is enough.
- Reading a **Bicep** or **ARM** template well enough to know what it deploys (authoring not required).

### Development environment
- Comfortable in a terminal on your OS of choice.
- **Azure CLI (`az`)** — This workshop targets IaC-first teams; workshop labs create resources from the command line, not the portal. Install if you don't have it.
- **Azure Developer CLI (`azd`)** — used from Day 3 forward for deploy scenarios. Install ahead of Day 1.
- **Python** — Python 3.11+, `uv` (recommended) or `pip` + venv.
- **C# / .NET** — .NET 10 SDK, `dotnet` CLI, basic project structure. Optional if you're only doing Python labs.
- **VS Code** with the Python and C# extensions installed.
- **Git** — clone, branch, commit, push.
- Ability to install packages from `pypi.org` and `nuget.org` (no restrictive corporate proxy blocks).

### AI / LLM basics
- You've used a chatbot (ChatGPT, Copilot Chat, or similar) enough to know what a system prompt vs. user prompt is.
- Loose familiarity with the words *token*, *embedding*, *RAG*, *tool call*. Deep understanding not required — that's what the workshop is for.

## Not required
- Prior Foundry experience
- Prior MAF experience
- Copilot Studio, Semantic Kernel, or AutoGen experience — those are out of scope
- Deep prompt engineering background

## If you need to close a gap
Recommended Microsoft Learn paths (short):
- **AZ-900 refresher** — https://learn.microsoft.com/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/
- **Manage identities and governance in Azure** — https://learn.microsoft.com/training/paths/manage-identities-governance-azure/
- **Introduction to Azure Container Apps** — https://learn.microsoft.com/training/modules/introduction-azure-container-apps/
- **Introduction to Azure AI Search** — https://learn.microsoft.com/training/modules/intro-to-azure-search/

If you're unsure whether you're ready, reach out to your workshop coordinator before Day 1.
