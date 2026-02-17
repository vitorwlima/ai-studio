import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const userOpenRouter = createOpenRouter({
  // todo: get from user
  apiKey:
    "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",
});

export const aiStudioOpenRouter = createOpenRouter({
  // todo: move to .env
  apiKey:
    "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",
});
