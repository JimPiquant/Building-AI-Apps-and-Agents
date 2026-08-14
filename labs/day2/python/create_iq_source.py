"""
Day 2 Lab — Part A helper: create the Foundry IQ knowledge base.

Creates an Azure AI Search index, uploads the mock docs corpus, and creates the
Foundry IQ knowledge source and knowledge base used by part_a_grounded_agent.py.

Run whenever the corpus changes. All operations are idempotent.

Usage:
    cd labs/day2/python
    uv run python create_iq_source.py

Reference: Module 1 (Foundry IQ Deep Dive) slides + Learn:
    https://learn.microsoft.com/en-us/azure/foundry/concepts/agent-knowledge
"""
import os
from pathlib import Path

from dotenv import load_dotenv

from azure.identity import AzureCliCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    AzureOpenAIVectorizerParameters,
    KnowledgeBase,
    KnowledgeBaseAzureOpenAIModel,
    KnowledgeSourceReference,
    SearchableField,
    SearchFieldDataType,
    SearchIndex,
    SearchIndexKnowledgeSource,
    SearchIndexKnowledgeSourceParameters,
    SemanticConfiguration,
    SemanticField,
    SemanticPrioritizedFields,
    SemanticSearch,
    SimpleField,
)
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

DOCS_DIR = Path(__file__).resolve().parent / "data" / "docs"


def main() -> None:
    search_endpoint = os.environ["AZURE_SEARCH_ENDPOINT"].rstrip("/")
    openai_endpoint = os.environ["AZURE_OPENAI_ENDPOINT"].rstrip("/").removesuffix("/openai")
    model_deployment = os.environ.get("FOUNDRY_MODEL", "gpt-5.4-mini")
    model_name = os.environ.get("FOUNDRY_IQ_MODEL_NAME", model_deployment)
    knowledge_base_name = os.environ.get("FOUNDRY_IQ_KNOWLEDGE_NAME", "contoso-docs")
    index_name = f"{knowledge_base_name}-index"
    source_name = f"{knowledge_base_name}-source"

    doc_paths = sorted(DOCS_DIR.glob("*.md"))
    if not doc_paths:
        raise SystemExit(f"No docs found in {DOCS_DIR}")

    index = SearchIndex(
        name=index_name,
        description="General Contoso developer API product documentation.",
        fields=[
            SimpleField(name="id", type="Edm.String", key=True, filterable=True),
            SearchableField(name="title", type=SearchFieldDataType.String, retrievable=True),
            SearchableField(name="content", type=SearchFieldDataType.String, retrievable=True),
            SimpleField(name="source_uri", type="Edm.String", retrievable=True),
        ],
        semantic_search=SemanticSearch(
            default_configuration_name="contoso-semantic",
            configurations=[
                SemanticConfiguration(
                    name="contoso-semantic",
                    prioritized_fields=SemanticPrioritizedFields(
                        title_field=SemanticField(field_name="title"),
                        content_fields=[SemanticField(field_name="content")],
                    ),
                )
            ],
        ),
    )

    documents = [
        {
            "id": path.stem,
            "title": path.stem.replace("-", " ").title(),
            "content": path.read_text(),
            "source_uri": path.name,
        }
        for path in doc_paths
    ]

    with AzureCliCredential() as credential:
        with SearchIndexClient(search_endpoint, credential) as index_client:
            index_client.create_or_update_index(index)

            with SearchClient(search_endpoint, index_name, credential) as search_client:
                results = search_client.merge_or_upload_documents(documents)
                failed = [result.key for result in results if not result.succeeded]
                if failed:
                    raise RuntimeError(f"Failed to upload documents: {', '.join(failed)}")

            source = SearchIndexKnowledgeSource(
                name=source_name,
                description=(
                    "General Contoso developer API product documentation. "
                    "Does not contain account-specific state."
                ),
                search_index_parameters=SearchIndexKnowledgeSourceParameters(
                    search_index_name=index_name,
                    semantic_configuration_name="contoso-semantic",
                ),
            )
            index_client.create_or_update_knowledge_source(source)

            model = KnowledgeBaseAzureOpenAIModel(
                azure_open_ai_parameters=AzureOpenAIVectorizerParameters(
                    resource_url=openai_endpoint,
                    deployment_name=model_deployment,
                    model_name=model_name,
                )
            )
            knowledge_base = KnowledgeBase(
                name=knowledge_base_name,
                description="Contoso developer API product documentation.",
                knowledge_sources=[KnowledgeSourceReference(name=source_name)],
                models=[model],
            )
            index_client.create_or_update_knowledge_base(knowledge_base)

    print(f"Knowledge base ready: {knowledge_base_name}")
    print(f"  index:  {index_name} ({len(documents)} documents)")
    print(f"  source: {source_name}")


if __name__ == "__main__":
    main()
