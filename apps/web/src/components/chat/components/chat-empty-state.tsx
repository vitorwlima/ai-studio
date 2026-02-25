import { useUser } from "@clerk/clerk-react";
import { LucideKey, LucideLock } from "lucide-react";
import { Link } from "react-router";

type Props = {
  hasApiKey: boolean | undefined;
  selectedModelCode: string | null;
  isProUser: boolean;
};

export const ChatEmptyState = ({
  hasApiKey,
  selectedModelCode,
  isProUser,
}: Props) => {
  const { user } = useUser();

  if (!isProUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="size-12 rounded-full bg-zinc-100 flex items-center justify-center">
            <LucideLock className="size-6 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Pro subscription required
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Subscribe to Pro in settings to start chatting.
            </p>
          </div>
          <Link
            to="/settings/subscription"
            className="text-sm bg-zinc-900 text-white px-5 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Go to settings
          </Link>
        </div>
      </div>
    );
  }

  if (hasApiKey === false) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="size-12 rounded-full bg-zinc-100 flex items-center justify-center">
            <LucideKey className="size-6 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              API key required
            </h2>
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
          {!isProUser && (
            <Link
              to="/settings/subscription"
              className="text-sm text-zinc-700 underline underline-offset-4 hover:text-zinc-900 transition-colors"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <h3 className="mb-2 text-center text-3xl font-semibold">
        Welcome, {user?.firstName}
      </h3>
      <p className="text-zinc-500">How can I help you?</p>

      {!selectedModelCode && (
        <p className="mt-2 text-sm text-zinc-500">
          Tip: add a model in the chat box below to get started.
        </p>
      )}
    </div>
  );
};
