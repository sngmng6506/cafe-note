import OpenAI from "openai";
import { getEnv } from "@/lib/env";

export function getOpenAIClient() {
  const env = getEnv();

  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": env.APP_URL,
      "X-OpenRouter-Title": "Cafe Note"
    }
  });
}
