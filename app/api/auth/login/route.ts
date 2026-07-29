import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { clientIp, jsonError, verifyOrigin } from "@/lib/http";
import { isLoginLimited, recordLoginAttempt } from "@/lib/auth/rate-limit";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

const loginSchema = z.object({ password: z.string().min(1) });

export async function POST(request: NextRequest) {
  if (!verifyOrigin(request)) return jsonError("BAD_ORIGIN", "허용되지 않은 요청이에요.", 403);
  const ip = clientIp(request);
  if (await isLoginLimited(ip)) return jsonError("RATE_LIMITED", "로그인 시도가 많아요. 잠시 후 다시 시도해 주세요.", 429);

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("VALIDATION_ERROR", "비밀번호를 입력해 주세요.");

  const ok = await verifyPassword(parsed.data.password);
  await recordLoginAttempt(ip, ok);
  if (!ok) return jsonError("LOGIN_FAILED", "비밀번호가 올바르지 않아요.", 401);

  await setSessionCookie();
  return NextResponse.json({ authenticated: true });
}
