# Module 8 · Demo 1 — Whole lab in 90 seconds

**Placement:** After the *three parts* slide (Module 8 · slide 3).

**Time:** ~2 min total (15s framing + 90s speedrun + 15s call to action)

**Language:** Pre-recorded video — this is a screencap, not a live demo.

## What it shows

Module 8 is the lab kickoff. Attendees are about to walk into a two-hour
lab. Some of them have never used IQ, some have never authored a function
tool, most have never run an eval. The one thing that reduces "am I on
the right track?" anxiety is **seeing the finish line before you start**.

This demo is a 90-second speedrun screencap:

- 30s: Part A grounded agent answering with citations, then `retrieval_eval.py`
  showing green Retrieval and Groundedness scores
- 30s: Part B `tools.py` filled in, isolation tests all green, tool-use
  golden set 6/6 green
- 30s: Part C combined agent handling all three test queries, trace showing
  the right composition order for each

Every phase ends with a **green check** or a **passing test count**.
Attendees see what "done" looks like across the whole lab in one visual.

## Setup checklist

Do this **before the module starts** (this is a screencap, not live):

- **Record the screencap once**, in advance. About 15 minutes of recording +
  editing for a 90-second polished clip. Do it on the presenter machine
  with the presenter's Foundry project, so any visible endpoint/project
  names look like what attendees will actually see.
- **Save the file** as `demos/day2/recordings/module-8-demo-1-lab-speedrun.mp4`.
  Recordings folder is git-ignored — do not commit large video files.
- **Load the video into the deck** as an embedded media slot in Module 8,
  or open it in a lightweight player (QuickTime / VLC / Loom) in a tab.
- Set player controls to loop or show scrub bar OFF so it just plays.
- Audio: **no audio track**. The presenter narrates over it live.

### Recording script (for the dry-run capture)

Structure the recording so the 30-second beats are visually distinct:

**Segment A · Part A · Grounded agent + eval (30s)**
1. Terminal: `uv run python part_a_grounded_agent.py` — playback speeds
   through the console output so questions and answers flash by
2. Console shows citations
3. Cut to: `EVALUATION_MODEL=... uv run python evals/retrieval_eval.py`
4. Console shows both scores above threshold
5. **Green check** overlay for 2 seconds

**Segment B · Part B · Tools + tool-use eval (30s)**
1. Editor: `tools.py` scrolls through the filled-in `create_ticket` and
   `lookup_status` implementations
2. Terminal: `uv run pytest tests/test_tools.py -v`
3. Console shows 5 passed
4. Editor: `evals/tools_golden_set.jsonl` scrolls through the 6 rows
5. Terminal: `uv run pytest tests/test_golden_set.py -v`
6. Console shows 6 passed
7. **Green check** overlay for 2 seconds

**Segment C · Part C · Combined agent + trace (30s)**
1. Editor: `part_c_combined.py` shows the four-line instructions
2. Terminal: `uv run python part_c_combined.py`
3. Console shows all three driver query responses
4. Cut to: Foundry trace viewer showing three tabs, one per query
5. Trace for retrieve_then_act: retrieval before create_ticket
6. Trace for act_then_retrieve: lookup_status before retrieval
7. Trace for docs_only: no tool calls
8. **Green check** overlay for 2 seconds

Total: 90 seconds.

## Narration + steps

**Framing (15s):**
"Before we start the lab, I want to show you what you're building. This is
a 90-second speedrun of the finished lab from my machine. Watch for the
green checks — three of them, one per part."

**Play the recording (~90s), narrating over it:**

- **At Segment A start** *(0:00-0:30)*: "Part A — you'll attach IQ and run
  the retrieval eval. When both scores are above threshold, you move on."
- **At Segment B start** *(0:30-1:00)*: "Part B — you'll author the two
  function tools, run the isolation tests, then run the tool-use golden set.
  6 out of 6 tools picked correctly and you move on."
- **At Segment C start** *(1:00-1:30)*: "Part C — combined agent, three
  queries, three expected trace shapes. Right composition order for all
  three and you're done."

**Call to action (15s):**
"Every green check is a definition of done from the lab README. If you get
stuck on one of them, don't push past it — flag it and we'll pair. Now —
setup instructions on the next slide."

## Expected result

- Attendees see all three parts of the lab as a coherent sequence
- Each part visually resolves with a clear success signal (green checks / passing counts)
- Attendees leave Module 8 knowing what "success" looks like for the lab

## Fallback story if it breaks live

**Most likely failures:**
- The video won't play (codec issue, embedded media failure)
- Presenter machine is muted/unmuted inconsistently

Fallback: skip the video, walk through the three-part table on the
current slide verbatim, and say: *"I had a screencap of the finished lab
but it's not cooperating. The important thing is: three parts, three
definitions of done, each explicit in the README you're about to open.
Green Retrieval and Groundedness. 6/6 tool selections. 3 correct trace
orders. Those are the finish lines."*

Then advance the slide.

## Teaching payoff

*"You've seen the finish line. Now let's build."*

That's the closing beat before the lab. Keep it short — Module 8 is 20
minutes total and lab time is the important thing.
