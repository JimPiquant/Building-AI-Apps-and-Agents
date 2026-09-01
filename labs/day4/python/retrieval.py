"""
Day 4 Lab — document retrieval over the bundled corpus.

PROVIDED COMPLETE. You should not need to change this file, and nothing in
the lab asks you to. Read it once so you know what the Retriever can and
cannot do, then move on.

Deliberately simple: scoring is token overlap with a small boost for title
and heading matches. No embeddings, no vector store, no network call, no
extra dependency.

That is a design decision, not a shortcut. Day 4's subject is orchestration
-- how the Planner, Retriever, and Critic are wired together and who decides
what happens next. Retrieval quality is Day 2's subject. Keeping retrieval
deterministic and local means that when a golden-set case fails, the cause is
in your graph, not in a similarity threshold you did not choose. It also
means every run is reproducible: the same query returns the same documents
every time, so an evaluation delta between Part A and Part B comes from the
orchestration change and nothing else.

The one consequence worth knowing: this retriever rewards a well-formed,
specific query. A vague query returns weak results. That is exactly the
pressure the Planner is supposed to relieve by decomposing a question before
the Retriever ever runs -- and it is why a bad plan shows up as a bad answer.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Annotated

from agent_framework import tool
from pydantic import Field

DOCS_DIR = Path(__file__).resolve().parent / "data" / "docs"

# Words too common in this corpus to carry signal.
_STOPWORDS = frozenset("""
a an and are as at be by for from has have how if in into is it its of on or
that the their then there these this to was what when where which who will
with your you our we can do does
""".split())

_TOKEN = re.compile(r"[a-z0-9][a-z0-9._-]*")


def _tokenize(text: str) -> list[str]:
    return [t for t in _TOKEN.findall(text.lower()) if t not in _STOPWORDS]


@dataclass(frozen=True)
class Document:
    name: str
    title: str
    text: str

    @property
    def headings(self) -> str:
        return " ".join(
            line.lstrip("# ").strip()
            for line in self.text.splitlines()
            if line.startswith("#")
        )


def load_corpus() -> list[Document]:
    """Read every markdown file in data/docs/ into memory."""
    docs: list[Document] = []
    for path in sorted(DOCS_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        first_line = text.splitlines()[0] if text.splitlines() else path.stem
        docs.append(
            Document(
                name=path.name,
                title=first_line.lstrip("# ").strip(),
                text=text,
            )
        )
    return docs


_CORPUS: list[Document] | None = None


def _corpus() -> list[Document]:
    global _CORPUS
    if _CORPUS is None:
        _CORPUS = load_corpus()
    return _CORPUS


def _score(query_tokens: list[str], doc: Document) -> float:
    """Token overlap, weighting title and headings above body text."""
    body = set(_tokenize(doc.text))
    title = set(_tokenize(doc.title))
    heads = set(_tokenize(doc.headings))

    score = 0.0
    for token in set(query_tokens):
        if token in title:
            score += 3.0
        elif token in heads:
            score += 2.0
        elif token in body:
            score += 1.0
    return score


def search(query: str, limit: int = 3) -> list[tuple[Document, float]]:
    """Rank corpus documents against a query. Used directly by tests."""
    tokens = _tokenize(query)
    scored = [(doc, _score(tokens, doc)) for doc in _corpus()]
    scored = [(doc, s) for doc, s in scored if s > 0]
    scored.sort(key=lambda pair: (-pair[1], pair[0].name))
    return scored[:limit]


@tool
def search_docs(
    query: Annotated[
        str,
        Field(
            description=(
                "A specific, keyword-rich search phrase. Prefer the platform's "
                "own vocabulary, for example 'change freeze deployment approval' "
                "rather than 'can we ship in December'."
            )
        ),
    ],
) -> str:
    """Search the Contoso Cloud Platform documentation and return matching excerpts.

    Returns the full text of up to three matching documents, each preceded by
    its filename. Cite documents by filename. If nothing matches, returns a
    line saying so -- treat that as evidence the corpus does not cover the
    question, not as a reason to guess.
    """
    hits = search(query, limit=3)
    if not hits:
        return (
            "NO_MATCH: no document in the corpus matched that query. "
            "Either rephrase using platform vocabulary, or conclude that the "
            "corpus does not cover this topic."
        )

    parts: list[str] = []
    for doc, score in hits:
        parts.append(f"--- SOURCE: {doc.name} (relevance {score:.0f}) ---\n{doc.text}")
    return "\n\n".join(parts)


if __name__ == "__main__":
    # Sanity check: `uv run retrieval.py` prints what the corpus contains and
    # how a couple of representative queries rank. No model call, no network.
    corpus = _corpus()
    print(f"Corpus: {len(corpus)} documents in {DOCS_DIR}\n")
    for doc in corpus:
        print(f"  {doc.name:<24} {doc.title}")

    print("\nSample rankings:\n")
    for query in (
        "Standard tier requests per minute rate limit",
        "change freeze deployment approval",
        "quantum throughput Antarctic region",
    ):
        hits = search(query)
        rendered = ", ".join(f"{d.name} ({s:.0f})" for d, s in hits) or "NO_MATCH"
        print(f"  {query!r}\n    -> {rendered}\n")
