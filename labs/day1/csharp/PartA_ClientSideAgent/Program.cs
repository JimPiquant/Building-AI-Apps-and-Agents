// Day 1 Lab — Part A — Client-side agent (C#)
//
// Build an MAF client-side agent using AIProjectClient.AsAIAgent(...) against a
// Foundry-deployed model. Run non-streaming and streaming.
//
// Vocabulary reminder:
//   "Client-side agent" = you construct the agent in code (this file).
//   The thread and any state live in this process.

using Azure.AI.Projects;
using Azure.Identity;
using Microsoft.Agents.AI;

var endpoint = Environment.GetEnvironmentVariable("FOUNDRY_PROJECT_ENDPOINT")
    ?? throw new InvalidOperationException(
        "FOUNDRY_PROJECT_ENDPOINT is not set. Populate labs/day1/.env and export or source it before running.");
var model = Environment.GetEnvironmentVariable("FOUNDRY_MODEL")
    ?? throw new InvalidOperationException("FOUNDRY_MODEL is not set.");

const string Instructions = """
    ## Role
    You are a technical documentation assistant helping developers get started
    with Microsoft Foundry and the Microsoft Agent Framework (MAF).

    ## Rules
    - Prefer short, concrete answers. Cite documentation when you can.
    - If you don't know, say so plainly instead of guessing.
    - Keep code snippets minimal and directly relevant.
    """;

// Client-side agent: constructed in-process. Thread state lives in this process.
AIAgent agent = new AIProjectClient(new Uri(endpoint), new DefaultAzureCredential())
    .AsAIAgent(model: model,
               name: "DocsAssistant",
               instructions: Instructions);

// --- 1. Non-streaming run ---
Console.WriteLine("--- Non-streaming ---");
Console.WriteLine($"Agent: {await agent.RunAsync("In two sentences, what is Microsoft Foundry?")}");
Console.WriteLine();

// --- 2. Streaming run ---
Console.WriteLine("--- Streaming ---");
Console.Write("Agent: ");
await foreach (var update in agent.RunStreamingAsync(
    "Give me one interesting fact about the Microsoft Agent Framework."))
{
    Console.Write(update);
}
Console.WriteLine();
Console.WriteLine();

// --- 3. Multi-turn ---
Console.WriteLine("--- Multi-turn ---");
Console.WriteLine($"Agent (turn 1): {await agent.RunAsync(
    "I am building a small internal docs assistant. Suggest 3 features.")}");
Console.WriteLine();
Console.WriteLine($"Agent (turn 2): {await agent.RunAsync(
    "Of those, which should I build first and why?")}");
Console.WriteLine();

// ----- Reflection prompts (save the transcript above; cite it in reflection.md) -----
// 1. Where did the thread state live during the multi-turn run?
// 2. What would you have to change to persist the conversation across processes?
// 3. If two apps needed to talk to the "same" agent, what would you need to add?
