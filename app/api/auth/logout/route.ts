import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";
import { jsonError, verifyOrigin } from "@/lib/http";

export async function POST(request: NextRequest) {
  if (!verifyOrigin(request)) return jsonError("BAD_ORIGIN", "허용되지 않은 요청이에요.", 403);
  await clearSessionCookie();
  return NextResponse.json({ authenticated: false });
}
