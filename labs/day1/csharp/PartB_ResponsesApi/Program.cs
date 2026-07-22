// Day 1 Lab — Part B — Your own code, calling the Responses API (C#)
//
// Build an MAF app that runs in *your* process and calls Foundry's Responses
// API. `AIProjectClient(...).AsAIAgent(...)` is the C# way to write "my code
// calling the Responses API." The runtime is yours (your laptop today, ACA /
// App Service / AKS tomorrow); Foundry serves the model and platform tools.

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

// Your code, running in this process. `AsAIAgent` wires up an MAF agent that
// calls the Responses API on your Foundry project endpoint.
AIAgent agent = new AIProjectClient(new Uri(endpoint), new DefaultAzureCredential())
    .AsAIAgent(model: model,
               name: "DocsAssistant",
               instructions: Instructions);

// --- 1. Non-streaming ---
Console.WriteLine("--- Non-streaming ---");
Console.WriteLine($"Agent: {await agent.RunAsync("In two sentences, what is Microsoft Foundry?")}");
Console.WriteLine();

// --- 2. Streaming ---
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
// 2. This same code could run in Container Apps, App Service, AKS, or Functions.
//    Which host would you pick for a real Publix scenario and why?
// 3. What would you have to add to run this as a Hosted agent (Part C)?
