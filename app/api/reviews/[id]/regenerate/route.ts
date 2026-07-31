import { NextResponse, type NextRequest } from "next/server";
import { generateCafeReview } from "@/lib/ai/generate-review";
import { CafeReviewResultSchema, validatePhotoPlan } from "@/lib/ai/schema";
import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { jsonError, requireAuth, serializeReview, verifyOrigin } from "@/lib/http";
import { cafeReviewFormSchema, normalizeTags } from "@/lib/validation";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyOrigin(request)) return jsonError("BAD_ORIGIN", "허용되지 않은 요청이에요.", 403);
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const current = await prisma.review.findUnique({ where: { id } });
  if (!current) return jsonError("NOT_FOUND", "존재하지 않는 리뷰예요.", 404);

  const parsed = cafeReviewFormSchema.safeParse({
    cafeType: current.cafeType,
    basic: current.basic,
    access: current.access,
    exterior: current.exterior,
    space: current.space,
    atmosphere: current.atmosphere,
    menuOverview: current.menuOverview,
    orderedItems: current.orderedItems,
    usability: current.usability,
    service: current.service,
    photo: current.photo,
    conclusion: current.conclusion
  });
  if (!parsed.success) return jsonError("INVALID_STORED_REVIEW", "저장된 입력값을 확인하지 못했어요.", 422);

  let result;
  try {
    result = await generateCafeReview({ ...parsed.data, photoCount: 0 });
    result = CafeReviewResultSchema.parse(result);
    validatePhotoPlan(result);
  } catch (error) {
    console.error("AI regeneration failed", { error });
    return jsonError("AI_GENERATION_FAILED", "리뷰를 다시 생성하지 못했어요. 잠시 후 다시 시도해 주세요.", 502);
  }

  const env = getEnv();
  const updated = await prisma.review.update({
    where: { id },
    data: {
      titleOptions: result.titleOptions,
      selectedTitle: result.titleOptions[0],
      summary: result.summary,
      body: result.body,
      tags: normalizeTags(result.tags),
      photoPlan: result.photoPlan,
      warnings: result.warnings,
      aiModel: env.OPENAI_MODEL,
      promptVersion: env.PROMPT_VERSION,
      generationCount: { increment: 1 }
    }
  });

  return NextResponse.json({ review: serializeReview(updated) });
}
