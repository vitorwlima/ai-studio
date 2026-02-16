import { api } from "@convex/api";
import { useQuery } from "convex/react";
import { LucidePanelRightOpen, LucideSquarePen } from "lucide-react";
import { Link, useParams } from "react-router";
import { cn } from "src/lib/utils";

export const ChatSidebar = () => {
  const threads = useQuery(api.threads.list);
  const { threadId } = useParams();

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

      <div className="flex flex-col gap-2 border border-zinc-300 rounded-xl py-3 px-2 w-full h-full">
        <div className="text-xs text-zinc-500 uppercase tracking-wide px-2">
          My Chats
        </div>
        <div className="flex flex-col gap-0.5 overflow-y-auto">
          {threads?.page.map((thread) => (
            <Link
              key={thread._id}
              to={`/chat/${thread._id}`}
              className={cn(
                "text-sm font-medium p-2 rounded-xl truncate transition-colors hover:bg-zinc-300/70",
                threadId === thread._id && "bg-zinc-300/70"
              )}
            >
              {thread.title || "New Chat"}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
