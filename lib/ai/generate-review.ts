import { zodResponseFormat } from "openai/helpers/zod";
import { CafeReviewResultSchema, type CafeReviewResult, validatePhotoPlan } from "@/lib/ai/schema";
import { getOpenAIClient } from "@/lib/ai/client";
import { buildUserPrompt, SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { getEnv } from "@/lib/env";
import type { GenerateReviewInput } from "@/lib/validation";

type ImageInput = {
  file: File;
  sourceIndex: number;
};

async function fileToDataUrl(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function generateCafeReview(input: GenerateReviewInput, images: ImageInput[]) {
  const env = getEnv();
  const openai = getOpenAIClient();
  const imageParts = await Promise.all(
    images.map(async (image) => ({
      type: "input_image" as const,
      image_url: await fileToDataUrl(image.file),
      detail: "low" as const
    }))
  );

  const response = await openai.responses.parse({
    model: env.OPENAI_MODEL,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [{ type: "input_text", text: buildUserPrompt(input) }, ...imageParts]
      }
    ],
    text: {
      format: zodResponseFormat(CafeReviewResultSchema, "cafe_review_result") as unknown as {
        type: "json_schema";
        name: string;
        schema: Record<string, unknown>;
        strict?: boolean;
      }
    }
  });

  const parsed = response.output_parsed as CafeReviewResult | null;
  if (!parsed) throw new Error("AI 응답을 해석하지 못했어요.");
  validatePhotoPlan(parsed, input.photoCount);
  return parsed;
}
