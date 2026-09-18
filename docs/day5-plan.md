# Day 5 plan - Production readiness + Capstone kickoff

**Status: Approved September 18, 2026 - concepts review completed September 17, 2026.** This is the approved delivery and authoring plan for the Day 5 artifact set.

**Post-approval delivery direction:** on September 18, the owner requested that the Markdown sources be retained but the PPTX files be delivered directly, without adding `scripts/build-decks/day5.js`. That direction supersedes the generator-specific row and wording below while retaining the source, notes, parity, and visual-review requirements.

| Item | Planning baseline |
| --- | --- |
| Delivery | Monday, September 21, 2026 |
| Audience | Solution architects comfortable with Azure; mixed Microsoft Foundry and Microsoft Agent Framework (MAF) experience |
| Starting point | Everyone has been exposed to Days 1-4; completion of **any** prior lab is not assumed |
| Format | Four-hour live block, including a 60-minute capstone working session; short optional checklist exercise afterward |
| Curriculum authority | Owner-supplied `Publix_Building_AI_Apps_and_Agents_Curriculum_v0.7.docx`, with the explicit decisions below superseding it |
| Review | Jim reviews this draft; Pradeep remains the curriculum approver identified in v0.7 |
| Technical authority | Official Microsoft Foundry, MAF, and Foundry Toolkit documentation; conceptual grounding reviewed September 17, 2026 |
| Authoring gate | Approve this plan before authoring slides, generating PowerPoint, or implementing demonstrations |

## Decisions already settled

- Keep observability, identity/security, Responsible AI, cost/latency/routing, production evaluation, and capstone kickoff.
- Give **Foundry Toolkit for VS Code its own 15-minute Module 2**, immediately after observability. Observability becomes 30 minutes; Toolkit is not an embedded extra demo.
- Honor the struck-through deployment module in v0.7. **No deployment-target comparison, deployment walkthrough, deployment lab, or deployment deliverable for Day 5.** Earlier days' hosting instruction remains valid.
- Replace the standard two-hour lab with a **short optional guided checklist**, covering instrumentation/evaluation, identity/safety, and cost controls. No new student coding assignment.
- Capstones use teams of 2-3, with no solo path, and close with a shared demo day **2-3 weeks after September 21; exact date TBD**.
- Internal/proprietary data may be used without an additional workshop-specific restriction or approval gate. Existing organizational data-handling obligations still apply.
- All technical slide content must have supporting official documentation, with reference links in source Markdown and the generated slides/presenter notes.
- Day 5 requires conceptual exposure, not completed labs, a working personal agent, or attendee-owned Azure resources. Demonstrations use presenter-prepared examples; the optional exercise can use provided evidence.

## Learning arc and outcomes

Days 1-4 introduced the agent, its knowledge and tools, its runtime, and its orchestration/evaluation. Exposure does not imply implementation proficiency. Day 5 asks: **what evidence and controls would let an architect operate this system responsibly?**

Use the technical-documentation assistant and Planner/Retriever/Critic workflow as the shared reference, with a brief recap of the roles, retrieved evidence, and bounded revision loop. Say "the reference agent we examined," not "the agent you built." Provide a completed example and captured evidence so someone who completed none of the labs can participate without first running code.

Keep the shared vocabulary explicit in that recap: **Foundry resource/project** identifies the Azure service and development context; **MAF** is the application framework, not another name for the managed Foundry runtime; an **agent** combines model-driven behavior with instructions/tools; a **workflow** connects execution steps. Do not assume a local MAF object is a saved Foundry agent or that every workflow step is an agent. [F1], [F2], [F5], [F6]

Each module now includes **Concepts to establish**: plain-language definitions grounded in the documentation's Concepts sections, followed by a worked example/checkpoint. These explanations belong inside the existing teaching beats, not in additional lecture time. Official overviews or explanatory sections of how-to articles supplement concepts where needed; a procedure or UI screenshot alone is not an explanation.

| By the end, attendees can... | Evidence produced or interpreted |
| --- | --- |
| Follow a request through agent, model, tool, and workflow telemetry | Annotated trace: bottleneck, failed or skipped step, and relevant identifiers |
| Use Toolkit's main development surfaces without confusing them with production controls | Choose Agent Inspector, project resources, evaluation views, or Foundry/Application Insights for a specific task |
| Identify which identity needs permission at each boundary | Identity-to-resource access map, including a denied-access case |
| Choose layered safety controls and a deliberate failure response | A control/outcome table covering unsafe input, untrusted retrieved content, and unsupported answers |
| Reason about quality, latency, and cost together | A budget/routing decision tied to measured usage and task success |
| Distinguish offline regression from production monitoring | Sampling, evaluation, alert ownership, and regression-gate outline |
| Scope an achievable capstone | Team charter, architecture sketch, golden-set outline, milestones, and individual 30-day next steps |

## Live agenda

Offsets are cumulative content time, not a promised clock-time start. Demonstrations and discussions are **inside**, not additional to, each module's budget.

| # | Module | Minutes | Content offset |
| --- | --- | ---: | --- |
| 1 | Observability and tracing | 30 | 00:00-00:30 |
| 2 | Foundry Toolkit for VS Code | 15 | 00:30-00:45 |
| 3 | Identity and security | 30 | 00:45-01:15 |
| 4 | Responsible AI | 25 | 01:15-01:40 |
| 5 | Cost, latency, and model routing | 30 | 01:40-02:10 |
| 6 | Evaluation in production | 20 | 02:10-02:30 |
| 7 | Capstone briefing | 25 | 02:30-02:55 |
| 8 | Capstone scoping working session | 60 | 02:55-03:55 |
|  | **Scheduled content** | **235** |  |
|  | Flexible transition/overrun allowance | 5 | Unallocated |
|  | **Live budget** | **240** |  |

**Approved pacing:** 235 minutes of scheduled content plus five minutes of flexible transition/overrun allowance. There is no formal break in the four-hour block. If delivery logistics later require a 10-minute break, revise the agenda explicitly rather than silently compressing modules or taking time from the capstone working session.

The flow is intentional: understand telemetry, inspect it in the developer environment, secure the identity and data boundaries, apply safety controls, manage resource use, then connect the evidence to ongoing evaluation and capstone success criteria.

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
| From a console event stream to operational evidence | 5 | Recap the reference workflow and explain a supplied trace; distinguish logs, metrics, distributed traces, and evaluation. No attendee-generated trace is required. [O5], [O1], [E1] |
| Instrumentation and export | 6 | MAF instrumentation, exporters, project/Application Insights connection, and service/request correlation. Separate local application instrumentation from Foundry-managed server-side tracing. [O1], [O3], [O4] |
| Workflow and streaming boundaries | 5 | Follow executor/message spans and causal links; distinguish first response from completion. Do not promise one span per streamed token. [O2], [C1] |
| **Demo 1.1: Follow one request** | 6 | Inspect a completed Planner/Retriever/Critic run; identify a retrieval step, revision or stop, and a delay. Compare its identifiers with exported telemetry. [O1], [O2], [O3], [O4] |
| Telemetry is another data store | 5 | Sensitive-content capture, access, retention, sampling, and ingestion cost. Prefer minimized metadata; use only synthetic demo content when payload capture is needed. [O1], [O3], [O4] |
| Architect checkpoint | 3 | Use the delay-versus-quality question above. Transition from the telemetry contract to the Toolkit experience. [O5], [O2], [E1] |

**Demo design:** prepare a self-contained completed workflow, including the worked Day 4 revision guardrail. The existing `labs/day4/python/trace.py` prints workflow events; it is not, by itself, an Application Insights integration. The future demo must add and demonstrate actual instrumentation/export.

**Boundary:** no generic Azure Monitor administration course and no application hosting exercise. Label Foundry workflow/external-agent tracing as preview where the documentation does; do not label every tracing surface either preview or GA indiscriminately. GenAI semantic conventions are evolving; the concept overview's illustrative span names are not a guarantee of the exact Python MAF spans. Use the pinned framework's observability documentation for those names. [O5], [O2]

## Module 2 - Foundry Toolkit for VS Code

**Outcome:** recognize the important Toolkit features and use the right surface for a short agent-development investigation.

### Concepts to establish

| Concept | Explanation to teach | Conceptual grounding |
| --- | --- | --- |
| Toolkit versus Toolbox | Toolkit is the VS Code development extension. A Toolbox is a reusable Foundry tool collection exposed through a managed MCP endpoint. Browsing a tool does not attach it or authorize its use. | [T1], official overview; [F3], "The tool lifecycle" |
| Model, agent, and conversation | A model performs inference; an agent adds reusable behavior and tools; a conversation supplies history. Model Playground tests model interactions; agent inspection also needs to show tool/runtime behavior. | [F2], runtime component model; [T1], "Work with models" |
| Local versus saved Foundry configuration | "Local" can mean the prompt is stored locally while inference still calls a cloud model. A saved Foundry agent version and a local prompt have different tool, structured-output, history, and evaluation options. | [T6], "Choose where to save" and "Work with local prompts" |
| Draft, version, and diagnostic evidence | A draft is an experiment; a saved version identifies a configuration. Save before relying on version-linked conversations or generated client code, and check what a generated evaluation actually targets. Local Inspector is not the cloud agent endpoint. | [F4], "Save changes as versions"; [T6], evaluation/client-code sections; [T3] |
| Skills versus tools | A Foundry coding skill supplies reusable guidance for development tasks; MCP tools perform operations. Skills in Copilot's development environment are not automatically skills attached to the customer-facing agent. | [T2], official explanatory guide; [F3], "Skills (preview)" |

**Example/checkpoint:** show the Local badge on a prompt that uses an existing cloud model. Ask whether its data necessarily stays on the laptop and whether its evaluation view is identical to a saved Foundry agent's. Expected answer: neither follows from local storage; inspect the model endpoint and the configuration type.

### Teaching sequence

| Teaching beat | Minutes | Proposed content and grounding |
| --- | ---: | --- |
| Orient and select context | 1 | My Resources, Developer Tools, the active Foundry project, and Local/Foundry badges. Toolkit is distinct from Foundry Toolbox. [T1], [T6], [F3] |
| Discover and compare models | 2 | Model Catalog and Model Playground: where to compare a prompt, model, and parameters. Use existing resources; do not deploy models. [T1] |
| Configure an agent and discover tools | 2 | Agent Builder's model, instructions, and tools; distinguish local prompt options from saved Foundry agent options. Identify Tool Catalog/MCP/toolboxes without rebuilding Day 2. [T1], [T6], [F3] |
| **Demo 2.1: Inspect the familiar workflow locally** | 6 | Use Agent Inspector for streaming responses and tool activity; show workflow visualization where supported by the prepared configuration. [T1], [T3], [T4] |
| Find evaluation and diagnostic resources | 2 | Locate evaluations, conversations, logs, and traces for existing resources. Explain the boundary between local inspection and cloud telemetry. [T1], [O3] |
| Copilot skills and surface selection | 2 | Explain Foundry-specific coding skills and review a proposed action; use the Local-badge checkpoint above to confirm the surface distinction. [T2], [T6] |

**Demo design:** a preconfigured, local HTTP/SSE agent wrapper is required; Agent Inspector cannot simply attach to an arbitrary terminal script. Reuse Module 1's scenario and stable run identifiers. Cloud trace export and correlation are separate configuration, not an automatic side effect of opening Inspector. A captured, labeled walkthrough is the fallback.

**Scope discipline:** the live centerpiece is inspection. Catalog, Agent Builder, Tool Catalog, and skills are brief orientation stops, not separate end-to-end demos. The detailed workflow-visualization instructions vary by language and installed Toolkit version; Python parity must be established before a live graph is promised.

**Documentation correction:** do not present local prompt structured-output controls or dataset evaluation as universal Agent Builder features for saved Foundry agents. The latter's Evaluation tab scaffolds evaluation code or links to Foundry; the generated scaffold must be checked for version selection. Toolbox attachment to prompt agents is a separate preview opt-in. Keep these distinctions brief and use preconfigured resources rather than demonstrate opt-in/setup live. [T6]

**Excluded:** hosted-agent deployment, provisioning, container packaging, fine-tuning, local Windows model optimization, and an exhaustive playground tour. Installation is preflight, not live content. [T5]

## Module 3 - Identity and security

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
| **Demo 3.1: An approved action can still be denied** | 7 | Use the Alice/Bob checkpoint with prepared retrieval and session-ownership evidence. Identify the principal and enforcement point, not just the error message; no attendee permissions or lab output required. [I1], [I3], [I4], [I5] |

**Demo design:** use redacted, rehearsed evidence from a controlled presenter environment. No live role changes, OAuth consent walkthrough, or token display. If authentic captures are unavailable, use explicitly labeled expected outcomes and Microsoft's permission tables, not fabricated "observed" results.

**Identity transition:** the current migration documentation says newly created Foundry agents receive unique identities by default. "Shared project identity until published" describes legacy behavior, despite remaining wording in the agent identity Concepts page. Teach the current model and inspect the actual principal used for each connection; do not infer downstream permissions from the existence of a unique identity. [I2], [I7]

**Boundary:** do not promise automatic user isolation from a project managed identity or a session ID. Foundry IQ integration and native Search document-level controls have API/preview distinctions; the custom-RAG security-filter pattern is a separate approach. The MAF hosting reference is used only for its application-owned authentication/session-security guidance, not to reintroduce deployment.

## Module 4 - Responsible AI

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
| **Demo 4.1: Detection, filtering, and evidence** | 6 | Use the detected-versus-filtered checkpoint with prepared model annotations and a separate groundedness evaluation. Choose the application's response; no attendee agent or evaluation results required. [S1], [S3], [S4] |
| Red teaming and residual risk | 4 | Define Attack Success Rate and its tested population. Explain supported targets/tools and why a scan is not exhaustive assurance or certification; hand the test cases to Module 6. [S5] |

**Demo design:** use synthetic content and prepared model-level annotations or Microsoft's published examples. Keep an offline evaluator result visibly separate from a serving-time filter. No adversarial scan or attack against customer systems is part of the live demonstration.

**Critical scope notes:** Foundry agent guardrails are preview and do not automatically protect every external MAF application. Tool-call/response intervention requires supported tools; generic MCP is not listed as universally covered. Current documentation lists runtime groundedness and Spotlighting as model controls, not agent controls, and agent guardrails do not support annotate-only actions. That runtime restriction does not prevent groundedness evaluation of agent responses. Spotlighting has additional preview/API constraints. These distinctions belong in the teaching material, not just a footnote. [S1], [S2], [S3], [S4]

**Boundary:** no safety guarantee, invented approval API, or assertion that the Day 4 workflow is fully protected merely because its model has a content filter. The Foundry red-teaming service also has target/runtime restrictions; do not promise a supported scan of that arbitrary workflow.

## Module 5 - Cost, latency, and model routing

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
| **Demo 5.1: Read the cost of another revision** | 5 | Compare captured bounded runs on the same question: usage, elapsed time, outcome, and why execution stopped. Identify the trade-off, not a guaranteed saving. [O1], [O2], [E2] |
| Set budgets and preserve correctness | 5 | Explain the provided revision/turn bound; propose token/time/tool limits and a deliberate partial-answer or escalation policy. Include evaluation/telemetry overhead and the cheaper-per-success checkpoint. [E1], [E2], [O4], [C7] |

**Demo design:** use the existing Day 4 golden-set and guardrail concepts, not a new routing implementation. A small comparison of recorded results keeps this module independent of extra model deployments. If monetary estimates are shown later, document model/version, input/output/cache rates, currency, and pricing date separately from raw token counts.

**Boundary:** managed model router is a documented product feature; "small first, escalate after a quality check" is an architectural strategy, not its asserted internal algorithm. No guaranteed percentage saving, universal confidence threshold, or assumption that a revision limit caps total Azure spend.

**Runtime qualification:** the MAF runtime-routing Concepts page currently documents an experimental .NET routing client and explicitly says Python support is unavailable. It is conceptual guidance here, not a promised Python demo or a limitation on calling Foundry's model router. Foundry also documents optional Chat Completions session affinity (preview); do not claim every turn must select a different model or that affinity guarantees cache hits. These are notes, not additional features to demonstrate. [C6], [C5]

## Module 6 - Evaluation in production

**Outcome:** design a repeatable feedback loop connecting sampled traffic, curated test data, regression evidence, and an accountable response to degradation.

### Concepts to establish

| Concept | Explanation to teach | Conceptual grounding |
| --- | --- | --- |
| Evaluator, score, and threshold | An evaluator applies criteria to supplied data. It may use deterministic checks, a judge model, or a service. Its score is not automatically a probability; interpret the scale, pass threshold, inputs, and limitations before aggregating results. | [E6], evaluator families; [E7], "Using agent evaluators"; [E2] |
| System/process and turn/conversation | System evaluation assesses outcomes; process evaluation assesses steps. Turn/conversation describes the interaction length being scored. These are different axes: checking the final answer alone does not validate tool use. | [E7], "System evaluation" and "Process evaluation"; [E6], "Evaluation levels" |
| Golden set and ground truth | A golden set is the workshop's curated, reusable test dataset. Ground truth records reviewed expected answers or actions where the evaluator needs them; a saved model answer is not automatically truth. | [E5], "Do you need an evaluation dataset?"; [E7], "Task navigation efficiency" |
| Offline, continuous, and scheduled evaluation | Offline checks compare changes against a stable set. Continuous evaluation samples production interactions. Scheduled evaluation reruns a dataset over time. Sampling misses some traffic; it is not an inline safety gate. | [E1], "The three stages of AI application lifecycle evaluation" |
| Regression, drift, and a quality gate | Regression is worse behavior relative to a baseline; drift is a change observed over time and may reflect changed traffic or data. A quality gate is an application/pipeline acceptance decision based on results, not a guarantee from the SDK. | [E1]; [E2]; [C7], "Read the tradeoffs together" and "Monitor and repeat the evaluation" |

**Example/checkpoint:** show an interaction whose tool calls return successfully but whose final answer omits a required part of the task. Ask whether run success establishes task completion. Expected answer: no; choose an outcome evaluator as well as process evidence. Confirm the chosen evaluator supports the interaction level, tool types, and required data.

### Teaching sequence

| Teaching beat | Minutes | Proposed content and grounding |
| --- | ---: | --- |
| Three complementary loops | 3 | Define the golden set, baseline, and offline/sampled/scheduled loops. Use a prepared example rather than assume attendees ran Day 4's evaluation. [E1], [E5] |
| Sampling, visibility, and cost | 4 | Define evaluator inputs, interaction level, score/threshold, eligible traffic, and alert ownership. Account for preview scope and extra evaluator/model cost. [E6], [E7], [E3], [E4] |
| Drift, feedback, and adversarial coverage | 4 | Examine segments and repeated results, not one changed average; turn reviewed user feedback and failures into golden-set candidates. Carry forward the safety module's adversarial coverage and residual-risk discussion. [E1], [E2], [E5], [S5] |
| **Demo 6.1: A regression blocks acceptance** | 5 | Compare baseline/candidate results, identify a failing case, and inspect the proposed gate decision and saved evidence. The gate is workshop logic using documented evaluation outputs. [E2], [E4], [E5] |
| Close the loop | 4 | Use the successful-tools/incomplete-task checkpoint, assign triage ownership, change one thing, and retain versions/results. Carry the distinction into charter success criteria. [E1], [E2], [E7] |

**Demo design:** show a small local regression-gate wrapper and saved Foundry evaluation results, with a clearly labeled captured pipeline run if available. Do not require a new CI service connection, pipeline provisioning, or a cloud evaluation finishing live. Missing, errored, or unsupported evaluations must be visible and must not be represented as passes; the proposed workshop gate blocks acceptance when required evidence is unavailable. Explain each metric's own scale and acceptance rule rather than compare unlike raw scores. The Day 4 harness is a starting point, not an already-integrated CI gate.

**Boundary:** recap enough vocabulary to interpret the supplied evidence, without repeating Day 4's evaluator catalog. Do not imply continuous evaluation of a portal-managed agent automatically monitors every arbitrary local MAF workflow; identify the supported target and telemetry/data source. The agent-evaluators Concepts page lists tool-specific limitations; general availability of an evaluator does not establish compatibility with every search/tool integration. [E7]

## Module 7 - Capstone briefing

**Outcome:** each attendee has a team and understands the required evidence, realistic scope, and demo-day expectations.

These are **workshop requirements from v0.7 and the owner's decisions**, not Microsoft product requirements.

### Concepts to establish

| Concept | Explanation to teach | Conceptual grounding |
| --- | --- | --- |
| Agent versus workflow | An agent can choose its next tools using a model; a workflow defines explicit paths between agents or other code. More agents are not automatically a better solution, and explicit control flow does not make model outputs deterministic. | [F5], [F6], MAF Concepts; [F9], "Choosing the right pattern" |
| Model grounding versus enterprise knowledge | Using a Foundry-deployed model selects the inference service. RAG retrieves relevant content into the input; it is that evidence, not merely the model's location, that grounds an answer in enterprise knowledge. | [F2]; [F8], "What is RAG?" |
| Knowledge base versus knowledge source | A Foundry IQ knowledge base specifies sources and retrieval behavior; sources connect to indexed or remote content. A custom RAG pipeline implements retrieval differently. Either approach needs usable, current evidence and appropriate permissions. | [F7], "Components"; [F8], "Known limitations" |
| Deliverable versus evidence | Working software, an architecture diagram, and evaluation/trace evidence answer different questions. The ten-item minimum, team size, and demo format are workshop policy, not a Microsoft readiness standard. | [E5], [E7], [O5]; v0.7 and this plan for logistics |

**Example/checkpoint:** consider a single MAF agent with one read-only tool, a knowledge source, and evaluation/trace evidence. Ask whether it must become a three-agent workflow to qualify. Expected answer: no; the stated capstone requirements and the user need determine scope, not the Day 4 reference topology.

### Teaching sequence

| Teaching beat | Minutes | Proposed content |
| --- | ---: | --- |
| Frame the assignment | 3 | A reviewed, useful deliverable in 2-3 weeks; coaching, not a hackathon or competition |
| Required elements | 6 | Explain model, tool, knowledge, and evidence as separate requirements; distinguish the product concepts from the workshop checklist |
| An achievable scope | 5 | Use the single-agent checkpoint: one user problem, a small tool/knowledge boundary, a measurable outcome, and one failure path; multi-agent is not mandatory |
| Milestones and demo-day format | 5 | Working spike, first evaluation, iteration, rehearsal, and shared demo; exact demo date TBD |
| Team formation and working-session handoff | 6 | Teams of 2-3, everyone included; capture a candidate scenario and open the charter |

**Visual plan:** use a requirements matrix, a relative milestone timeline, and a worked charter excerpt rather than a dense administrative deck. Product-related examples cite the relevant MAF/Foundry sources; team size, deadlines, and rubric cite the workshop plan.

## Module 8 - Capstone scoping working session

**Outcome:** each team leaves with a reviewed charter and architecture sketch, explicit evidence to collect, and owners for unresolved dependencies.

### Concepts to establish

| Concept | Explanation to teach | Conceptual grounding |
| --- | --- | --- |
| Five-layer sketch versus Azure resources | Model/Runtime/Actions/Knowledge/Ops is the workshop's organizing aid, not five Azure resources. Map it onto the real Foundry resource/project hierarchy and independently governed connected services. | [F1], "Foundry resource hierarchy"; workshop framing |
| Success criterion versus implementation task | "Enable tracing" is a task; "identify the failed retrieval step in the provided request trace" describes observable evidence. Specify the metric, unit, boundary, dataset, and acceptance rule instead of a vague goal such as "fast and accurate." | [O5]; [C7], "Define the deployment decision"; workshop criterion-writing guidance |
| Baseline versus candidate | Compare a known configuration with a changed one using the same documented cases and evaluator settings; record versions so improvements can be attributed rather than guessed. | [F4], "Save changes as versions"; [E5]; [C7] |
| Failure case versus control | An unauthorized lookup or an unsupported question is a test condition. Denial, evidence-limited response, and human review are chosen behaviors whose implementation and outcome must be checked, not inferred from a diagram. | [I6], [S4], [E7]; workshop scenario |

**Example/checkpoint:** challenge a charter that says only "improve answer quality." Ask the team to name the cases, expected behavior, suitable evaluator or human check, threshold, and evidence owner. Expected answer: a measurable criterion and a plan for collecting evidence, not an invented score or a claim that an unbuilt control already works.

### Working sequence

| Activity | Minutes | Output |
| --- | ---: | --- |
| Define the user problem and narrow the scenario | 10 | Problem, users, in-scope task, explicit non-goals |
| Sketch the five-layer architecture | 12 | Model, Runtime, Actions, Knowledge, Ops; identify trust boundaries |
| Define success and the golden-set outline | 10 | 3-5 measurable signals; at least 10 planned cases and ground-truth sources |
| Assign roles, milestones, and risks | 10 | Team ownership, spike/eval/rehearsal milestones, data/quota assumptions |
| Peer challenge and Jim's coaching | 10 | Test the design against one failure path and one cost or permission risk |
| Record review disposition and next steps | 8 | Charter sign-off, or explicitly tracked unresolved items; individual 30-day next steps |

Jim should circulate throughout the hour, not start reviewing every team in the final eight minutes. The goal remains a signed-off charter for every team. Confirm cohort size and coaching capacity before promising that outcome; unresolved charters must be labeled as needing review, not silently counted as approved.

Use only a few facilitator slides: instructions, timing, charter prompts, and the review checklist. Use the concept prompts during coaching within the allotted activities; there is no new technical lecture in this module. Teams need a scenario and a way to edit/sketch the charter, not a completed lab or functioning agent.

## Proposed demonstration roster

All demonstrations are **planned, not yet implemented or rehearsed**. Their times are already included above.

| ID | Minutes | Planned evidence | Mode and fallback |
| --- | ---: | --- | --- |
| 1.1 - Follow one request | 6 | MAF workflow telemetry and matching Foundry/Application Insights evidence | Live read/inspect; dated trace capture if export or ingestion is delayed |
| 2.1 - Inspect locally | 6 | Local agent traffic, tool calls, and a supported workflow view | Live Toolkit; recording from the pinned extension/runtime if the UI or graph is unavailable |
| 3.1 - Identity boundary | 7 | Principal/permission matrix, user-scoped retrieval results, and a denied approved action | Prepared access evidence; official tables and labeled expected outcomes if captures are unavailable |
| 4.1 - Safety boundary | 6 | Model-level detection/filter annotation versus offline groundedness evaluation | Prepared results or Microsoft's published examples; no live adversarial scan |
| 5.1 - Another revision | 5 | Side-by-side outcome, usage, duration, and stop reason | Captured comparison; no new model/router deployment |
| 6.1 - Regression gate | 5 | Baseline/candidate case results, gate outcome, and evidence | Local/saved results; captured pipeline walkthrough instead of waiting for cloud jobs |

Total demonstration/walkthrough time: **35 minutes within the 150-minute technical block** (Modules 1-6).

Each future runbook must include placement, time box, source URLs, setup, narration, expected observations, failure/fallback path, and teaching payoff, matching the existing `demos/day4/` convention. Never present recorded data, a simulated denial, or a local check as a live cloud result.

## Optional production-readiness exercise

**Proposed duration: 30 minutes, optional and outside the live budget.** A guided evidence checklist, not a coding lab, deployment task, or certification of production readiness.

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
| Day overview and module sources | `slides/day5/README.md` and eight `module-N-*.md` files using the names/order above |
| Delivery decks | Eight module decks under `decks/day5/`, assembled directly from the approved Markdown content and notes |
| Deck assembly | No persistent Day 5 generator; preserve the Day 4 theme, source footers, notes, and demo markers in the directly delivered PPTX files |
| Demonstrations | `demos/day5/README.md`, six runbooks, and only the small presenter implementations/evidence needed for those runbooks |
| Optional exercise | `labs/day5/README.md` and `production-readiness-checklist.md`, with a provided evidence pack; no student starter TODOs |
| Capstone materials | `labs/day5/capstone-charter-template.md`, `capstone-checklist.md`, `demo-day-guide.md`, and `30-day-next-steps-template.md` |
| Resources | Expand `docs/resources.md` with the approved Day 5 official documentation, keeping it the source for the resources slide |
| Release information | Record actual Python, SDK, Toolkit, and relevant API/model versions in the delivery manifest after rehearsal |

Use approximately 7-9 concise content/demo slides per substantive technical module, about 5-6 for Toolkit plus its demo marker, a short capstone briefing, and a minimal facilitation deck. Counts are an authoring guide, not permission to add lecture time.

## Grounding and authoring contract

1. **Explain concepts, then trace each claim to documentation.** Use the module's concept definitions before procedures, with one observable example and checkpoint. Each substantive slide has the exact supporting Foundry/MAF URL in `<!-- source: ... -->`, plus `<!-- notes: ... -->` explaining the example, scope, and limitations. Prefer the relevant Concepts section for meaning and a how-to for mechanics; a link to a procedure alone does not ground every architectural claim. Multiple sources use the repository's pipe-separated convention.
2. **Keep references in the delivered PowerPoint.** A readable primary source appears on-slide; all supporting URLs appear in presenter notes as `GROUNDING SOURCE:` entries. Preserve source links when generating decks. No deck-wide bibliography as the only attribution.
3. **Separate fact from workshop design.** Label recommendations, thresholds, synthetic examples, and locally implemented gates as such. Cite this approved plan for capstone logistics rather than imply Microsoft mandates them.
4. **Respect surface and version boundaries.** Prefer current Foundry documentation, not classic portal/API instructions unless explicitly labeled. Follow the Python MAF examples for Python behavior. Do not borrow a .NET-only API or visualization recipe and claim Python support.
5. **Ground examples and diagrams.** Use official documentation and its linked Microsoft SDK samples. Record the exact sample/version and explain adaptations. Attribute source diagrams, and label workshop-authored architecture sketches as illustrative.
6. **Make limitations visible.** Call out preview, model, region, permission, and runtime requirements where they affect the lesson or demo. Recheck volatile features before September 21.
7. **Keep Markdown as the editable content record.** The owner directed direct PPTX delivery for this release rather than a repository generator. Preserve the Day 4 theme, notes, source footers, and demo markers, and check Markdown-to-deck parity after every deck update.
8. **Accept artifacts only after content and presentation review.** Inspect reference coverage, module/demo timing, source-to-deck parity, runnable presenter paths, and rendered slides for truncation, overlap, and unreadable citations.

The current Day 4 generator demonstrates the required discipline: reject missing sources/notes and emit source footers plus grounding notes. Apply the same checks to the directly assembled Day 5 files, while treating workshop-policy slides honestly as policy rather than technical documentation.

## Dependencies and delivery risks

| Risk or dependency | Planned handling before content is finalized |
| --- | --- |
| Five-minute buffer is insufficient for a normal break | Approve the pacing option above; do not silently compress the capstone hour |
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
| `labs/day4/README.md` | Remap budget guardrails from Day 5 Module 4 to Module 5, and production evaluation/CI from Module 5 to Module 6 |
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

The module-level concept tables connect explanations to specific pages and relevant topics, not just a product homepage. Toolkit has an official overview rather than a separate conceptual taxonomy; [T1] and [T6] are labeled accordingly. [S1] is a guardrails overview, not a Concepts-section article. [C1], [C2], [C7], and [E5] contain conceptual explanations within how-to paths. [I1], [I3], and [I5] supplement the identity Concepts pages for MCP, session ownership, and document permissions. Do not treat every link below as a page from a documentation **Concepts** section.

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
| T1 | [Foundry Toolkit overview][T1] | Resources, model tools, Agent Builder, Tool Catalog, Inspector, evaluation and diagnostics |
| T2 | [Use the Microsoft Foundry Skill in coding agents][T2] | Core Foundry skill versus Toolkit-specific skills; review proposed actions |
| T3 | [Inspect a local agent with Agent Inspector][T3] | Local HTTP/SSE requirements and the local-versus-deployed boundary |
| T4 | [Create hosted agent workflows in Toolkit][T4] | Local run/debug and workflow visualization sections only; deployment sections excluded |
| T5 | [Install Foundry Toolkit][T5] | Extension and .NET Runtime prerequisites; installed-version feature discovery |
| T6 | [Prompt agents and local prompts in Toolkit][T6] | Explanatory how-to: storage badges, drafts/versions, distinct structured-output/evaluation paths |
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
[T1]: https://learn.microsoft.com/azure/foundry/how-to/develop/get-started-projects-visual-studio-code
[T2]: https://learn.microsoft.com/azure/foundry/how-to/develop/use-microsoft-foundry-skill
[T3]: https://learn.microsoft.com/azure/foundry/agents/how-to/agent-inspector
[T4]: https://learn.microsoft.com/azure/foundry/agents/how-to/vs-code-agents-workflow-pro-code
[T5]: https://learn.microsoft.com/azure/foundry/how-to/develop/install-foundry-toolkit-visual-studio-code
[T6]: https://learn.microsoft.com/azure/foundry/how-to/develop/create-prompt-agent-visual-studio-code
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
