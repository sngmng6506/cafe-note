import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getOptionalEnv } from "@/lib/env";
import { isAuthenticatedRequest } from "@/lib/auth/session";

export function jsonError(code: string, message: string, status = 400) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function requireAuth(request: NextRequest) {
  const authenticated = await isAuthenticatedRequest(request);
  if (!authenticated) return jsonError("UNAUTHORIZED", "로그인이 필요해요.", 401);
  return null;
}

export function verifyOrigin(request: NextRequest) {
  if (!["POST", "PATCH", "DELETE"].includes(request.method)) return true;
  const origin = request.headers.get("origin") ?? request.headers.get("referer");
  if (!origin) return true;
  const appUrl = getOptionalEnv().APP_URL;
  const expected = appUrl ? new URL(appUrl).origin : request.nextUrl.origin;
  try {
    return new URL(origin).origin === expected || new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

export function clientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export function serializeReview(review: {
  id: string;
  cafeName: string;
  visitedAt: Date;
  area: string;
  cafeType: unknown;
  basic: unknown;
  access: unknown;
  exterior: unknown;
  space: unknown;
  atmosphere: unknown;
  menuOverview: unknown;
  orderedItems: unknown;
  usability: unknown;
  service: unknown;
  photo: unknown;
  conclusion: unknown;
  status: string;
  titleOptions: unknown;
  selectedTitle: string | null;
  summary: string | null;
  body: string | null;
  tags: unknown;
  photoPlan: unknown;
  warnings: unknown;
  aiModel: string | null;
  promptVersion: string | null;
  generationCount: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...review,
    visitedAt: review.visitedAt.toISOString().slice(0, 10),
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString()
  };
}
