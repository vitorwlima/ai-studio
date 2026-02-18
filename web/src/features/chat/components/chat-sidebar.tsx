import { api } from "@convex/api";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import {
  LucidePanelLeftClose,
  LucidePanelLeftOpen,
  LucideSettings,
  LucideSquarePen,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { ThreadItem } from "../types";
import { SidebarProvider, useSidebar } from "../context/sidebar-context";
import { DeleteThreadModal } from "./delete-thread-modal";
import { ThreadList } from "./thread-list";

const SidebarPanel = ({
  threadItems,
  onCollapse,
}: {
  threadItems: ThreadItem[];
  onCollapse: () => void;
}) => {
  const { user } = useUser();
  const { threadActionError } = useSidebar();

  return (
    <div className="h-full flex flex-col w-64 gap-1 text-zinc-300">
      {/* Header */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-zinc-900 rounded-xl">
        <div className="flex items-center gap-1">
          <img src="/logo.svg" alt="AI Studio logo" className="size-6" />
          <h1 className="font-semibold text-sm text-zinc-200">AI Studio</h1>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={onCollapse}
            className="p-1.5 flex items-center justify-center rounded-lg text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <LucidePanelLeftClose className="size-4" />
          </button>
          <Link
            to="/"
            className="p-1.5 flex items-center justify-center rounded-lg text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <LucideSquarePen className="size-4" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col flex-1 bg-zinc-900 rounded-xl h-0">
        {/* Thread list */}
        <div className="flex flex-col min-h-0 flex-1 px-2 pt-3">
          <div className="text-sm text-zinc-500 tracking-wider font-medium px-2 pb-2">
            Chats
          </div>
          {threadActionError && (
            <p className="px-2 pb-2 text-xs text-red-400">
              {threadActionError}
            </p>
          )}
          <ThreadList threadItems={threadItems} />
        </div>

        {/* User profile */}
        {user && (
          <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={user.imageUrl}
                alt={user.fullName ?? "User"}
                className="size-6 rounded-full shrink-0"
              />
              <span className="text-sm font-medium text-zinc-300 truncate">
                {user.fullName ?? user.primaryEmailAddress?.emailAddress}
              </span>
            </div>
            <Link
              to="/settings"
              className="p-1.5 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
            >
              <LucideSettings className="size-4" />
            </Link>
          </div>
        )}
      </div>

      <DeleteThreadModal />
    </div>
  );
};

export const ChatSidebar = () => {
  const threads = useQuery(api.threads.list);
  const [isOpen, setIsOpen] = useState(true);

  const threadItems = useMemo(
    () => (threads?.page ?? []) as ThreadItem[],
    [threads?.page]
  );

  return (
    <SidebarProvider threadItems={threadItems}>
      {isOpen ? (
        <div className="shrink-0 p-4">
          <SidebarPanel
            threadItems={threadItems}
            onCollapse={() => setIsOpen(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="absolute top-4 left-4 z-30 p-3 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <LucidePanelLeftOpen className="size-4" />
        </button>
      )}
    </SidebarProvider>
  );
};
