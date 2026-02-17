import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const aiStudioOpenRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export function createUserOpenRouter(apiKey: string) {
  return createOpenRouter({ apiKey });
}
