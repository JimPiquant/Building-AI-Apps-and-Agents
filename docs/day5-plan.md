# Day 5 plan - Production readiness + Capstone kickoff

**Status: Approved September 18, 2026 - concepts review completed September 17, 2026; amended September 20, 2026 to consolidate the capstone content into a customer-timed scoping session and move Foundry Toolkit immediately before it.** This is the approved delivery and authoring plan for the Day 5 artifact set.

**Post-approval delivery direction:** on September 18, the owner requested that the Markdown sources be retained but the PPTX files be delivered directly, without adding `scripts/build-decks/day5.js`. That direction supersedes the generator-specific row and wording below while retaining the source, notes, parity, and visual-review requirements.

| Item | Planning baseline |
| --- | --- |
| Delivery | Monday, September 21, 2026 |
| Audience | Solution architects comfortable with Azure; mixed Microsoft Foundry and Microsoft Agent Framework (MAF) experience |
| Starting point | Everyone has been exposed to Days 1-4; completion of **any** prior lab is not assumed |
| Format | 156-minute instructor-led technical block, followed by a customer-run capstone working session with customer-controlled timing; short optional checklist exercise afterward |
| Curriculum authority | Owner-supplied `Publix_Building_AI_Apps_and_Agents_Curriculum_v0.7.docx`, with the explicit decisions below superseding it |
| Review | Jim reviews this draft; Pradeep remains the curriculum approver identified in v0.7 |
| Technical authority | Official Microsoft Foundry, MAF, and Foundry Toolkit documentation; conceptual grounding reviewed September 17, 2026 |
| Authoring gate | Approve this plan before authoring slides, generating PowerPoint, or implementing demonstrations |

## Decisions already settled

- Keep observability, identity/security, Responsible AI, cost/latency/routing, production evaluation, and customer-run capstone scoping.
- Give **Foundry Toolkit for VS Code its own 21-minute Module 6**, immediately before the customer-run capstone session. Toolkit includes separate Agent Inspector and local Tracing Monitor demonstrations.
- Honor the struck-through deployment module in v0.7. **No deployment-target comparison, deployment walkthrough, deployment lab, or deployment deliverable for Day 5.** Earlier days' hosting instruction remains valid.
- Replace the standard two-hour lab with a **short optional guided checklist**, covering instrumentation/evaluation, identity/safety, and cost controls. No new student coding assignment.
- Capstones use teams of 2-3, with no solo path, and close with a shared demo day **2-3 weeks after September 21; exact date TBD**.
- Internal/proprietary data may be used without an additional workshop-specific restriction or approval gate. Existing organizational data-handling obligations still apply.
- All technical slide content must have supporting official documentation. Authored workshop decks keep links in source Markdown and slides/presenter notes; the owner-supplied Module 5 replacement is retained as a PPTX-only delivery artifact without modifying its slides.
- Day 5 requires conceptual exposure, not completed labs, a working personal agent, or attendee-owned Azure resources. Demonstrations use presenter-prepared examples; the optional exercise can use provided evidence.

## Learning arc and outcomes

Days 1-4 introduced the agent, its knowledge and tools, its runtime, and its orchestration/evaluation. Exposure does not imply implementation proficiency. Day 5 asks: **what evidence and controls would let an architect operate this system responsibly?**

Use the technical-documentation assistant and Planner/Retriever/Critic workflow as the shared reference where continuity helps. Module 1's tracing demo uses Microsoft's official WeatherAgent sample for a client-side trace, then runs the presenter-controlled `docs-assistant` Prompt agent for a Foundry-managed server-side trace. Neither path depends on a completed Day 4 lab. Say "the reference agent we examined," not "the agent you built." Provide completed examples and captured evidence so someone who completed none of the labs can participate without first running code.

Keep the shared vocabulary explicit in that recap: **Foundry resource/project** identifies the Azure service and development context; **MAF** is the application framework, not another name for the managed Foundry runtime; an **agent** combines model-driven behavior with instructions/tools; a **workflow** connects execution steps. Do not assume a local MAF object is a saved Foundry agent or that every workflow step is an agent. [F1], [F2], [F5], [F6]

Each module now includes **Concepts to establish**: plain-language definitions grounded in the documentation's Concepts sections, followed by a worked example/checkpoint. These explanations belong inside the existing teaching beats, not in additional lecture time. Official overviews or explanatory sections of how-to articles supplement concepts where needed; a procedure or UI screenshot alone is not an explanation.

| By the end, attendees can... | Evidence produced or interpreted |
| --- | --- |
| Follow a request through agent, model, tool, and workflow telemetry | Annotated trace: bottleneck, failed or skipped step, and relevant identifiers |
| Identify which identity needs permission at each boundary | Identity-to-resource access map, including a denied-access case |
| Choose layered safety controls and a deliberate failure response | A control/outcome table covering unsafe input, untrusted retrieved content, and unsupported answers |
| Reason about quality, latency, and cost together | A budget/routing decision tied to measured usage and task success |
| Distinguish offline regression from production monitoring | Sampling, evaluation, alert ownership, and regression-gate outline |
| Use Toolkit's main development surfaces without confusing them with production controls | Choose Agent Inspector, project resources, evaluation views, or Foundry/Application Insights for a specific task |
| Scope an achievable capstone | Team charter, architecture sketch, golden-set outline, milestones, and individual 30-day next steps |

## Delivery sequence

Offsets are cumulative content time for Modules 1-6, not promised clock-time
starts. Their demonstrations and discussions are **inside**, not additional
to, the listed budgets. Module 7 follows that technical block with timing
controlled by the customer.

| # | Module | Minutes | Content offset |
| --- | --- | ---: | --- |
| 1 | Observability and tracing | 30 | 00:00-00:30 |
| 2 | Identity and security | 30 | 00:30-01:00 |
| 3 | Responsible AI | 25 | 01:00-01:25 |
| 4 | Cost, latency, and model routing | 30 | 01:25-01:55 |
| 5 | AI evaluations for agentic systems | 20 | 01:55-02:15 |
| 6 | Foundry Toolkit for VS Code | 21 | 02:15-02:36 |
| 7 | Capstone scoping working session | Customer controlled | Follows Module 6 |
|  | **Instructor-led content (Modules 1-6)** | **156** |  |

**Approved pacing:** Modules 1-6 contain 156 minutes of scheduled instructor-led content. The customer owns the duration, breaks, and internal pacing of Module 7, so this plan assigns it no fixed minutes or cumulative offset.

The flow is intentional: understand telemetry, secure identity and data boundaries, apply safety controls, manage resource use, connect the evidence to ongoing evaluation, then finish the technical block by inspecting the relevant developer surfaces in Toolkit. The customer-run session applies those concepts to capstone scope and evidence.

## Module 1 - Observability and tracing

**Outcome:** explain where time and failures occur in a multi-agent request, how its telemetry reaches Foundry/Application Insights, and what must not be recorded.

### Concepts to establish

| Concept | Explanation to teach | Conceptual grounding |
| --- | --- | --- |
| Observability, monitoring, and evaluation | Observability helps explain system behavior. Monitoring tracks signals over time; evaluation judges outputs or actions against criteria. An error-free request can still produce a poor answer. | [E1], "Core observability capabilities" |
| Trace, span, and attribute | A trace follows one execution across operations. A span records one operation's timing and status; attributes add context such as the tool or model name. A printed event list is not automatically a distributed trace. | [O5], "Trace key concepts" |
| Semantic conventions and exporters | Conventions give telemetry fields shared meanings; instrumentation produces the signals; an exporter sends them to a backend. Using the same names does not, by itself, connect separate processes. | [O5], "OpenTelemetry in Foundry" and "Trace key concepts" |
| Workflow links and conversation history | A workflow can link causally related spans without nesting them. A conversation holds dialogue across turns; it is not one trace, and a response ID is not a trace ID. | [O2], "Links between Spans"; [F2], runtime component model |

**Example/checkpoint:** show a provided trace where retrieval consumes most of the elapsed time but no call fails. Ask which evidence explains the delay and which would establish answer quality. Expected answer: span timing identifies the slow operation; an appropriate evaluator or reviewed answer establishes quality. The trace exposes recorded operations, not a guaranteed view of the model's private reasoning.

### Teaching sequence

| Teaching beat | Minutes | Proposed content and grounding |
| --- | ---: | --- |
| From agent execution to operational evidence | 5 | Introduce the official WeatherAgent sample and distinguish logs, metrics, distributed traces, and evaluation. No attendee-generated trace is required. [O5], [O1], [E1] |
| Instrumentation and export | 5 | MAF instrumentation, exporters, project/Application Insights connection, and service/request correlation. Separate local application instrumentation from Foundry-managed server-side tracing. [O1], [O3], [O4] |
| Workflow and streaming boundaries | 4 | Follow executor/message spans and causal links; distinguish first response from completion. Do not promise one span per streamed token. [O2], [C1] |
| **Demo 1.1: Compare client-side and server-side traces** | 8 | Run or replay Microsoft's WeatherAgent sample and inspect its client-side automatic/custom spans. Then run the prepared `docs-assistant` Prompt agent in the Foundry playground and inspect its server-side trace in **Agents** > **Traces**. Keep identifiers and fallback captures separate. [O1], [O3], [O4], [O6] |
| Telemetry is another data store | 5 | Sensitive-content capture, access, retention, sampling, and ingestion cost. Prefer minimized metadata; use only synthetic demo content when payload capture is needed. [O1], [O3], [O4] |
| Architect checkpoint | 3 | Use the delay-versus-quality question above. Transition from the telemetry contract to identity and access boundaries. [O5], [O2], [E1] |

**Demo design:** prepare both authentic trace paths before class. The WeatherAgent path uses the official Agent Framework sample and its printed trace ID. The Prompt-agent path uses the existing presenter-controlled `docs-assistant`, a synthetic playground prompt, and the matching Foundry server-side trace. Prompt-agent ingestion can take a few minutes, so keep a labeled capture from the rehearsed run and never imply that it belongs to a different live response.

**Boundary:** no generic Azure Monitor administration course and no application hosting exercise. Label Foundry workflow/external-agent tracing as preview where the documentation does; do not label every tracing surface either preview or GA indiscriminately. GenAI semantic conventions are evolving; the concept overview's illustrative span names are not a guarantee of the exact Python MAF spans. Use the pinned framework's observability documentation for those names. [O5], [O2]

## Module 2 - Identity and security

**Outcome:** map developer, application/agent, and end-user identity to the actual permissions needed for model, tool, knowledge, and telemetry access.

### Concepts to establish

| Concept | Explanation to teach | Conceptual grounding |
| --- | --- | --- |
| Authentication versus authorization | Authentication establishes who is calling; authorization determines what that identity may do. Managing a resource through the control plane and using its capabilities through the data plane are separate permission surfaces. | [I6], "Control plane and data plane" |
| Identity at each connection | Distinguish the signed-in user, application caller, and agent/tool principal. The caller is whoever authenticates on that connection, not necessarily the person in the chat window. Acting on behalf of a user and acting with application permissions are different access models. | [I7], "Authentication capabilities"; [I2] for current identity behavior |
| Role versus scope | A role defines allowed actions; scope defines where those permissions apply. Least privilege narrows both. Invocation-only access does not require agent-authoring permissions; introduce Foundry Agent Consumer rather than defaulting callers to a developer role. | [I8], RBAC terminology and role definitions |
| Approval versus consent versus permission | Approval lets a proposed tool call proceed. OAuth consent grants the application's requested delegated access. The downstream service still authorizes the resulting request; approval is not a document-access grant. | [I7], "Authentication capabilities"; [I1], MCP authentication how-to |
| Session and document isolation | A session ID identifies state, not its owner. Access to a project or Search index does not establish permission to every conversation or document. Enforce ownership and document access where state is continued or evidence is retrieved. | [I8]; [I3], "Secure session continuation"; [I5], query-time document permissions |

**Example/checkpoint:** give everyone a prepared access map for the reference documentation assistant. Alice and Bob can both invoke it, but only Alice can read a restricted engineering document. Ask which identity and permission to inspect if OAuth consent and tool approval succeed but Bob's retrieval is denied. Expected answer: the principal actually presented downstream, its role and scope, and the user's document permissions where user-aware retrieval is configured. A shared workload identity alone does not enforce that distinction.

### Teaching sequence

| Teaching beat | Minutes | Proposed content and grounding |
| --- | ---: | --- |
| Identity at each hop | 5 | Define authentication/authorization and follow the prepared user/application/agent identity map. Distinguish delegated user access, application permissions, and current-versus-legacy agent identities. [I6], [I7], [I2] |
| Least-privilege permission matrix | 7 | Define roles and scopes. Separate Foundry author/consumer permissions, model access, Search access, and document permissions; include telemetry read access from Module 1. [I8], [I4], [I5], [O3] |
| MCP trust and credential hygiene | 5 | Tool approval is not OAuth consent or downstream authorization. Shared workload credentials do not preserve end-user context; explain the documented OAuth passthrough constraints. Never put personal credentials in shared project connections. [I1] |
| Session and retrieval isolation | 6 | Authenticate ownership of continued sessions; scope tenant/user/workspace state. For IQ and custom RAG, carry permissions into retrieval and chunks, and account for permission refresh. [I3], [I4], [I5] |
| **Demo 2.1: An approved action can still be denied** | 7 | Use the Alice/Bob checkpoint with prepared retrieval and session-ownership evidence. Identify the principal and enforcement point, not just the error message; no attendee permissions or lab output required. [I1], [I3], [I4], [I5] |

**Demo design:** use redacted, rehearsed evidence from a controlled presenter environment. No live role changes, OAuth consent walkthrough, or token display. If authentic captures are unavailable, use explicitly labeled expected outcomes and Microsoft's permission tables, not fabricated "observed" results.

**Identity transition:** the current migration documentation says newly created Foundry agents receive unique identities by default. "Shared project identity until published" describes legacy behavior, despite remaining wording in the agent identity Concepts page. Teach the current model and inspect the actual principal used for each connection; do not infer downstream permissions from the existence of a unique identity. [I2], [I7]

**Boundary:** do not promise automatic user isolation from a project managed identity or a session ID. Foundry IQ integration and native Search document-level controls have API/preview distinctions; the custom-RAG security-filter pattern is a separate approach. The MAF hosting reference is used only for its application-owned authentication/session-security guidance, not to reintroduce deployment.

## Module 3 - Responsible AI

**Outcome:** distinguish content filtering, injection defenses, grounding checks, and authorization, then choose a safe response when a control triggers.

### Concepts to establish

| Concept | Explanation to teach | Conceptual grounding |
| --- | --- | --- |
| Guardrail versus instruction | A configured control specifies the risk to inspect, an intervention point, and an action. Asking the model to behave safely is not the same as enforcing a control. Model input/output and supported agent tool boundaries need distinct coverage. | [S1], official overview, "Guardrails for agents vs models"; [S2] |
| Direct versus indirect injection | Direct injection arrives in a user's prompt; indirect injection arrives inside retrieved documents or tool output. Material that is relevant evidence is not automatically a trusted instruction. | [S3], "Types of input attacks" |
| Detection versus enforcement | A detection reports what a classifier found; filtering reports whether that filter blocked it. An annotation can report an attack without filtering it. Do not interpret detection alone as a prevented incident. | [S3], opening explanation and example response |
| Grounding versus groundedness | Retrieval supplies evidence; groundedness evaluation measures whether an answer is supported by that evidence. It does not prove the source is true, current, authorized, or safe. Serving-time checks and offline evaluations have different roles. | [S4], "System evaluation"; [S1]; [F8] |
| Safety measurement versus access control | Content-risk and agent-safety evaluators assess selected response/action risks. A harmless-sounding answer can still accompany unauthorized tool use. Evaluation measures behavior; it does not grant or deny downstream permissions. | [S6], evaluator table and configuration; [I6] |
| Red teaming versus assurance | Red teaming tests adversarial scenarios. Attack Success Rate describes the tested attacks judged successful, not every possible attack. Coverage, synthetic scenarios, and variable judgments limit what a result proves. | [S5], metric explanation and "Known limitations" |

**Example/checkpoint:** use a fictional retrieved handbook containing unrelated instructions to change the answer into a slogan. Show prepared model-level annotations and ask whether `detected=true, filtered=false` means this filter blocked the content. Expected answer: no; it detected the risk but did not filter it. Compare a blocked case, then distinguish the application's chosen fallback from the filter result. Passing that check or an offline safety evaluation is not proof that the whole agent is safe.

### Teaching sequence

| Teaching beat | Minutes | Proposed content and grounding |
| --- | ---: | --- |
| Control ownership and intervention points | 4 | Define a configured control versus an instruction. Separate model filters, agent guardrails, and application controls at supported request/response/tool boundaries. [S1], [S2] |
| Direct and indirect prompt injection | 4 | User-input attacks versus instructions in retrieved documents/tool output. Explain detection versus filtering; do not claim Prompt Shields eliminates injection. [S3] |
| Runtime groundedness versus evaluation | 4 | Distinguish supplying evidence, checking groundedness, and evaluating safety risks. Neither a supported answer nor a low risk score establishes authorization or universal truth. [S1], [S4], [S6] |
| Define the safe response contract | 3 | Workshop design choices: block a disallowed action, acknowledge insufficient evidence, or route to an application-owned human-review path. Do not imply Foundry automatically implements escalation. [I4], [S1], [S5] |
| **Demo 3.1: Detection, filtering, and evidence** | 6 | Use the detected-versus-filtered checkpoint with prepared model annotations and a separate groundedness evaluation. Choose the application's response; no attendee agent or evaluation results required. [S1], [S3], [S4] |
| Red teaming and residual risk | 4 | Define Attack Success Rate and its tested population. Explain supported targets/tools and why a scan is not exhaustive assurance or certification; hand the test cases to Module 5. [S5] |

**Demo design:** use synthetic content and prepared model-level annotations or Microsoft's published examples. Keep an offline evaluator result visibly separate from a serving-time filter. No adversarial scan or attack against customer systems is part of the live demonstration.

**Critical scope notes:** Foundry agent guardrails are preview and do not automatically protect every external MAF application. Tool-call/response intervention requires supported tools; generic MCP is not listed as universally covered. Current documentation lists runtime groundedness and Spotlighting as model controls, not agent controls, and agent guardrails do not support annotate-only actions. That runtime restriction does not prevent groundedness evaluation of agent responses. Spotlighting has additional preview/API constraints. These distinctions belong in the teaching material, not just a footnote. [S1], [S2], [S3], [S4]

**Boundary:** no safety guarantee, invented approval API, or assertion that the Day 4 workflow is fully protected merely because its model has a content filter. The Foundry red-teaming service also has target/runtime restrictions; do not promise a supported scan of that arbitrary workflow.

## Module 4 - Cost, latency, and model routing

**Outcome:** make a defensible quality/cost/latency trade-off and identify where a workload must stop, defer, or escalate.

### Concepts to establish

| Concept | Explanation to teach | Conceptual grounding |
| --- | --- | --- |
| Latency versus throughput | Latency is elapsed time for one request; throughput is work completed per unit time. First-token latency measures responsiveness, not completion. A whole workflow also includes retrieval, tools, and repeated model calls. | [C1], "Understanding throughput vs latency"; [O2]; [F8], "Cost and latency considerations" |
| Usage, cost, and budget | Tokens measure model usage, not currency. Cost depends on model/rates, input/output/cache usage, and other services. A revision limit bounds iterations, not all token usage, elapsed time, or subscription spend. | [O1], [C2], [C7]; workshop budget guidance |
| Prompt cache versus response cache | Prompt caching reuses computation for matching input prefixes while still generating an answer. Reusing a final answer is a different application decision with freshness and authorization consequences. | [C2], introductory explanation and "Best practices"; [F8] |
| Managed routing versus quality-based escalation | Model router selects an eligible model before generation according to routing configuration. Retrying with a stronger model after a failed quality check is an application-owned strategy, not the same mechanism. Compare both against a measured baseline. | [C5], "How requests are routed"; [C7], "Design a fair workload comparison" |
| Routing versus conversation portability | Switching the next model does not transfer service-owned history. Portable routing needs accessible messages and compatible destination features. This is distinct from Foundry model router's internal model selection. | [C6], "Chat history storage determines portability" |
| Batch versus interactive work | Batch processing queues asynchronous requests for later results; it is not a way to stream a user's answer sooner. Model capability, data location, and pricing still matter. | [F1], "Agents, evaluations, and batch processing"; [C4] |

**Example/checkpoint:** use a clearly labeled illustration: a candidate consumes fewer tokens but fails more representative cases than the baseline. Ask whether it is cheaper per successful outcome. Expected answer: token count alone cannot establish that; compare cost with its units and pricing assumptions, the number of successful cases, and latency against agreed quality requirements. Zero successes provides no finite cost-per-success result.

### Teaching sequence

| Teaching beat | Minutes | Proposed content and grounding |
| --- | ---: | --- |
| Measure the right latency and cost | 5 | Define latency/throughput and first-token versus workflow completion timing. Explain the supplied token/cost-per-success example without assuming a prior evaluation run. [C1], [O1], [C7] |
| Caching without conflating features | 5 | Supported-model prompt caching and stable prefixes versus an application-owned response cache. Discuss freshness and authorization before reusing answers as an architecture decision, not an automatic Toolkit/Foundry feature. Model-specific cache behavior and charges must be cited, not generalized. [C2], [I5] |
| Model choice and routing | 6 | Fixed model versus managed routing versus application-owned escalation; note history portability. Use measured workload outcomes, not self-reported confidence as a calibrated score. [C3], [C5], [C6], [C7] |
| Batch versus interactive work | 4 | Batch API for asynchronous workloads, not a promise of lower interactive latency. No live batch submission or new deployment. [C4] |
| **Demo 4.1: Read the cost of another revision** | 5 | Compare captured bounded runs on the same question: usage, elapsed time, outcome, and why execution stopped. Identify the trade-off, not a guaranteed saving. [O1], [O2], [E2] |
| Set budgets and preserve correctness | 5 | Explain the provided revision/turn bound; propose token/time/tool limits and a deliberate partial-answer or escalation policy. Include evaluation/telemetry overhead and the cheaper-per-success checkpoint. [E1], [E2], [O4], [C7] |

**Demo design:** use the existing Day 4 golden-set and guardrail concepts, not a new routing implementation. A small comparison of recorded results keeps this module independent of extra model deployments. If monetary estimates are shown later, document model/version, input/output/cache rates, currency, and pricing date separately from raw token counts.

**Boundary:** managed model router is a documented product feature; "small first, escalate after a quality check" is an architectural strategy, not its asserted internal algorithm. No guaranteed percentage saving, universal confidence threshold, or assumption that a revision limit caps total Azure spend.

**Runtime qualification:** the MAF runtime-routing Concepts page currently documents an experimental .NET routing client and explicitly says Python support is unavailable. It is conceptual guidance here, not a promised Python demo or a limitation on calling Foundry's model router. Foundry also documents optional Chat Completions session affinity (preview); do not claim every turn must select a different model or that affinity guarantees cache hits. These are notes, not additional features to demonstrate. [C6], [C5]

## Module 5 - AI evaluations for agentic systems

**Outcome:** select an evaluator bundle for an application's failure modes, interpret each result on its documented scale, and place representative evaluation evidence across development, pre-production, and production.

### Concepts to establish

| Concept | Explanation to teach | Conceptual grounding |
| --- | --- | --- |
| Deterministic tests and behavioral evaluation | Keep tests for code, schemas, permissions, and tool contracts. Add evaluation for probabilistic quality, task behavior, and safety; neither replaces the other. | [E1], "What are evaluators?"; [E2], "Evaluation" |
| Evaluation dimensions and evaluator selection | Response quality, task completion, safety/content risk, and adversarial resilience require different evidence. Use the module's five practical lanes as a selection aid, not an exhaustive Foundry taxonomy. | [E6]; [E8]; [E9]; [E10]; [E11] |
| System and process evaluation | System evaluation assesses the overall outcome. Process evaluation inspects retrieval or tool-use steps. A successful tool call does not establish task completion, and a good final response does not establish a sound process. | [E7], "System evaluation" and "Process evaluation"; [E9] |
| Native scales and application thresholds | Scores are not automatically probabilities and cannot be averaged safely across incompatible scales. Preserve the evaluator, judge/deployment where applicable, scale, threshold, reason, and raw result. Application owners set acceptance policy. | [E8]; [E10]; [E7] |
| Custom evaluators and scenario bundles | Use code-, prompt-, or endpoint-based custom evaluators for application-specific requirements. Build a small bundle from architecture and failure modes rather than run every evaluator. | [E11]; [E6] |
| Representative evaluation data and lifecycle feedback | Reusable, reviewed, versioned datasets support comparison and regression work. Development checks, pre-production automation, sampled/scheduled production evaluation, and curated trace-derived cases form one feedback loop. | [E1]; [E2]; [E5]; [E12]; [E13]; [E14] |

**Example/checkpoint:** show an interaction whose tool calls return successfully but whose final answer omits a required part of the task. Ask whether run success establishes task completion. Expected answer: no; pair process evidence with a relevant system evaluator, then verify the evaluator supports the target, evaluation level, tool types, and required inputs.

### Teaching sequence

| Teaching beat | Minutes | Proposed content and grounding |
| --- | ---: | --- |
| Why evaluation and what to measure | 3 | Contrast deterministic tests with probabilistic behavior; separate response quality, task completion, safety/content risk, and adversarial resilience. [E1], [E2], [E6] |
| General-purpose and RAG evidence | 4 | Compare coherence with fluency, then separate retrieval-process metrics from groundedness, relevance, and completeness of the response. [E8], [E9] |
| Agent outcomes and tool-use process | 4 | Distinguish system evaluators from process evaluators and use the successful-tools/incomplete-task checkpoint. [E7] |
| Safety, scales, and thresholds | 3 | Map selected content, security, privacy, and agent-action risks; read each native output correctly and identify application-owned acceptance decisions. [E10], [S5] |
| Custom evaluators and scenario bundles | 3 | Choose code-, prompt-, or endpoint-based custom evaluation and assemble a focused starting bundle for RAG, tool-using agents, assistants, endpoints, or translation. [E11], [E6] |
| Lifecycle, datasets, and adoption | 3 | Connect local checks, versioned pre-production evidence, sampled/scheduled production evaluation, trace curation, and a phased operating model. [E1], [E2], [E5], [E12], [E13], [E14] |

**Delivery design:** this owner-supplied replacement is a concise reference module rather than a live demonstration and is delivered as PPTX only. The existing regression-gate runbook remains available as optional extension material, but Demo 5.1 is not part of the scheduled Day 5 roster. Do not add a CI connection, wait for a cloud evaluation, or present a workshop threshold as a Microsoft default during the 20-minute module.

**Boundary:** the four content-safety evaluators use a documented 0-7 severity scale and default passing threshold of 3 or lower; do not generalize that scale to every safety evaluator. Prohibited Actions and Sensitive Data Leakage are preview and agent-only, while Indirect Attack is model-only. Continuous evaluation samples eligible production traffic rather than inspecting every interaction. The Foundry GitHub Action and trace-to-dataset workflow are preview. Evaluator availability does not establish compatibility with every target, tool, region, or data shape. [E7], [E10], [E12], [E14]

## Module 6 - Foundry Toolkit for VS Code

**Outcome:** recognize the important Toolkit features and use the right surface for a short agent-development investigation.

### Concepts to establish

| Concept | Explanation to teach | Conceptual grounding |
| --- | --- | --- |
| Toolkit versus Toolbox | Toolkit is the VS Code development extension. A Toolbox is a reusable Foundry tool collection exposed through a managed MCP endpoint. Browsing a tool does not attach it or authorize its use. | [T1], official overview; [F3], "The tool lifecycle" |
| Model, agent, and conversation | A model performs inference; an agent adds reusable behavior and tools; a conversation supplies history. Model Playground tests model interactions; agent inspection also needs to show tool/runtime behavior. | [F2], runtime component model; [T1], "Work with models" |
| Local versus saved Foundry configuration | "Local" can mean the prompt is stored locally while inference still calls a cloud model. A saved Foundry agent version and a local prompt have different tool, structured-output, history, and evaluation options. | [T6], "Choose where to save" and "Work with local prompts" |
| Draft, version, and diagnostic evidence | A draft is an experiment; a saved version identifies a configuration. Save before relying on version-linked conversations or generated client code, and check what a generated evaluation actually targets. Local Inspector is not the cloud agent endpoint. | [F4], "Save changes as versions"; [T6], evaluation/client-code sections; [T3] |
| Skills versus tools | A Foundry coding skill supplies reusable guidance for development tasks; MCP tools perform operations. Skills in Copilot's development environment are not automatically skills attached to the customer-facing agent. | [T2], official explanatory guide; [F3], "Skills (preview)" |
| Agent Inspector versus local tracing | Agent Inspector exposes live HTTP/SSE protocol activity. Toolkit Tracing receives OpenTelemetry spans from instrumented code through a local OTLP collector and keeps separate local trace history. Neither surface proves local inference or cloud trace export. | [T3]; [T7], "Collect local traces" |

**Example/checkpoint:** show a locally stored prompt that uses an existing cloud model. Ask whether its data necessarily stays on the laptop and whether its evaluation view is identical to a saved Foundry agent's. Expected answer: neither follows from local storage; inspect the model endpoint and the configuration type.

### Teaching sequence

| Teaching beat | Minutes | Proposed content and grounding |
| --- | ---: | --- |
| Orient and select context | 1 | My Resources, Developer Tools, the active Foundry project, and local versus Foundry resource location. Toolkit is distinct from Foundry Toolbox. [T1], [T6], [F3] |
| Discover and compare models | 2 | Model Catalog and Model Playground: where to compare a prompt, model, and parameters. Use existing resources; do not deploy models. [T1] |
| Configure an agent and discover tools | 2 | Agent Builder's model, instructions, and tools; distinguish local prompt options from saved Foundry agent options. Identify Tool Catalog/MCP/toolboxes without rebuilding Day 2. [T1], [T6], [F3] |
| **Demo 6.1: Inspect the familiar workflow locally** | 6 | Use Agent Inspector for streaming responses and tool activity; show workflow visualization where supported by the prepared configuration. [T1], [T3], [T4] |
| Orient to tracing resources | 2 | Locate local Tracing under Developer Tools > Monitor and distinguish it from Agent Inspector and cloud telemetry. [T1], [T3], [T7] |
| **Demo 6.2: Trace local code in Toolkit** | 6 | Start the local OTLP collector, run the prepared Agent Framework WeatherAgent code, refresh the trace list, and inspect automatic/custom spans. [T7], [O1] |
| Copilot skills and surface selection | 2 | Explain Foundry-specific coding skills and review a proposed action; use the storage-versus-inference checkpoint above to confirm the surface distinction. [T2], [T6] |

**Demo design:** Demo 6.1 requires a preconfigured local HTTP/SSE agent wrapper; Agent Inspector cannot simply attach to an arbitrary terminal script. Demo 6.2 starts Toolkit's local OTLP collector, runs `demos/day5/assets/module-6-demo/foundry_tracing_toolkit.py`, and inspects its local trace. The local collector does not instrument code automatically, does not upload its database to Application Insights, and does not make the Foundry model local. Use only synthetic prompts when content capture is enabled. Keep separate captured, labeled walkthroughs as fallbacks.

**Scope discipline:** the live centerpieces are local protocol inspection and local OpenTelemetry trace inspection. Catalog, Agent Builder, Tool Catalog, and skills are brief orientation stops, not separate end-to-end demos. Detailed workflow visualization and emitted trace content vary by language, instrumentation, and installed Toolkit version; rehearse the exact Python environment before promising either view.

**Documentation correction:** do not present local prompt structured-output controls or dataset evaluation as universal Agent Builder features for saved Foundry agents. The latter's Evaluation tab scaffolds evaluation code or links to Foundry; the generated scaffold must be checked for version selection. Toolbox attachment to prompt agents is a separate preview opt-in. Keep these distinctions brief and use preconfigured resources rather than demonstrate opt-in/setup live. [T6]

**Excluded:** hosted-agent deployment, provisioning, container packaging, fine-tuning, local Windows model optimization, and an exhaustive playground tour. Installation is preflight, not live content. [T5]

## Module 7 - Capstone scoping working session

**Outcome:** each team leaves with a reviewed charter and architecture sketch, explicit evidence to collect, and owners for unresolved dependencies.

This is a customer-run module. The customer controls its duration, breaks, and internal pacing.

### Concepts to establish

| Concept | Explanation to teach | Conceptual grounding |
| --- | --- | --- |
| Five-layer sketch versus Azure resources | Model/Runtime/Actions/Knowledge/Ops is the workshop's organizing aid, not five Azure resources. Map it onto the real Foundry resource/project hierarchy and independently governed connected services. | [F1], "Foundry resource hierarchy"; workshop framing |
| Success criterion versus implementation task | "Enable tracing" is a task; "identify the failed retrieval step in the provided request trace" describes observable evidence. Specify the metric, unit, boundary, dataset, and acceptance rule instead of a vague goal such as "fast and accurate." | [O5]; [C7], "Define the deployment decision"; workshop criterion-writing guidance |
| Baseline versus candidate | Compare a known configuration with a changed one using the same documented cases and evaluator settings; record versions so improvements can be attributed rather than guessed. | [F4], "Save changes as versions"; [E5]; [C7] |
| Failure case versus control | An unauthorized lookup or an unsupported question is a test condition. Denial, evidence-limited response, and human review are chosen behaviors whose implementation and outcome must be checked, not inferred from a diagram. | [I6], [S4], [E7]; workshop scenario |

**Example/checkpoint:** challenge a charter that says only "improve answer quality." Ask the team to name the cases, expected behavior, suitable evaluator or human check, threshold, and evidence owner. Expected answer: a measurable criterion and a plan for collecting evidence, not an invented score or a claim that an unbuilt control already works.

### Working sequence

| Activity | Output |
| --- | --- |
| Define the user problem and narrow the scenario | Problem, users, in-scope task, explicit non-goals |
| Sketch the five-layer architecture | Model, Runtime, Actions, Knowledge, Ops; identify trust boundaries |
| Define success and the golden-set outline | 3-5 measurable signals; at least 10 planned cases and ground-truth sources |
| Assign roles, milestones, and risks | Team ownership, spike/eval/rehearsal milestones, data/quota assumptions |
| Peer challenge and facilitator coaching | Test the design against one failure path and one cost or permission risk |
| Record review disposition and next steps | Charter sign-off, or explicitly tracked unresolved items; individual 30-day next steps |

Facilitators should circulate throughout the session rather than postponing every team review until the closing activity. The goal remains a signed-off charter for every team. Confirm cohort size and coaching capacity before promising that outcome; unresolved charters must be labeled as needing review, not silently counted as approved.

Use only a few facilitator slides: instructions, charter prompts, and the review checklist. Follow the sequence at the pace the customer chooses; there is no new technical lecture in this module. Teams need a scenario and a way to edit/sketch the charter, not a completed lab or functioning agent.

## Proposed demonstration roster

All demonstrations have presenter runbooks. Their times are already included above; each path still requires rehearsal and an authentic fallback capture before delivery.

| ID | Minutes | Planned evidence | Mode and fallback |
| --- | ---: | --- | --- |
| 1.1 - Compare client-side and server-side traces | 8 | WeatherAgent client-side automatic/custom spans plus a Prompt-agent server-side trace in Foundry | Live run/inspect; separate dated captures if export or ingestion is delayed |
| 2.1 - Identity boundary | 7 | Principal/permission matrix, user-scoped retrieval results, and a denied approved action | Prepared access evidence; official tables and labeled expected outcomes if captures are unavailable |
| 3.1 - Safety boundary | 6 | Model-level detection/filter annotation versus offline groundedness evaluation | Prepared results or Microsoft's published examples; no live adversarial scan |
| 4.1 - Another revision | 5 | Side-by-side outcome, usage, duration, and stop reason | Captured comparison; no new model/router deployment |
| 6.1 - Inspect locally | 6 | Local agent traffic, tool calls, and a supported workflow view | Live Toolkit; recording from the pinned extension/runtime if the UI or graph is unavailable |
| 6.2 - Trace local code in Toolkit | 6 | Toolkit local OTLP trace with custom and automatic Agent Framework spans | Live local collection; dated capture from the same script and pinned Toolkit version if collection fails |
Total demonstration/walkthrough time: **38 minutes within the 156-minute technical block** (Modules 1-6).

Each future runbook must include placement, time box, source URLs, setup, narration, expected observations, failure/fallback path, and teaching payoff, matching the existing `demos/day4/` convention. Never present recorded data, a simulated denial, or a local check as a live cloud result.

## Optional production-readiness exercise

**Proposed duration: 30 minutes, optional and outside the instructor-led technical block.** A guided evidence checklist, not a coding lab, deployment task, or certification of production readiness.

| Step | Minutes | Attendee action |
| --- | ---: | --- |
| Select the system and evidence | 3 | Use the completed reference workflow or a capstone candidate; a provided evidence pack is sufficient |
| Observability and evaluation | 8 | Identify one useful trace, sensitive-data handling, a relevant evaluator, and what would block acceptance |
| Identity and safety | 8 | Map one tool/knowledge permission boundary, a negative case, the safety control, and the expected refusal/escalation |
| Cost and latency | 8 | Record a latency/usage baseline, a loop or time limit, and one proposed routing/caching trade-off to evaluate |
| Prioritize next actions | 3 | Select three improvements with owners and evidence needed |

Each row records **evidence/link, observed or proposed state, gap, owner, and next action**. Use "not yet observed" when appropriate; completing a checklist is not proof that a control works. Provide example answers using synthetic workshop data. Running extra commands, changing permissions, provisioning resources, or writing code is not required.

## Capstone deliverables

The checklist retains v0.7's required elements while honoring the updated dates and no-deployment scope:

- At least one MAF agent in the solution, using a Foundry-deployed model. A portal-only prompt definition does not demonstrate MAF usage by itself.
- At least one Foundry Toolbox tool, MCP server, or custom MAF function tool.
- At least one Foundry IQ knowledge source or a custom RAG pipeline.
- A golden set of **at least 10 items**, with a captured **Foundry evaluator** score and an initial-versus-final comparison. Local checks complement, but do not replace, this required evidence.
- OTel traces visible in Foundry tracing or Application Insights.
- An architecture diagram in any format.
- A README covering the problem, design decisions, evaluation story, and personalized 30-day next steps.
- A shared team demo, approximately **15 minutes: 10 minutes presentation/demo + 5 minutes Q&A and coaching**, with no competitive ranking.

The solution need not be multi-agent, and Day 5 adds no deployment prerequisite. Choose the simplest design that meets the user need. The reference project's eight-case Day 4 golden set demonstrates the method; teams must meet the capstone's separate ten-item minimum. Ten cases are a teaching minimum, not a statistically sufficient sample or certification of production readiness.

**Charter fields to include in the later template:** problem/users; scenario/non-goals; 3-5 success criteria; five-layer architecture; golden-set categories and ground-truth sources; team/roles; spike, evaluation, and rehearsal milestones; risks/assumptions; review disposition; demo-day window, with the exact date marked TBD and an organizer responsible for confirming it.

**Relative milestones:** Week 1: confirm team skills/environment, use the provided working starting point if useful, then produce a working spike and baseline evaluation. Week 2: improve controls and quality, rerun, document trade-offs. Week 2-3: rehearse and present. One or two lightweight coaching check-ins fit between kickoff and demo day. Lack of prior lab completion is a planning risk to surface at kickoff, not a reason to require catch-up work during Day 5. Avoid the original curriculum's now-stale October kickoff and November demo dates.

## Artifacts to author after approval

Paths below are proposed locations, not links to files that already exist.

| Artifact | Proposed location and scope |
| --- | --- |
| Day overview and module sources | `slides/day5/README.md` and seven `module-N-*.md` files using the names/order above |
| Delivery decks | Seven module decks under `decks/day5/`, assembled directly from the approved Markdown content and notes |
| Deck assembly | No persistent Day 5 generator; preserve the Day 4 theme, source footers, notes, and demo markers in the directly delivered PPTX files |
| Demonstrations | `demos/day5/README.md`, six runbooks, and only the small presenter implementations/evidence needed for those runbooks |
| Optional exercise | `labs/day5/README.md` and `production-readiness-checklist.md`, with a provided evidence pack; no student starter TODOs |
| Capstone materials | `labs/day5/capstone-charter-template.md`, `capstone-checklist.md`, `demo-day-guide.md`, and `30-day-next-steps-template.md` |
| Resources | Expand `docs/resources.md` with the approved Day 5 official documentation and keep it as the workshop's curated index |
| Release information | Record actual Python, SDK, Toolkit, and relevant API/model versions in the delivery manifest after rehearsal |

Use approximately 7-9 concise content/demo slides per substantive technical module, about 5-6 for Toolkit plus its demo marker, and a minimal customer-run facilitation deck. Counts are an authoring guide, not permission to add lecture time.

## Grounding and authoring contract

1. **Explain concepts, then trace each claim to documentation.** Use the module's concept definitions before procedures, with one observable example and checkpoint. Each substantive slide has the exact supporting Foundry/MAF URL in `<!-- source: ... -->`, plus `<!-- notes: ... -->` explaining the example, scope, and limitations. Prefer the relevant Concepts section for meaning and a how-to for mechanics; a link to a procedure alone does not ground every architectural claim. Multiple sources use the repository's pipe-separated convention.
2. **Keep references in the delivered PowerPoint.** A readable primary source appears on-slide; all supporting URLs appear in presenter notes as `GROUNDING SOURCE:` entries. Preserve source links when generating decks. No deck-wide bibliography as the only attribution.
3. **Separate fact from workshop design.** Label recommendations, thresholds, synthetic examples, and locally implemented gates as such. Cite this approved plan for capstone logistics rather than imply Microsoft mandates them.
4. **Respect surface and version boundaries.** Prefer current Foundry documentation, not classic portal/API instructions unless explicitly labeled. Follow the Python MAF examples for Python behavior. Do not borrow a .NET-only API or visualization recipe and claim Python support.
5. **Ground examples and diagrams.** Use official documentation and its linked Microsoft SDK samples. Record the exact sample/version and explain adaptations. Attribute source diagrams, and label workshop-authored architecture sketches as illustrative.
6. **Make limitations visible.** Call out preview, model, region, permission, and runtime requirements where they affect the lesson or demo. Recheck volatile features before September 21.
7. **Keep Markdown as the editable content record.** The owner directed direct PPTX delivery for this release rather than a repository generator. Preserve the Day 4 theme, notes, source footers, and demo markers, and check Markdown-to-deck parity after every deck update.
8. **Accept artifacts only after content and presentation review.** Inspect reference coverage, pacing for Modules 1-6, source-to-deck parity, runnable presenter paths, and rendered slides for truncation, overlap, and unreadable citations.

The current Day 4 generator demonstrates the required discipline: reject missing sources/notes and emit source footers plus grounding notes. Apply the same checks to the directly assembled Day 5 files, while treating workshop-policy slides honestly as policy rather than technical documentation.

## Dependencies and delivery risks

| Risk or dependency | Planned handling before content is finalized |
| --- | --- |
| No completed prior labs | Provide a complete bounded example, glossary-level recaps, and evidence pack; no attendee code, resources, traces, or scores required for Day 5 |
| Toolkit/Python/visualizer compatibility | Pin and rehearse the installed extension and local wrapper; preserve a genuine capture of any platform-specific view |
| Foundry trace visibility or ingestion delays | Confirm the existing project/Application Insights connection and read access; have a matched trace capture ready |
| Identity/safety/evaluation prerequisites | Use a prepared presenter environment and bounded examples; no live permission grants or surprise new resources |
| Preview and model/region differences | Record supported surfaces in each runbook; explain unsupported cases rather than substituting a successful-looking result |
| Evaluation and telemetry spend | Agree a presenter budget before rehearsal, bound inputs/runs, and prefer saved evidence for slow/costly operations |
| Capstone charter sign-off capacity | Confirm attendee/team count and coaching coverage; track any outstanding review explicitly |
| Capstone hands-on readiness | Record each team's environment/skills gap, offer the provided starting point, and prioritize an early coaching check-in without extending Day 5 |
| Demo-day date | Retain 2-3 weeks after September 21 and TBD until the organizer confirms the calendar |

Installation, sign-in, resource preparation, package selection, captures, and final UI/source refresh are presenter preflight work. They are not extra agenda items. The optional exercise may use the evidence pack without Azure access or Toolkit installation.

## Repository alignment

The repository overview now links this draft and reflects Day 5's revised format and no-deployment scope. After approval, align the earlier days' forward references **together with their corresponding generated decks**, without removing valid material already delivered:

| Existing location | Planned alignment |
| --- | --- |
| `slides/day1/module-1-landscape.md` | Remove deployment from the Day 5 preview |
| `slides/day1/module-2-foundry-portal.md` | Remove the promise that Day 5 deployment instruction leads with CLI/azd |
| `labs/day4/README.md` | Keep budget guardrails aligned to Day 5 Module 4 and production evaluation/CI aligned to Module 5 |
| `docs/resources.md` | Add the official references used by the authored Day 5 modules |
| New Day 5/capstone materials | Use September 21 kickoff and a relative 2-3-week demo window; no stale October/November schedule |

Do not modify the supplied approval document or rewrite unrelated Days 1-4 lessons in this phase.

## Approval checklist

- [x] Module sequence, learning outcomes, and time boxes accepted.
- [x] Concept definitions, worked checkpoints, and no-prior-lab-completion baseline accepted.
- [x] Break/buffer treatment chosen.
- [x] Short Toolkit feature tour and version-dependent demo boundary accepted.
- [x] Demonstration roster and recorded/prepared fallback approach accepted.
- [x] Optional 30-minute checklist format accepted.
- [x] Capstone requirements, templates, relative dates, and coaching/sign-off approach accepted.
- [x] Slide-level documentation and generated-deck reference requirements accepted.
- [x] Proceed to author the artifact set above.

## Official documentation source map

These links support the **technical** plan. Conceptual pages and the cited explanatory sections were reviewed on September 17, 2026; the original how-to/setup references remain implementation references and still require pre-delivery validation against the presenter environment. Capstone logistics and timing derive from the supplied v0.7 curriculum and the owner's subsequent decisions. Related Microsoft documentation is supplementary where the Foundry/MAF documentation directs readers to it.

The module-level concept tables connect explanations to specific pages and relevant topics, not just a product homepage. Toolkit has official overview and tracing guidance rather than a separate conceptual taxonomy; [T1], [T6], and [T7] are labeled accordingly. [S1] is a guardrails overview, not a Concepts-section article. [C1], [C2], [C7], and [E5] contain conceptual explanations within how-to paths. [I1], [I3], and [I5] supplement the identity Concepts pages for MCP, session ownership, and document permissions. Do not treat every link below as a page from a documentation **Concepts** section.

| ID | Official documentation | Use in this plan |
| --- | --- | --- |
| F1 | [Foundry architecture][F1] | Concept: resource/project hierarchy versus the workshop's five-layer aid |
| F2 | [Agents, conversations, and responses][F2] | Concept: behavior, persisted interaction context, and execution are different objects |
| F3 | [What is Toolbox in Foundry?][F3] | Concept: reusable tools, MCP endpoint, and tool lifecycle; distinct from Toolkit |
| F4 | [Agent development lifecycle][F4] | Concept: drafts, immutable versions, comparison, and evidence; not deployment instruction |
| F5 | [MAF agent concepts][F5] | Concept: application-owned agents versus connections to managed/remote agents |
| F6 | [MAF workflow concepts][F6] | Concept: executors, edges, events, and explicit execution paths |
| F7 | [What is Foundry IQ?][F7] | Concept: knowledge base, knowledge sources, and retrieval; feature/API scope |
| F8 | [RAG and indexes][F8] | Concept: retrieve/augment/generate, evidence limits, cost and data boundaries |
| F9 | [MAF workflows: choosing the right pattern][F9] | Explanatory journey: simpler patterns first; model decisions versus code-defined process |
| O1 | [MAF agent observability][O1] | Instrumentation/export, spans/metrics, sensitive-data controls |
| O2 | [MAF workflow observability][O2] | Executor/message spans, causal links, routing delivery status, language-specific behavior |
| O3 | [Set up tracing in Foundry][O3] | Project/Application Insights connection; server-side versus client-side tracing; visibility and privacy |
| O4 | [Configure tracing for AI agent frameworks][O4] | External MAF instrumentation and the documented GA/preview boundaries |
| O5 | [Agent tracing overview][O5] | Concept: traces, spans, attributes, exporters, semantic conventions, and correlation |
| O6 | [Quickstart: Create a prompt agent][O6] | Prompt-agent definition and invocation in Foundry |
| T1 | [Foundry Toolkit overview][T1] | Resources, model tools, Agent Builder, Tool Catalog, Inspector, evaluation and diagnostics |
| T2 | [Use the Microsoft Foundry Skill in coding agents][T2] | Core Foundry skill versus Toolkit-specific skills; review proposed actions |
| T3 | [Inspect a local agent with Agent Inspector][T3] | Local HTTP/SSE requirements and the local-versus-deployed boundary |
| T4 | [Create hosted agent workflows in Toolkit][T4] | Local run/debug and workflow visualization sections only; deployment sections excluded |
| T5 | [Install Foundry Toolkit][T5] | Extension and .NET Runtime prerequisites; installed-version feature discovery |
| T6 | [Prompt agents and local prompts in Toolkit][T6] | Explanatory how-to: storage badges, drafts/versions, distinct structured-output/evaluation paths |
| T7 | [Tracing in Foundry Toolkit][T7] | Local OTLP collector, instrumentation boundary, local trace inspection, storage, and cleanup |
| I1 | [Authentication for MCP tools][I1] | Workload versus user access, approval versus consent, shared credentials and OAuth constraints |
| I2 | [New agent endpoint and identity transition][I2] | Current versus legacy agent identities; qualifies older identity/publishing descriptions |
| I3 | [MAF application/session security][I3] | Authenticated session ownership and runtime-specific isolation responsibilities; not deployment instruction |
| I4 | [Connect a Foundry IQ knowledge base][I4] | Search/model permissions versus per-user document authorization and integration constraints |
| I5 | [Document-level access control in Azure AI Search][I5] | Foundry-linked custom-RAG reference: security filters, native permissions, chunks and refresh |
| I6 | [Foundry authentication and authorization][I6] | Concept: who is calling, allowed actions, control plane versus data plane |
| I7 | [Agent identity][I7] | Concept: delegated/application access; read identity defaults with the current migration guidance [I2] |
| I8 | [Foundry role-based access control][I8] | Concept: principals, role definitions, scopes, and invocation-only permissions |
| S1 | [Foundry guardrails and controls overview][S1] | Model versus agent controls, action applicability, inheritance, and preview boundaries |
| S2 | [Guardrail intervention points][S2] | Supported request/response/tool boundaries; no blanket arbitrary-MCP coverage |
| S3 | [Prompt Shields][S3] | Direct/indirect attacks, detection versus filtering, Spotlighting limitations |
| S4 | [RAG evaluators][S4] | Groundedness versus completeness and the limits of evaluation evidence |
| S5 | [AI Red Teaming Agent][S5] | Supported targets/tools, adversarial coverage, and limitations on assurance |
| S6 | [Risk and safety evaluators][S6] | Concept: selected content/agent risks, measurement scope, and limitations |
| C1 | [Performance and latency][C1] | Throughput versus latency; first-token/completion timing; token-volume context |
| C2 | [Prompt caching][C2] | Prompt-computation reuse, model-specific support, cache reads/writes and cost caveats |
| C3 | [Model router for Foundry][C3] | Per-request model selection, routing modes, eligible pools and limitations |
| C4 | [Azure OpenAI batch processing][C4] | Asynchronous workload handling, separate quota, supported models and turnaround caveats |
| C5 | [How model router works][C5] | Concept: request-time selection versus application escalation; optional session affinity |
| C6 | [MAF runtime model routing][C6] | Concept: history portability and service-owned state; current .NET-only helper |
| C7 | [Evaluate model router for your workload][C7] | Explanatory how-to: units, baseline, representative cases, acceptance criteria and uncertainty |
| E1 | [Observability in generative AI][E1] | Offline/production evaluation, monitoring, feedback and lifecycle framing |
| E2 | [MAF evaluation][E2] | Local and Foundry evaluators, repeated evaluation, workflow regression |
| E3 | [Agent Monitoring Dashboard][E3] | Sampled/scheduled evaluation, monitoring prerequisites and preview settings |
| E4 | [Cloud evaluation with the Foundry SDK][E4] | Data/evaluator mapping, results, supported evaluation units and prerequisites |
| E5 | [Evaluation datasets in Foundry][E5] | Versioned golden sets, trace-derived datasets and CI/regression use |
| E6 | [Built-in evaluators][E6] | Concept/reference: scoring families and turn/conversation levels |
| E7 | [Agent evaluators][E7] | Concept: system/process evaluation, input requirements, thresholds, and supported tools |
| E8 | [General-purpose evaluators][E8] | Coherence/fluency inputs, 1-5 scales, default thresholds, judge deployment, and language support |
| E9 | [RAG evaluators][E9] | Retrieval/process versus response/system evaluators, inputs, outputs, and preview boundaries |
| E10 | [Risk and safety evaluators][E10] | Content-severity scales, direct pass/fail outputs, target restrictions, and preview boundaries |
| E11 | [Custom evaluators][E11] | Code-, prompt-, and endpoint-based evaluator contracts and sandbox constraints |
| E12 | [Evaluation in GitHub Actions][E12] | Preview pre-production agent evaluation, reports, inputs, and cost guidance |
| E13 | [Generate a synthetic evaluation dataset][E13] | Synthetic generation workflow, minimum batch size, review, and reuse |
| E14 | [Convert traces into evaluation datasets][E14] | Preview workflow for curating production traces into reusable evaluation cases |

[F1]: https://learn.microsoft.com/azure/foundry/concepts/architecture
[F2]: https://learn.microsoft.com/azure/foundry/agents/concepts/runtime-components
[F3]: https://learn.microsoft.com/azure/foundry/agents/concepts/toolbox-overview
[F4]: https://learn.microsoft.com/azure/foundry/agents/concepts/development-lifecycle
[F5]: https://learn.microsoft.com/agent-framework/concepts/agents/
[F6]: https://learn.microsoft.com/agent-framework/concepts/workflows/
[F7]: https://learn.microsoft.com/azure/foundry/agents/concepts/what-is-foundry-iq
[F8]: https://learn.microsoft.com/azure/foundry/concepts/retrieval-augmented-generation
[F9]: https://learn.microsoft.com/agent-framework/journey/workflows
[O1]: https://learn.microsoft.com/agent-framework/agents/observability
[O2]: https://learn.microsoft.com/agent-framework/workflows/observability
[O3]: https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-setup
[O4]: https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-framework
[O5]: https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept
[O6]: https://learn.microsoft.com/azure/foundry/agents/quickstarts/prompt-agent
[T1]: https://learn.microsoft.com/azure/foundry/how-to/develop/get-started-projects-visual-studio-code
[T2]: https://learn.microsoft.com/azure/foundry/how-to/develop/use-microsoft-foundry-skill
[T3]: https://learn.microsoft.com/azure/foundry/agents/how-to/agent-inspector
[T4]: https://learn.microsoft.com/azure/foundry/agents/how-to/vs-code-agents-workflow-pro-code
[T5]: https://learn.microsoft.com/azure/foundry/how-to/develop/install-foundry-toolkit-visual-studio-code
[T6]: https://learn.microsoft.com/azure/foundry/how-to/develop/create-prompt-agent-visual-studio-code
[T7]: https://code.visualstudio.com/docs/intelligentapps/tracing
[I1]: https://learn.microsoft.com/azure/foundry/agents/how-to/mcp-authentication
[I2]: https://learn.microsoft.com/azure/foundry/agents/how-to/migrate-agent-applications
[I3]: https://learn.microsoft.com/agent-framework/hosting/self-hosting/#secure-session-continuation
[I4]: https://learn.microsoft.com/azure/foundry/agents/how-to/foundry-iq-connect
[I5]: https://learn.microsoft.com/azure/search/search-document-level-access-overview
[I6]: https://learn.microsoft.com/azure/foundry/concepts/authentication-authorization-foundry
[I7]: https://learn.microsoft.com/azure/foundry/agents/concepts/agent-identity
[I8]: https://learn.microsoft.com/azure/foundry/concepts/rbac-foundry
[S1]: https://learn.microsoft.com/azure/foundry/guardrails/guardrails-overview
[S2]: https://learn.microsoft.com/azure/foundry/guardrails/intervention-points
[S3]: https://learn.microsoft.com/azure/foundry/openai/concepts/content-filter-prompt-shields
[S4]: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/rag-evaluators
[S5]: https://learn.microsoft.com/azure/foundry/concepts/ai-red-teaming-agent
[S6]: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/risk-safety-evaluators
[C1]: https://learn.microsoft.com/azure/foundry/openai/how-to/latency
[C2]: https://learn.microsoft.com/azure/foundry/openai/how-to/prompt-caching
[C3]: https://learn.microsoft.com/azure/foundry/openai/concepts/model-router
[C4]: https://learn.microsoft.com/azure/foundry/openai/how-to/batch
[C5]: https://learn.microsoft.com/azure/foundry/openai/concepts/model-router-how-it-works
[C6]: https://learn.microsoft.com/agent-framework/concepts/agents/runtime-model-routing
[C7]: https://learn.microsoft.com/azure/foundry/openai/how-to/evaluate-model-router
[E1]: https://learn.microsoft.com/azure/foundry/concepts/observability
[E2]: https://learn.microsoft.com/agent-framework/agents/evaluation
[E3]: https://learn.microsoft.com/azure/foundry/observability/how-to/how-to-monitor-agents-dashboard
[E4]: https://learn.microsoft.com/azure/foundry/observability/how-to/cloud-evaluation
[E5]: https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets
[E6]: https://learn.microsoft.com/azure/foundry/concepts/built-in-evaluators
[E7]: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators
[E8]: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/general-purpose-evaluators
[E9]: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/rag-evaluators
[E10]: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/risk-safety-evaluators
[E11]: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/custom-evaluators
[E12]: https://learn.microsoft.com/azure/foundry/how-to/evaluation-github-action
[E13]: https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-dataset-synthetic
[E14]: https://learn.microsoft.com/azure/foundry/observability/how-to/traces-to-dataset
