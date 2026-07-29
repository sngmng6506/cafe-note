import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

export function hashIp(ip: string) {
  return crypto.createHash("sha256").update(`${getEnv().LOGIN_RATE_LIMIT_SALT}:${ip}`).digest("hex");
}

export async function isLoginLimited(ip: string) {
  const ipHash = hashIp(ip);
  const since = new Date(Date.now() - WINDOW_MS);
  const failures = await prisma.loginAttempt.count({
    where: { ipHash, succeeded: false, createdAt: { gte: since } }
  });
  return failures >= MAX_FAILURES;
}

export async function recordLoginAttempt(ip: string, succeeded: boolean) {
  await prisma.loginAttempt.create({ data: { ipHash: hashIp(ip), succeeded } });
}
