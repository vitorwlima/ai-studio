import { api } from "@convex/api";
import { useUser } from "@clerk/clerk-react";
import { useUIMessages } from "@convex-dev/agent/react";
import { useQuery } from "convex/react";
import {
  LucideLoader,
  LucidePanelRightOpen,
  LucideSettings,
  LucideSquarePen,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { cn } from "src/lib/utils";

const ThreadLink = ({
  threadId,
  title,
  isActive,
}: {
  threadId: string;
  title: string;
  isActive: boolean;
}) => {
  const messagesResult = useUIMessages(
    api.threads.listThreadMessages,
    { threadId },
    { initialNumItems: 9999, stream: true }
  );

  const isStreaming = messagesResult?.results.some((res) =>
    res.id.includes("stream:")
  );

  return (
    <Link
      to={`/chat/${threadId}`}
      className={cn(
        "shrink-0 text-sm font-medium p-2 rounded-xl truncate transition-colors hover:bg-zinc-300/70 flex items-center gap-2",
        isActive && "bg-zinc-300/70"
      )}
    >
      {isStreaming && (
        <LucideLoader className="size-3 shrink-0 animate-spin text-zinc-400" />
      )}
      <span className="truncate">{title || "New Chat"}</span>
    </Link>
  );
};

export const ChatSidebar = () => {
  const threads = useQuery(api.threads.list);
  const { threadId } = useParams();
  const { user } = useUser();

  return (
    <div className="h-full flex flex-col gap-2 w-64">
      <div className="flex items-center justify-between border border-zinc-300 rounded-xl p-2 w-full">
        <div className="flex items-center gap-0.5">
          <img src="/logo.svg" alt="AI Studio logo" className="size-6" />
          <h1 className="font-medium text-sm">AI Studio</h1>
        </div>
        <div className="flex items-center">
          <button className="cursor-pointer p-1 flex items-center justify-center rounded-lg hover:bg-zinc-300 transition-colors">
            <LucidePanelRightOpen className="size-4" />
          </button>
          <Link
            to="/"
            className="p-1 flex items-center justify-center rounded-lg hover:bg-zinc-300 transition-colors"
          >
            <LucideSquarePen className="size-4" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-2 border border-zinc-300 rounded-xl py-3 px-2 w-full min-h-0 flex-1">
        <div className="text-xs text-zinc-500 uppercase tracking-wide px-2 shrink-0">
          My Chats
        </div>
        <div className="flex flex-col gap-0.5 overflow-y-auto min-h-0">
          {threads?.page.map((thread) => (
            <ThreadLink
              key={thread._id}
              threadId={thread._id}
              title={thread.title || "New Chat"}
              isActive={threadId === thread._id}
            />
          ))}
        </div>
      </div>

      {user && (
        <div className="flex items-center justify-between border border-zinc-300 rounded-xl p-2 w-full">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={user.imageUrl}
              alt={user.fullName ?? "User"}
              className="size-6 rounded-full shrink-0"
            />
            <span className="text-sm font-medium truncate">
              {user.fullName ?? user.primaryEmailAddress?.emailAddress}
            </span>
          </div>
          <Link
            to="/settings"
            className="p-1 flex items-center justify-center rounded-lg hover:bg-zinc-300 transition-colors shrink-0"
          >
            <LucideSettings className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
};
