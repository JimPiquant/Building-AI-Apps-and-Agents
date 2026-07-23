# Day 1 lab — C#

## Coverage in Cohort 1
- **Part C — Your own code, calling the Responses API:** implemented here in [`PartC_ResponsesApi/`](PartC_ResponsesApi/).
- **Part A — Prompt agent:** Python-only in Cohort 1.
- **Part B — Hosted agent:** Python-only in Cohort 1.

The MAF .NET surface for `AIProjectClient.AsAIAgent(...)` is stable and idiomatic — that's what Part C uses. The .NET SDK also supports connecting to Prompt agents and Hosted agents through `Microsoft.Agents.AI.Foundry`; the Cohort 1 walkthrough uses Python for those. Reference C# samples for Parts A and B live in the `microsoft/agent-framework` repo:

- Basics — https://github.com/microsoft/agent-framework/tree/main/dotnet/samples/02-agents/AgentProviders/foundry/Agent_Step01_Basics
- Full lifecycle — https://github.com/microsoft/agent-framework/tree/main/dotnet/samples/02-agents/AgentProviders/foundry/Agent_Step00_FoundryAgentLifecycle

If you want to work Parts A and B in C#, adapt from those samples. Contributions back to this repo via PR are welcome.

## Setup

```bash
cd labs/day1/csharp/PartC_ResponsesApi
dotnet restore
dotnet run
```

Make sure `../../.env` is populated. This project reads `FOUNDRY_PROJECT_ENDPOINT` and `FOUNDRY_MODEL` from the process environment; on shells that don't auto-load `.env`, export them manually or use a helper:

```bash
set -a; source ../../.env; set +a
dotnet run
```
