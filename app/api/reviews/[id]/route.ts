import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { editableReviewSchema, normalizeTags } from "@/lib/validation";
import { jsonError, requireAuth, serializeReview, verifyOrigin } from "@/lib/http";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return jsonError("NOT_FOUND", "존재하지 않는 리뷰예요.", 404);
  return NextResponse.json({ review: serializeReview(review) });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyOrigin(request)) return jsonError("BAD_ORIGIN", "허용되지 않은 요청이에요.", 403);
  const authError = await requireAuth(request);
  if (authError) return authError;
  const { id } = await params;
  const parsed = editableReviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.");
  }

  const data = parsed.data;
  const basic = data.basic;
  const review = await prisma.review
    .update({
      where: { id },
      data: {
        ...(basic?.cafeName && { cafeName: basic.cafeName }),
        ...(basic?.visitedAt && { visitedAt: new Date(basic.visitedAt) }),
        ...(basic?.area && { area: basic.area }),
        ...(data.cafeType && { cafeType: data.cafeType }),
        ...(basic && { basic }),
        ...(data.access && { access: data.access }),
        ...(data.exterior && { exterior: data.exterior }),
        ...(data.space && { space: data.space }),
        ...(data.atmosphere && { atmosphere: data.atmosphere }),
        ...(data.menuOverview && { menuOverview: data.menuOverview }),
        ...(data.orderedItems && { orderedItems: data.orderedItems }),
        ...(data.usability && { usability: data.usability }),
        ...(data.service && { service: data.service }),
        ...(data.photo && { photo: data.photo }),
        ...(data.conclusion && { conclusion: data.conclusion }),
        ...(data.selectedTitle && { selectedTitle: data.selectedTitle }),
        ...(data.summary && { summary: data.summary }),
        ...(data.body && { body: data.body }),
        ...(data.tags && { tags: normalizeTags(data.tags) })
      }
    })
    .catch(() => null);
  if (!review) return jsonError("NOT_FOUND", "존재하지 않는 리뷰예요.", 404);
  return NextResponse.json({ review: serializeReview(review) });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyOrigin(request)) return jsonError("BAD_ORIGIN", "허용되지 않은 요청이에요.", 403);
  const authError = await requireAuth(request);
  if (authError) return authError;
  const { id } = await params;
  const deleted = await prisma.review.delete({ where: { id } }).catch(() => null);
  if (!deleted) return jsonError("NOT_FOUND", "존재하지 않는 리뷰예요.", 404);
  return new NextResponse(null, { status: 204 });
}
