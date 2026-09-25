// app/api/brain/route.ts
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import agents from "@/data/agents.json";

export const maxDuration = 30;
export const runtime = "nodejs";

const TOOL_BLURB_LIMIT = 60;

function systemPrompt(): string {
  const toolLines = agents
    .slice(0, TOOL_BLURB_LIMIT)
    .map(
      (agent) =>
        `- ${agent.name} | ${agent.category} | ${agent.pricing}${
          agent.featured ? " | featured" : ""
        } — ${agent.tagline} Best for: ${agent.bestFor}`
    )
    .join("\n");

  return `You are AI Brain, the built-in tool-recommendation assistant for AI Universe, a directory of AI tools and applications.

Use the curated catalog below to recommend tools that genuinely match what the user asks for. Prefer featured and highest-rated tools, but do not over-recommend: pick the 1-3 best fits, and briefly say why each fits. If nothing fits, say so honestly and suggest the closest alternatives.

Catalog (${
    agents.length
  } tools, showing the first ${TOOL_BLURB_LIMIT}):
${toolLines}`;
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt(),
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}