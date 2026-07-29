import { NextResponse, type NextRequest } from "next/server";
import { CafeReviewResultSchema, validatePhotoPlan } from "@/lib/ai/schema";
import { generateCafeReview } from "@/lib/ai/generate-review";
import { getEnv } from "@/lib/env";
import { jsonError, requireAuth, serializeReview, verifyOrigin } from "@/lib/http";
import { validateServerImages } from "@/lib/images/validation";
import { prisma } from "@/lib/db";
import { generateReviewInputSchema, normalizeTags } from "@/lib/validation";

export async function POST(request: NextRequest) {
  if (!verifyOrigin(request)) return jsonError("BAD_ORIGIN", "허용되지 않은 요청이에요.", 403);
  const authError = await requireAuth(request);
  if (authError) return authError;

  const env = getEnv();
  const formData = await request.formData().catch(() => null);
  if (!formData) return jsonError("VALIDATION_ERROR", "요청 형식이 올바르지 않아요.");
  const rawPayload = formData.get("payload");
  if (typeof rawPayload !== "string") return jsonError("VALIDATION_ERROR", "입력값을 확인해 주세요.");

  let payloadJson: unknown;
  try {
    payloadJson = JSON.parse(rawPayload);
  } catch {
    return jsonError("VALIDATION_ERROR", "입력값을 읽을 수 없어요.");
  }

  const images = formData.getAll("images").filter((value): value is File => value instanceof File);
  const parsed = generateReviewInputSchema.safeParse({
    ...(typeof payloadJson === "object" && payloadJson !== null ? payloadJson : {}),
    photoCount: images.length
  });
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.");
  }

  try {
    await validateServerImages(images, {
      maxCount: env.MAX_IMAGE_COUNT,
      maxSizeMb: env.MAX_IMAGE_SIZE_MB,
      maxTotalMb: env.MAX_TOTAL_UPLOAD_MB
    });
  } catch (error) {
    return jsonError("IMAGE_ERROR", error instanceof Error ? error.message : "사진을 확인해 주세요.");
  }

  let result;
  try {
    try {
      result = await generateCafeReview(
        parsed.data,
        images.map((file, index) => ({ file, sourceIndex: index + 1 }))
      );
    } catch {
      result = await generateCafeReview(
        parsed.data,
        images.map((file, index) => ({ file, sourceIndex: index + 1 }))
      );
    }
    result = CafeReviewResultSchema.parse(result);
    validatePhotoPlan(result, images.length);
  } catch {
    return jsonError(
      "AI_GENERATION_FAILED",
      "리뷰를 생성하지 못했어요. 입력한 내용은 유지했으니 잠시 후 다시 시도해 주세요.",
      502
    );
  }

  const { basic, photoCount: _photoCount, ...sections } = parsed.data;
  void _photoCount;

  try {
    const review = await prisma.review.create({
      data: {
        cafeName: basic.cafeName,
        visitedAt: new Date(basic.visitedAt),
        area: basic.area,
        basic,
        ...sections,
        status: "GENERATED",
        titleOptions: result.titleOptions,
        selectedTitle: result.titleOptions[0],
        summary: result.summary,
        body: result.body,
        tags: normalizeTags(result.tags),
        photoPlan: result.photoPlan,
        warnings: result.warnings,
        aiModel: env.OPENAI_MODEL,
        promptVersion: env.PROMPT_VERSION,
        generationCount: 1
      }
    });
    return NextResponse.json({ review: serializeReview(review) });
  } catch {
    return jsonError("DB_SAVE_FAILED", "생성 결과를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.", 500);
  }
}
