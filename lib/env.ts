import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).default("gpt-5.6-luna"),
  APP_PASSWORD_HASH: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  SESSION_MAX_AGE_DAYS: z.coerce.number().int().positive().default(30),
  LOGIN_RATE_LIMIT_SALT: z.string().min(16),
  APP_URL: z.string().url().default("http://localhost:3000"),
  PROMPT_VERSION: z.string().min(1).default("cafe-review-v2"),
  MAX_IMAGE_COUNT: z.coerce.number().int().positive().default(12),
  MAX_IMAGE_SIZE_MB: z.coerce.number().positive().default(2),
  MAX_TOTAL_UPLOAD_MB: z.coerce.number().positive().default(16)
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const keys = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`필수 환경변수가 올바르지 않습니다: ${keys}`);
  }
  return parsed.data;
}

export function getOptionalEnv(): Partial<ServerEnv> {
  return serverEnvSchema.partial().parse(process.env);
}

export function validateEnv(input: Record<string, string | undefined>) {
  return serverEnvSchema.safeParse(input);
}
