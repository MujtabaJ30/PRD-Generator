import { OpenAI } from "openai";
import { OPENCODE_API_KEY, BASE_URL, MODEL_NAME, MAX_RETRIES } from "@/lib/config";
import {
  SYSTEM_PROMPT,
  buildInitialPrompt,
  buildRefinePrompt,
  buildRetryPrompt,
} from "@/lib/prompt";
import { validateInput, validateOutput } from "@/lib/validator";
import type { PrdOutput } from "@/lib/validator";

const client = new OpenAI({
  apiKey: OPENCODE_API_KEY,
  baseURL: BASE_URL,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { problemStatement, currentPrd, refineAction } = body;

    if (!problemStatement || typeof problemStatement !== "string") {
      return Response.json(
        { error: "problemStatement is required" },
        { status: 400 }
      );
    }

    validateInput(problemStatement);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: string) =>
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        const json = (obj: Record<string, unknown>) =>
          send(JSON.stringify(obj));

        try {
          let fullResponse = "";
          const hasCurrentPrd =
            currentPrd && typeof currentPrd === "object" && !Array.isArray(currentPrd);

          for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            let userMessage: string;

            if (refineAction && hasCurrentPrd) {
              userMessage = buildRefinePrompt(currentPrd as PrdOutput, refineAction);
            } else if (hasCurrentPrd && attempt === 0) {
              userMessage = buildConversationalPrompt(
                problemStatement,
                currentPrd as PrdOutput
              );
            } else if (hasCurrentPrd && attempt > 0) {
              userMessage = buildRetryPrompt(
                problemStatement,
                currentPrd as PrdOutput
              );
            } else {
              userMessage =
                attempt === 0
                  ? buildInitialPrompt(problemStatement)
                  : buildRetryPrompt(problemStatement);
            }

            fullResponse = "";

            const completion = await client.chat.completions.create({
              model: MODEL_NAME,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userMessage },
              ],
              stream: true,
            });

            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                json({ type: "token", content });
              }
            }

            try {
              const validated = validateOutput(fullResponse);
              json({ type: "done", prd: validated });
              controller.close();
              return;
            } catch {
              if (attempt === MAX_RETRIES) {
                json({
                  type: "error",
                  error:
                    "Failed to generate valid PRD after retries. Try a more specific prompt.",
                });
                controller.close();
                return;
              }
              json({ type: "retry", message: "Regenerating..." });
            }
          }
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Unknown error";

          if (message.includes("429") || message.includes("rate")) {
            json({
              type: "error",
              error: "Rate limit reached. Please wait a moment and try again.",
            });
          } else {
            json({ type: "error", error: message });
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

function buildConversationalPrompt(
  problemStatement: string,
  currentPrd: PrdOutput
): string {
  return `Original problem statement: ${problemStatement}

Current PRD (JSON):
${JSON.stringify(currentPrd, null, 2)}

Improve this PRD. Keep all 7 sections and the same JSON structure. Make it more specific, quantitative, and actionable. Return ONLY the updated JSON object.`;
}
