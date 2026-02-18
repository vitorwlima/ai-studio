import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const aiStudioOpenRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const createUserOpenRouter = (apiKey: string) => {
  return createOpenRouter({ apiKey });
}
