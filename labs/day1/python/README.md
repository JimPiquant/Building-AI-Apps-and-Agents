# Day 1 lab — Python

## Setup

```bash
cd labs/day1/python
python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Then confirm `../.env` is filled in (see [`../README.md`](../README.md)).

## Run

```bash
python part_a_client_side_agent.py
python part_b_foundry_prompt_agent.py   # requires Part B portal setup
python part_c_foundry_hosted_agent.py   # bonus; requires Part C portal setup
```
