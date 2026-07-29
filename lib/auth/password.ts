import argon2 from "argon2";
import { getEnv } from "@/lib/env";

export async function verifyPassword(password: string) {
  const env = getEnv();
  return argon2.verify(env.APP_PASSWORD_HASH, password);
}

export async function hashPassword(password: string) {
  return argon2.hash(password, { type: argon2.argon2id });
}
