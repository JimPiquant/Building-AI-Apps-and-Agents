---
title: AI Evaluations for Agent Framework Developers
subtitle: Measuring quality, safety, and task completion in agentic systems
deck: module-5-production-evaluation-old.pptx
eyebrow: DAY 5 · MODULE 6 · 20 MIN
tag: D5 · M6
---

# Module 6 — AI Evaluations for Agent Framework Developers

## AI Evaluations for Agent Framework Developers
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/observability -->
<!-- source: https://learn.microsoft.com/agent-framework/agents/evaluation -->

> Presenter guidance: **Outcome:** Frame evaluation as the evidence layer between an agent change and a release decision. Microsoft Agent Framework can run fast local evaluators, Foundry evaluators, or both in one evaluation run. This module follows a decision path: identify the quality question, select evaluators and data, interpret each evaluator's scale, and place repeatable evaluation at the right lifecycle stage. **Transition:** First establish why conventional deterministic tests cannot provide enough evidence on their own.

---

## Traditional testing isn't enough
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/observability -->
<!-- source: https://learn.microsoft.com/agent-framework/agents/evaluation -->

- **Reputational** — Inaccurate, inconsistent, poorly grounded, or harmful responses erode user trust.
- **Governance** — Teams need repeatable evidence that quality, safety, and behavior expectations were checked.
- **Operational** — Without stable baselines, regressions and production drift are difficult to detect.

AI behavior is probabilistic. A response can be polished but wrong, and an agent can reach a plausible answer through the wrong tools or sequence.

> Presenter guidance: **Teaching point:** Keep deterministic tests for code, schemas, permissions, and tool contracts; add evaluation for behavior that is variable or judged on a continuum. Foundry observability explicitly joins evaluation, monitoring, and tracing because no single signal explains quality. Avoid saying evaluation proves an application is safe or compliant. It supplies evidence for a human-owned release and governance process. **Prompt:** Ask which failure would be most expensive for the audience's current agent: a bad answer, a wrong action, or a harmful interaction.

---

## What we need to measure
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/built-in-evaluators -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/risk-safety-evaluators -->

- **Response quality** — Coherence, fluency, relevance, groundedness, and completeness of generated text.
- **Task completion** — Whether the agent followed instructions, resolved intent, and produced the required outcome.
- **Safety and content risk** — Harmful content, protected material, sensitive data, or prohibited agent actions.
- **Adversarial resilience** — Behavior under prompt injection, jailbreak, manipulation, and other attack-oriented probes.

> Presenter guidance: **Teaching point:** These four questions keep teams from treating one aggregate score as "agent quality." Response quality, system outcomes, process behavior, and safety need different evidence. An application can be fluent but ungrounded, complete a task while violating policy, or resist ordinary prompts but fail under adversarial pressure. **Boundary:** Built-in evaluators measure selected behaviors. Red teaming explores attack paths. Neither replaces deterministic tests, threat modeling, monitoring, or human review.

---

## The evaluator landscape
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/built-in-evaluators -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/custom-evaluators -->

- **General purpose** — Coherence and fluency measure writing quality.
- **RAG** — Retrieval and response evaluators measure context selection and grounded answers.
- **Agent** — System evaluators judge outcomes; process evaluators inspect tool-use steps.
- **Risk and safety** — Content, security, privacy, and agent-action evaluators expose selected risks.
- **Custom** — Code-, prompt-, or endpoint-based evaluators encode application-specific requirements.

Use these five lanes as a workshop map, not as an exhaustive product taxonomy. Select several evaluators because each one answers a different question.

> Presenter guidance: **Teaching point:** The current Foundry catalog contains more evaluator categories than these five lanes, including textual-similarity, natural-language-processing, and OpenAI-based graders. The slide deliberately groups the evaluators needed for the module's story rather than claiming an official five-family taxonomy. Start from the release decision and failure modes, then choose evaluators; do not start by running the entire catalog. **Transition:** Begin with the smallest quality question: is the response well written?

---

## General purpose evaluators
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/general-purpose-evaluators -->

- **Coherence** — Logical flow and organization. Do ideas connect and transitions make sense? Inputs: query and response.
- **Fluency** — Grammar, vocabulary, and readability. How naturally does the response read? Input: response.

Both are LLM-as-a-judge evaluators on a 1–5 scale, with a documented default pass threshold of 3. They require `deployment_name` and currently support English responses.

> Presenter guidance: **Teaching point:** Coherence and fluency judge writing quality, not factual correctness. A hallucination can score well on both, so pair them with groundedness, relevance, domain checks, or human review when correctness matters. Explain that the evaluator model is another model dependency: pin it, record it, and treat a score as evidence with uncertainty rather than ground truth. **Scale:** Higher is better; the default threshold is documented, but teams can configure thresholds for their application.

---

## RAG evaluators
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/rag-evaluators -->

| Evaluator | What it measures | Required inputs |
|---|---|---|
| Retrieval | Relevance of retrieved context to the query | query, context |
| Document Retrieval | Labeled search quality: fidelity, NDCG, XDCG, max relevance, and holes | query, context, ground_truth |
| Groundedness | Whether claims in the response are supported by provided context | response, context |
| Groundedness Pro | Strict binary grounding through Content Safety; preview | query, response, context |
| Relevance | Whether the response directly addresses the query | query, response |
| Response Completeness | Critical ground-truth coverage | response, ground_truth |

Process evaluation measures retrieval. System evaluation measures the response. Use both to distinguish a search failure from a generation failure.

> Presenter guidance: **Teaching point:** A grounded response can still be incomplete, and a relevant response can still rely on poor retrieval. Retrieval and Document Retrieval inspect the process. Groundedness, Groundedness Pro, Relevance, and Response Completeness inspect the end result. **Boundary:** Groundedness Pro is preview, produces a binary result, and does not require `deployment_name`; other RAG evaluators have their own model, input, score, and support requirements. Check the current evaluator reference before automating a gate.

---

## Agent evaluators — system evaluation
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->

- **Task Completion** — Did the agent produce a usable deliverable that satisfies the task requirements?
- **Task Adherence** — Did the agent follow the task, instructions, and relevant constraints?
- **Task Navigation Efficiency** — Did the agent complete the task without unnecessary steps or tool calls?
- **Intent Resolution** — Did the interaction identify and address the user's request?
- **Customer Satisfaction** — Did the conversation show signs of a satisfactory or unsatisfactory experience?

System evaluation asks whether the agent did the right thing overall.

> Presenter guidance: **Teaching point:** System evaluators score the outcome or interaction, not just the final sentence. Their outputs are not uniform: some return a score with a thresholded pass result, some return binary results, and some also return diagnostic details. Do not normalize them blindly into one average. **Data:** Agent evaluations can require conversation history, tool definitions, tool calls, responses, and sometimes ground truth. Verify the evaluator's required inputs and supported evaluation level.

---

## Agent evaluators — process evaluation
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->

| Evaluator | Question answered | Evidence inspected |
|---|---|---|
| Tool Call Accuracy | Were the right tools and arguments used without unnecessary calls? | tool definitions, calls, ground truth |
| Tool Selection | Did the agent select the expected tool set? | available and selected tools |
| Tool Input Accuracy | Were arguments grounded, typed, formatted, required, expected, and appropriate? | tool definitions and call inputs |
| Tool Output Utilization | Were tool results used in later reasoning and responses? | tool outputs and following messages |
| Tool Call Success | Did execution complete without tool errors? | call and result status |

Process evaluation asks whether each tool-use step went right.

> Presenter guidance: **Teaching point:** Process evaluators are the closest equivalent to behavioral unit tests inside an agent trajectory, but they are not ordinary code unit tests. They inspect structured trace or message evidence and may use model judgment. Use them to localize why a system evaluator failed: wrong tool selection, bad parameters, ignored output, or execution error. **Caution:** Not every evaluator supports every target, evaluation level, or input format; preserve the raw per-evaluator result and reason.

---

## Risk and safety evaluators
<!-- layout: risk-list -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/risk-safety-evaluators -->

- **Hate and unfairness** — Biased or discriminatory language toward social groups.
- **Sexual** — Sexual or explicit content.
- **Violence** — Physical harm, weapons, or incitement.
- **Self-harm** — Content describing or promoting self-harm.
- **Protected material** — Identifiable protected text or code.
- **Indirect attack** — Prompt injection embedded in retrieved context; model-only.
- **Code vulnerability** — Security weaknesses in generated code.
- **Ungrounded attributes** — Unsupported personal traits, emotions, or protected-class inferences.
- **Prohibited actions** — Disallowed agent behavior; preview and agent-only.
- **Sensitive data leakage** — Exposed personal or secret data; preview and agent-only.

Foundry hosts these evaluators, so they do not require `deployment_name`; they do require Foundry project configuration.

> Presenter guidance: **Teaching point:** Do not apply one safety scale to this whole list. The four content-safety evaluators—hate and unfairness, sexual, violence, and self-harm—use a 0–7 severity scale with a documented default passing threshold of 3 or lower. Other evaluators can return direct pass/fail results and have target restrictions. **Boundary:** Prohibited Actions and Sensitive Data Leakage are preview and agent-only; Indirect Attack is model-only. Recheck preview status, region support, and evaluator availability before delivery.

---

## Score scales and thresholds
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/general-purpose-evaluators -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/risk-safety-evaluators -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->

- **Quality and selected RAG metrics** — Often 1–5, where higher is better. Coherence and fluency document a default pass threshold of 3.
- **Four content-safety metrics** — Severity 0–7, where lower is better. The documented default passing threshold is 3 or lower.
- **Agent metrics** — Binary or evaluator-specific scored output. Read the per-evaluator result, threshold, and diagnostics.

Thresholds are application decisions. Define them from the consequence of failure, validate them on representative data, and preserve each evaluator's native scale.

> Presenter guidance: **Teaching point:** The supplied reference deck included example targets such as quality at least 4, safety at most 1, and 90% tool-call pass rate. Those are not documented Microsoft defaults, so they are intentionally removed here. Teams can adopt similar targets only as explicit, validated application policy. **Practice:** Record the evaluator version, judge deployment when applicable, threshold, dataset version, target version, and raw results. Compare like with like; avoid averaging incompatible scales into a misleading universal score.

---

## Custom evaluators
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/custom-evaluators -->

- **Code-based** — Python `grade(sample, item)` returns `0.0–1.0`; use for deterministic rules, formats, keywords, or length checks.
- **Prompt-based** — An LLM judge returns JSON with `result` and `reason`; use ordinal, continuous, or binary scoring for subjective criteria.
- **Endpoint-based** — Call an external scoring endpoint when evaluation needs network access, proprietary logic, or another platform.

Custom evaluators are preview. Add them to the Foundry evaluator catalog and run them with built-ins.

> Presenter guidance: **Teaching point:** A custom evaluator turns the application's own quality contract into repeatable evidence. Code-based evaluators run in a constrained sandbox: code is under 256 KB, each grading call has a two-minute limit, the runtime has no network access, and the documented resources are 2 GB memory, 1 GB disk, and two CPU cores. Exceptions and timeouts are recorded as an error with a `0.0` result. Use an endpoint-based evaluator when network access or a proprietary external dependency is required. **Design:** Make the reason as useful as the score so failures lead to action.

---

## Which evaluators for which app
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/built-in-evaluators -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/ai-red-teaming-agent -->

| Scenario | Workshop starting bundle | Add or adapt when |
|---|---|---|
| RAG app, external users | Groundedness + Relevance + Response Completeness + applicable content-safety evaluators | Add retrieval metrics with labeled ground truth and red teaming before customer exposure |
| Agent with tool use | Task Adherence + Task Completion + Tool Call Accuracy + Tool Selection + applicable safety evaluators | Add Prohibited Actions or Sensitive Data Leakage when the preview evaluator and target are supported |
| Internal assistant | Coherence + Fluency + task-specific evaluator + risk-based safety selection | Expand as audience, data sensitivity, or action authority grows |
| Model endpoint or API | Coherence + task-specific correctness + applicable safety evaluators | Add groundedness only when a real context boundary exists |
| Translation | BLEU + GLEU + METEOR + Fluency | Add terminology, locale, and brand rules through custom evaluation |

This is a workshop starting point, not a Microsoft-prescribed bundle. Verify evaluator inputs, targets, regions, preview status, and risk coverage.

> Presenter guidance: **Teaching point:** Build the bundle from the application architecture and failure modes. A RAG application needs both retrieval and response evidence. A tool-using agent needs both system and process evidence. A public-facing application usually warrants risk-based safety evaluation and pre-production adversarial testing. **Boundary:** Red teaming is complementary to evaluator runs; it generates and explores adversarial attacks rather than simply adding one more score column. Do not run every evaluator by default, and do not claim that a starter bundle establishes safety or compliance.

---

## Evaluation across the delivery lifecycle
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/observability -->
<!-- source: https://learn.microsoft.com/agent-framework/agents/evaluation -->
<!-- source: https://learn.microsoft.com/azure/foundry/how-to/evaluation-github-action -->
<!-- source: https://learn.microsoft.com/azure/foundry/observability/how-to/traces-to-dataset -->

1. **Development** — Run fast local checks and a small reviewed dataset after meaningful prompt, model, tool, or orchestration changes.
2. **Test and staging** — Run the selected suite on a versioned dataset; compare a candidate with its baseline and apply application-owned release policy.
3. **Production** — Sample or schedule quality and safety evaluation, monitor drift, and curate useful traces or incidents back into reusable datasets.

Production findings become tomorrow's regression cases.

> Presenter guidance: **Teaching point:** The lifecycle is a feedback loop, not three disconnected environments. Agent Framework supports local and Foundry-backed evaluators. Foundry's GitHub Action can automate offline pre-production agent evaluation and reports confidence intervals and statistical comparison, but the feature is preview and Microsoft advises against running evaluation on every commit when cost is a concern. In production, continuous evaluation operates on sampled traffic; it does not inspect every interaction. The trace-to-dataset workflow is preview and requires deliberate curation before reuse.

---

## Golden datasets
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets -->
<!-- source: https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-dataset-synthetic -->
<!-- source: https://learn.microsoft.com/azure/foundry/observability/how-to/traces-to-dataset -->

- **Representative and reusable** — Cover real users, task types, domains, languages, edge cases, and important failure modes. Include expected outputs or ground truth only where the evaluator needs them.
- **Reviewed and versioned** — Review synthetic and trace-derived cases, protect sensitive data, track dataset changes with the application, and add useful production failures over time.

Prefer coverage and statistical usefulness over an arbitrary row count. Foundry's synthetic generation workflow documents a minimum batch size of 15; that service minimum is not a quality or sufficiency target.

> Presenter guidance: **Teaching point:** A reusable evaluation dataset lets teams rerun stable cases against prompt, model, or agent versions. Foundry can also evaluate existing responses or traces without first creating a dataset, so "golden dataset" is a useful practice, not a mandatory prerequisite for every evaluation. **Correction from the supplied deck:** The 50/100/500-row progression was a heuristic, not Microsoft guidance. Dataset size should follow scenario coverage, evaluator variance, cost, and the confidence needed for the release decision. Human-review generated and production-derived cases before promoting them into a trusted regression set.

---

## A phased adoption roadmap
<!-- layout: ladder -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/observability -->
<!-- source: https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets -->
<!-- source: https://learn.microsoft.com/azure/foundry/how-to/evaluation-github-action -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/ai-red-teaming-agent -->

1. **Foundation** — Pick one application, name its costly failure modes, choose a small evaluator bundle, and build a reviewed representative seed set.
2. **Automation** — Version the dataset and thresholds, compare baseline with candidate, and automate the agreed pre-production policy at meaningful change points.
3. **Scale** — Add sampled or scheduled production evaluation, curate failures into regression data, and schedule risk-based red teaming.
4. **Maturity** — Standardize evidence metadata, ownership, exception handling, reusable custom evaluators, and governance reporting across the portfolio.

> Presenter guidance: **Teaching point:** Adoption starts with one decision and one application, not an enterprise metric catalog. Each phase adds an operating capability: repeatable evidence, automated comparison, production feedback, and shared governance. The roadmap is workshop guidance rather than a Microsoft maturity model. **Action:** Ask participants to name the first application, the release decision evaluation will inform, and the owner who can accept or reject the resulting evidence.

---

## References
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/built-in-evaluators -->
<!-- source: https://learn.microsoft.com/agent-framework/agents/evaluation -->
<!-- source: https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets -->

| Topic | Official Microsoft source |
|---|---|
| Microsoft Agent Framework evaluation | learn.microsoft.com/agent-framework/agents/evaluation |
| Built-in evaluators reference | learn.microsoft.com/.../built-in-evaluators |
| General purpose evaluators | learn.microsoft.com/.../general-purpose-evaluators |
| RAG evaluators | learn.microsoft.com/.../rag-evaluators |
| Agent evaluators | learn.microsoft.com/.../agent-evaluators |
| Risk and safety evaluators | learn.microsoft.com/.../risk-safety-evaluators |
| Custom evaluators | learn.microsoft.com/.../custom-evaluators |
| Evaluation datasets | learn.microsoft.com/.../evaluation-datasets |

> Presenter guidance: **Outcome:** Leave participants with the official reference set used to ground this module. The product surfaces, evaluator names, outputs, preview status, and support boundaries can change; recheck these pages before delivery and pin any code samples or package versions used in a demonstration or lab. **Close:** Evaluation is useful when a team can connect a failure mode to an evaluator, a representative case, an explicit threshold or review rule, and an accountable release decision.
