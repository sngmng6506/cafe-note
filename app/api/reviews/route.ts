import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, serializeReview } from "@/lib/http";

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "30") || 30));
  const where = q ? { cafeName: { contains: q, mode: "insensitive" as const } } : {};
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: [{ visitedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.review.count({ where })
  ]);

  return NextResponse.json({
    items: items.map(serializeReview),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
}
