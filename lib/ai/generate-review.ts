import { CafeReviewResultSchema, type CafeReviewResult, validatePhotoPlan } from "@/lib/ai/schema";
import { getOpenAIClient } from "@/lib/ai/client";
import { buildUserPrompt, SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { getEnv } from "@/lib/env";
import type { GenerateReviewInput } from "@/lib/validation";

function parseJsonContent(content: string): unknown {
  const trimmed = content.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(withoutFence);
  } catch {
    const start = withoutFence.indexOf("{");
    const end = withoutFence.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("AI 응답에서 JSON 객체를 찾지 못했어요.");
    return JSON.parse(withoutFence.slice(start, end + 1));
  }
}

export async function generateCafeReview(
  input: GenerateReviewInput,
  _legacyImages?: unknown[]
): Promise<CafeReviewResult> {
  const env = getEnv();
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) }
    ],
    temperature: 0.5
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("AI 응답이 비어 있어요.");

  const parsed = CafeReviewResultSchema.parse(parseJsonContent(content));
  validatePhotoPlan(parsed);
  return parsed;
}
