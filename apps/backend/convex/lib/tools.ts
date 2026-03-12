import { createTool } from "@convex-dev/agent";
import Exa from "exa-js";
import { z } from "zod";

export const webSearch = createTool({
  description:
    "Search the web for current or recent information. Use this when the user asks about recent events, news, or anything that requires up-to-date information.",
  args: z.object({
    query: z.string().describe("The search query"),
  }),
  handler: async (_ctx, args) => {
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) {
      throw new Error("EXA_API_KEY environment variable is not set");
    }
    const exa = new Exa(apiKey);
    const response = await exa.searchAndContents(args.query, {
      type: "auto",
      numResults: 5,
      highlights: { maxCharacters: 4000 },
    });
    return {
      results: response.results.map((result) => ({
        title: result.title,
        url: result.url,
        highlights: result.highlights,
      })),
    };
  },
});
