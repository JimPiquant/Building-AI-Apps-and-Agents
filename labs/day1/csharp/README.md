# Day 1 lab — C#

## Coverage in Cohort 1
- **Part A — Client-side agent:** implemented here in [`PartA_ClientSideAgent/`](PartA_ClientSideAgent/).
- **Part B — Foundry PromptAgent:** Python-only in Cohort 1. See notes below.
- **Part C — Foundry HostedAgent:** Python-only in Cohort 1. See notes below.

**Rationale:** MAF's .NET surface for the client-side agent path (`AIProjectClient.AsAIAgent(...)`) is stable and idiomatic — that's what Part A uses. The .NET SDK also supports Foundry-hosted agents (see the reference samples below), but the walkthrough content for Cohort 1 covers Parts B and C in Python only. This is scheduled to be revisited for Cohort 2.

If you want to work through Parts B and C in C# anyway, the reference samples live in the `microsoft/agent-framework` repo:

- Basics — https://github.com/microsoft/agent-framework/tree/main/dotnet/samples/02-agents/AgentProviders/foundry/Agent_Step01_Basics
- Full lifecycle — https://github.com/microsoft/agent-framework/tree/main/dotnet/samples/02-agents/AgentProviders/foundry/Agent_Step00_FoundryAgentLifecycle

They map onto our Parts B and C. If you go that route, please contribute what you built back — a PR against this repo is welcome.

## Setup

```bash
cd labs/day1/csharp/PartA_ClientSideAgent
dotnet restore
dotnet run
```

Make sure `.env` in `labs/day1/` is populated. This project reads `FOUNDRY_PROJECT_ENDPOINT` and `FOUNDRY_MODEL` from the process environment; on shells that don't auto-load `.env`, export them manually or use a helper:

```bash
set -a; source ../../.env; set +a
dotnet run
```
