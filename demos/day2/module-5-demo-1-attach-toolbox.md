# Module 5 · Demo 1 — Attach a hosted toolbox in 30 seconds

**Placement:** After the *"why hosted tools"* slide (Module 5 · slide 4).

**Time:** ~3 min total (30s setup narration + 90s attach + 60s payoff)

**Language:** Foundry portal + one CLI command. No new Python code.

## What it shows

Module 5 has just argued that a hosted Foundry Toolbox eliminates the "author,
package, deploy, secure, patch" ceremony that comes with function tools. This
demo makes the argument concrete: pick a pre-published toolbox, attach it,
and use it — start to finish in under a minute of clicks.

The audience sees the **"managed" claim** cash out. It's not a slide anymore.

## Setup checklist

Do this **before the module starts**:

- A **pre-published Foundry Toolbox** exists in your project or a shared
  gallery. Options:
  - The [`FoundryToolboxSamples`](https://github.com/microsoft-foundry/foundry-samples/tree/main/foundry_toolbox) `web_search` or `time` toolbox — both are safe, deterministic, and read-only.
  - A previously-authored internal toolbox from your Foundry project.
  Pick one you've verified works today.
- The **`docs-assistant` agent** (or a copy of it) is ready — you'll attach
  the toolbox to this agent.
- The portal is open at **Agents → docs-assistant → Tools** in one tab.
- A terminal is open at your Foundry project, with `az login` completed and
  the right subscription selected.
- Playground is bookmarked in a second tab so you can test right after.

Pre-baked screenshot: a completed attach-and-test screenshot from your dry
run, in case the portal is sluggish.

## Narration + steps

**Opening (30s):**
"The prior slide argued that a hosted toolbox is a shortcut. I want to
prove it. I'll attach a toolbox to my `docs-assistant` and use it — in
this module — with a stopwatch running."

**Optional prop:** actually start a stopwatch. Some presenters like this;
others find it corny. Use your judgment.

**Step 1 — Attach the toolbox (~30s)**

In the portal (Agents → docs-assistant → Tools):
1. Click **+ Add tool**.
2. Choose **Toolbox** in the type picker.
3. Pick `web_search` (or your chosen toolbox) from the dropdown.
4. Click **Add**, then **Save**.

**Say:** *"That's it. I picked a toolbox from the gallery, clicked add,
saved. My agent now has the toolbox attached."*

**Step 2 — Test it in the playground (~45s)**

1. Click **Test in playground**.
2. Ask a question the toolbox will handle. For `web_search`:
   > *"What's the latest release version of the Microsoft Agent Framework?"*
   For `time`:
   > *"What time is it in Tokyo right now?"*

Wait for the response. Both toolboxes surface their calls in the response
as tool-use blocks.

**Say:** *"Under the hood, three things just happened — none of which I
wrote. The model saw the tool schema and decided to call it. Foundry
executed the tool in a managed process I don't own. And the result flowed
back to the model as a tool-result message. Same function-calling loop
you saw in Module 4, but I didn't author, package, host, or authenticate
anything."*

**Step 3 — Show that "attach" wasn't just a portal illusion (~30s)**

In the terminal:

```bash
az cognitiveservices account agent tool list \
    --resource-group $YOUR_RG \
    --account-name $YOUR_FOUNDRY \
    --agent-name docs-assistant
```

You should see the attached toolbox in the list.

**Say:** *"Same object, from the CLI. This isn't portal magic — it's a
real reference in your project. IaC-friendly. You could commit this
attach step to Bicep or Terraform."*

## Expected result

- Toolbox appears in the agent's Tools list, both in the portal and via CLI
- Playground question that would normally need external info gets a
  correct answer with a tool-use citation
- Total elapsed clock: under 90 seconds for the attach + test

## Fallback story if it breaks live

**Most likely failures:**
- The gallery toolbox isn't available in your region.
- The `web_search` toolbox rate-limits during a dry run right before class.
- The playground response takes 15+ seconds and drags the demo pace.

Have these ready:
1. A **screenshot** of the toolbox appearing in the agent's tools panel.
2. A **screenshot** of a completed playground answer showing the tool call.
3. A **saved az CLI output** showing the toolbox in the list.

Story: *"The gallery mix rotates by region and preview state. Here's what
it looks like in a working setup — same three clicks, same one-line CLI.
This is the shape of the win."*

Then advance the slide.

## Teaching payoff

*"'Managed' isn't a slide-deck claim. It's three clicks and one CLI
verify. When you finish Day 2 and go home to write a real agent, this is
your first stop before writing a function tool from scratch — check the
toolbox catalog. Author your own only when nothing in the catalog fits."*
