import { api } from "@convex/api";
import { useQuery } from "convex/react";
import { LucidePanelRightOpen, LucideSquarePen } from "lucide-react";
import { Link } from "react-router";

export const ChatSidebar = () => {
  const threads = useQuery(api.threads.list);

  return (
    <div className="h-full flex flex-col gap-2 w-64">
      <div className="flex items-center justify-between border border-zinc-300 rounded-xl p-2 w-full">
        <div className="flex items-center gap-0.5">
          <img src="/logo.svg" alt="AI Studio logo" className="size-6" />
          <h1 className="font-medium text-sm">AI Studio</h1>
        </div>
        <div className="flex items-center gap-0.5">
          <button className="p-0.5 flex items-center justify-center">
            <LucidePanelRightOpen className="size-4" />
          </button>
          <Link to="/" className="p-0.5 flex items-center justify-center">
            <LucideSquarePen className="size-4" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-2 border border-zinc-300 rounded-xl p-2 w-full h-full">
        <div className="font-medium text-sm">My Chats</div>
        <div className="flex flex-col gap-1 overflow-y-auto">
          {threads?.page.map((thread) => (
            <Link
              key={thread._id}
              to={`/chat/${thread._id}`}
              className="font-medium text-sm p-2 rounded-xl"
            >
              {thread.title || "New Chat"}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
