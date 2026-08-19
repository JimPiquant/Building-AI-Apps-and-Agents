# Module 2 · Demo 1 — Create a Foundry project, live

**Placement:** After **slide 3 — "Foundry resource architecture"** (Module 2).

**Time:** ~5 min total (30s framing + 3 min live create + 90s portal walkthrough)

**Language:** Portal + `az` CLI mixed. The point is to show *both paths* so
attendees know what their pre-work looks like.

## What it shows

Slide 3 diagrammed the Foundry resource architecture — a `Microsoft.CognitiveServices/accounts`
resource with `kind = AIServices`, a project sub-resource, and connected
resources. This demo goes to the portal, clicks through the quickstart
in ~2 minutes, and lands with a real Foundry project + Application
Insights connection + a `gpt-5.6-luna` deployment.

**Why this demo matters:** attendees who did the pre-workshop-prep will
have already done this. Attendees who haven't — probably a chunk of the
cohort — will now watch the presenter do it in real time and realize
it's a 5-minute click-through, not a day of Azure ceremony. Their fear
of "Azure setup" evaporates before the lab.

## Setup checklist

Do this **before the module starts**:

- **A fresh subscription** or resource group ready. Do **not** use the
  project the labs will use — this demo creates a *second* project that
  attendees can watch appear.
- **`az login`** completed on the presenter machine, correct
  subscription selected
- **Foundry portal** open in a browser at `https://ai.azure.com`
- **A memorable name** decided for the demo project (e.g.
  `docsassistant-demo-{date}`) — visible on-screen throughout
- **A dedicated tab** at Learn's quickstart open as a reference:
  [Quickstart: Create Foundry resources with the Azure CLI](https://learn.microsoft.com/en-us/azure/foundry/tutorials/quickstart-create-foundry-resources?tabs=azurecli)
- **`gpt-5.6-luna` quota confirmed** in your demo region — if quota is
  low, the deployment step will fail live. Pre-check with
  `az cognitiveservices usage list -l <region> -o table` if you're
  unsure.
- **Dry-run at least once** to confirm the App Insights checkbox path
  still works (portal UI drifts)

## Narration + steps

**Opening (30s):**
"That slide describes what Foundry resources look like. Let me create
one live so you can see how much ceremony this actually is. Two
minutes, portal path — the same one the pre-work links to."

### Path 1 · Portal quickstart (~2.5 min)

1. Portal → `https://ai.azure.com` → **+ New project**
2. Give it the demo name; leave region on your quota-confirmed region
3. **Enable the "Application Insights" checkbox** (it's usually
   checked by default; call it out explicitly): *"This is the checkbox
   that gives you tracing on Day 1. Leave it on. It's what the
   pre-workshop-prep doc mentions."*
4. Review + create. Watch the deployment progress panel.
5. When the project appears, click into it → **Deployments** → **+ Deploy
   model** → pick **`gpt-5.6-luna`** → give the deployment name
   `gpt-5.6-luna` (matches the workshop env vars) → Deploy.

**Say (while things provision, ~30s):** *"Behind the scenes, Azure is
creating a `Microsoft.CognitiveServices/accounts` resource with kind
`AIServices`, then a project sub-resource, then linking Application
Insights. Exactly what the previous slide described. Same object model,
same ARM types."*

### Path 2 · What the CLI equivalent looks like (~90s)

Do not run this live — just show it and explain. Attendees who prefer
IaC will follow this in the lab.

Open a terminal tab and show:

```bash
# From the Learn quickstart — same object model, different tool
az group create --name docsassistant-demo-rg --location eastus

az cognitiveservices account create \
    --name docsassistant-foundry \
    --resource-group docsassistant-demo-rg \
    --kind AIServices \
    --sku S0 \
    --location eastus \
    --assign-identity

# Then create the project sub-resource (see quickstart for full body)
# Then connect Application Insights
# Then deploy the model
```

**Say:** *"Same object model. Portal is fine for exploration; the CLI is
what you'd use in a production script. The lab README links to the
Learn quickstart for both paths."*

### Portal walkthrough (~30s)

Click into the new project. Point at four things briefly:
- **Overview** → the project endpoint URL (same shape as the labs' `.env`)
- **Deployments** → the `gpt-5.6-luna` deployment you just created
- **Connected resources** → Application Insights is linked
- **Agents** → empty for now; attendees will fill it in Part A of the lab

## Expected result

- A new Foundry project appears in the portal with a `gpt-5.6-luna`
  deployment and Application Insights connected
- Attendees see the project endpoint URL, deployment name, and
  connected resources — exactly the values the lab `.env` needs
- Total elapsed clock: under 5 minutes from portal → done

## Fallback story if it breaks live

**Most likely failures:**
- Quota rejection on model deployment (region low on capacity)
- Portal slow-load on the review step (>30s spinner)
- Application Insights checkbox is missing (portal UI drift)

Have these ready:
1. **A pre-created "backup" Foundry project** you can walk instead
2. **Screenshots** of each step in the successful path

Story: *"Live Azure provisioning depends on regional capacity — here's
what a completed project looks like. Same shape every time. The
pre-workshop-prep doc walks you through the exact clicks."*

Then advance the slide.

## Teaching payoff

*"That's the Azure setup for the workshop. Five minutes, one project,
one deployment, App Insights connected. When you sit down for Part A of
the lab, this is what you're doing — but with your own subscription."*

## Post-demo cleanup

At the end of the day (or after the workshop), delete the demo project
so it doesn't accrue idle model-deployment charges:

```bash
az group delete --name docsassistant-demo-rg --yes --no-wait
```
