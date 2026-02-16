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
