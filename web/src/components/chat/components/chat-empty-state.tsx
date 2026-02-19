import { LucideKey, LucideSparkles } from "lucide-react";
import { Link } from "react-router";

type ChatEmptyStateProps = {
  hasApiKey: boolean | undefined;
  selectedModelCode: string | null;
  onSuggestionSelect: (suggestion: string) => void;
};

const suggestions = [
  "Explain how transformers work in simple terms",
  "Write a Python function to find prime numbers",
  "Help me plan a weekend trip itinerary",
];

export const ChatEmptyState = ({
  hasApiKey,
  selectedModelCode,
  onSuggestionSelect,
}: ChatEmptyStateProps) => {
  if (hasApiKey === false) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="size-12 rounded-full bg-zinc-100 flex items-center justify-center">
            <LucideKey className="size-6 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">API key required</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Add your OpenRouter API key in settings to start chatting.
            </p>
          </div>
          <Link
            to="/settings/api-key"
            className="text-sm bg-zinc-900 text-white px-5 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Go to settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center max-w-lg">
        <div className="size-12 rounded-full bg-zinc-100 flex items-center justify-center">
          <LucideSparkles className="size-6 text-zinc-400" />
        </div>
        <div>
          <h2 className="text-3xl font-semibold text-zinc-900">
            What can I help you with?
          </h2>
          <p className="mt-2 text-zinc-500">
            {selectedModelCode
              ? "Start a conversation or try one of these suggestions."
              : "Select a model in the composer below to get started."}
          </p>
        </div>

        {selectedModelCode && (
          <div className="flex flex-col gap-2 w-full max-w-md">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionSelect(suggestion)}
                className="text-left text-sm text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:shadow-sm rounded-xl px-4 py-3 cursor-pointer transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
