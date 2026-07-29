import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { getEnv } from "@/lib/env";

export const SESSION_COOKIE = "cafe_note_session";

function secretKey() {
  return new TextEncoder().encode(getEnv().SESSION_SECRET);
}

export async function createSessionToken() {
  const env = getEnv();
  return new SignJWT({ scope: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${env.SESSION_MAX_AGE_DAYS}d`)
    .sign(secretKey());
}

export async function verifySessionToken(token?: string) {
  if (!token) return false;
  try {
    const result = await jwtVerify(token, secretKey());
    return result.payload.scope === "owner";
  } catch {
    return false;
  }
}

export async function isAuthenticatedRequest(request: NextRequest) {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function isAuthenticatedCookieStore() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie() {
  const env = getEnv();
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}
