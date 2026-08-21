# Module 1 · Demo 1 — Attach an IQ knowledge source, portal-first

**Placement:** After **slide 4 — "Three building blocks"** (Module 1).

**Time:** ~4 min total (30s setup narration + 3 min click-through + 30s payoff)

**Language:** Portal only. No code.

## What it shows

The three IQ objects — **knowledge source**, **knowledge base**, and the
**agent that consumes it** — are already familiar as abstract terms after the
prior slide. This demo makes each one clickable in the portal. The audience
sees the object graph they'll be creating programmatically in the lab, so the
SDK call feels like a shortcut for something they've now seen with their own
eyes.

## Setup checklist

Do this **before the module starts**:

- Your Foundry project is open at `https://ai.azure.com` in a browser tab.
- A **fresh browser profile** or Incognito window is fine to avoid stale
  navigation.
- A knowledge source named `contoso-docs` **does not yet exist** in the
  project. If you're demoing from your Day 2 lab environment, temporarily
  rename or delete it beforehand so you can create it live.
- Have the `labs/day2/python/data/docs/` folder open in Finder / Explorer so
  you can drop the files into the portal in step 2.
- Have your screen resolution at 1920×1080 or higher — the portal side panels
  crowd on smaller displays.

## Narration + steps

**Opening (30s):**
"On the prior slide we said IQ has three building blocks. I want to show you
what each one looks like in the portal before we look at the SDK, because the
SDK is just a shorter way to click the same buttons."

**Step 1 — Create the knowledge source (~60s)**

1. In the portal: **Knowledge** → **+ Create a knowledge base**.
2. Name it `contoso-docs`.
3. In the **Description** field, paste:
   > *"General Contoso developer API product documentation. Does NOT contain account-specific state (orders, tickets, entitlements)."*
4. **Add sources** → **+ Azure Blob Storage**.
5. Name **contoso-kb-docs-blob**  → **jimwelchdemokb**  → **contoso-docs** → **system assigned identity** → **text-embedding-3-small**
6. Leave Chat completions model blank (use to extact images, content) 
7. Click **Create**.

**Say:** *"Notice the description. This is a real field, and it matters —
the model uses it later to decide when to reach for this knowledge source
vs. the two other ones you might have attached. It's a prompt, not
metadata."*

**Step 2 — Wait for indexing (~30s of talking while it processes)**

The portal shows a progress indicator. While it processes:

*"This step is doing three things: chunking each file, embedding the chunks,
and writing them to the vector store. Two years ago that was a AI Search Index pipeline
you wired up. Today the knowledge source object owns all
three, and that's what makes IQ 'hosted' — you're delegating the pipeline creation."*

**Step 3 — Create the knowledge base and attach the source (~45s)**

1. Under **Knowledge**, open the **Knowledge bases** tab.
2. Click **+ New knowledge base**, name it `contoso-docs-kb`.
3. In the **Sources** step, select the `contoso-docs` source you just made.
4. **Retrieval effort:** leave at `medium`.
5. **Create**.

**Say:** *"The knowledge base is the reasoning-and-planning layer on top of
one or more sources. It's what the agent sees. Retrieval effort is
'medium' by default — we'll come back to that on the next slide."*

**Step 4 — Attach to an agent (~30s)**

1. Open **Agents** → your existing `docs-assistant` Prompt agent.
2. Click **+ Add knowledge** → select `contoso-docs-kb`.
3. **Save**.

**Say:** *"That's the third building block. Same agent from Day 1, now with
IQ attached. Zero code."*

**Step 5 — Ask it a question (~45s)**

1. Click **Test in playground**.
2. Ask: *"How do I generate an API key?"*
3. Wait for the response — it should cite the `authentication.md` doc.

**Say:** *"Notice the citation. IQ adds this automatically. On the next slide
we'll see what the ranking pipeline did to get here."*

## Expected result

- `contoso-docs` knowledge source appears in the portal with 10 uploaded docs
- `contoso-docs-kb` knowledge base appears with the source attached
- `docs-assistant` agent has the knowledge base attached
- Playground answers the API-key question with a citation to `authentication.md`

## Fallback story if it breaks live

**Most likely failure:** ingestion is slow (>2 min) and the demo drags.

Have this ready:
1. A **screenshot** of the created `contoso-docs` source with 10 docs
2. A **screenshot** of the knowledge base with the source attached
3. A **screenshot** of the playground answer with the citation visible

Story to tell: *"IQ ingestion runs asynchronously; the portal shows the
staged rollout in real time. In a live workshop with 20 attendees hitting
the same region this can queue up. Here's what it looks like when it's
done — this is what your lab will produce."*

Then advance the slide.

## Teaching payoff

*"IQ is three objects — a source, a base, and the agent that consumes them.
Now you've seen them in the portal. In the lab, we'll do the same three
things from code."*
