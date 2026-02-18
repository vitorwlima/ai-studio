import { api } from "@convex/api";
import { useUIMessages } from "@convex-dev/agent/react";
import { LucideLoader, LucideTrash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "src/lib/utils";
import { useSidebar } from "../context/sidebar-context";
import type { ThreadItem } from "../types";

type ThreadRowProps = {
  thread: ThreadItem;
};

const getDisplayTitle = (title?: string) => {
  const trimmed = title?.trim();
  return trimmed ? trimmed : "New Chat";
};

export const ThreadRow = ({ thread }: ThreadRowProps) => {
  const {
    activeThreadId,
    editingThreadId,
    editingTitle,
    isRenaming,
    onStartEditing,
    onEditingTitleChange,
    onSaveEditing,
    onCancelEditing,
    onNavigate,
    onOpenDeleteModal,
  } = useSidebar();

  const threadId = thread._id;
  const rowTitle = getDisplayTitle(thread.title);
  const isEditing = editingThreadId === threadId;
  const isActive = activeThreadId === threadId;

  const messagesResult = useUIMessages(
    api.threads.listThreadMessages,
    { threadId },
    { initialNumItems: 9999, stream: true }
  );

  const isStreaming = messagesResult?.results.some((res) =>
    res.id.includes("stream:")
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const navigateTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    return () => {
      if (navigateTimeoutRef.current !== null) {
        window.clearTimeout(navigateTimeoutRef.current);
      }
    };
  }, []);

  const scheduleNavigation = () => {
    if (navigateTimeoutRef.current !== null) {
      window.clearTimeout(navigateTimeoutRef.current);
    }
    navigateTimeoutRef.current = window.setTimeout(() => {
      onNavigate(threadId);
      navigateTimeoutRef.current = null;
    }, 180);
  };

  return (
    <div
      className={cn(
        "group shrink-0 text-sm p-2 rounded-lg transition-colors hover:bg-zinc-800 flex items-center gap-2",
        isActive && "bg-zinc-800 text-white"
      )}
    >
      {isStreaming && (
        <LucideLoader className="size-3 shrink-0 animate-spin text-zinc-500" />
      )}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editingTitle}
          onChange={(event) => onEditingTitleChange(event.target.value)}
          onBlur={() => {
            void onSaveEditing(thread, rowTitle);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void onSaveEditing(thread, rowTitle);
              return;
            }
            if (event.key === "Escape") {
              event.preventDefault();
              onCancelEditing();
            }
          }}
          disabled={isRenaming}
          className="min-w-0 flex-1 rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-white outline-none focus:border-zinc-500 disabled:opacity-50"
        />
      ) : (
        <button
          type="button"
          onClick={scheduleNavigation}
          onDoubleClick={(event) => {
            event.preventDefault();
            if (navigateTimeoutRef.current !== null) {
              window.clearTimeout(navigateTimeoutRef.current);
              navigateTimeoutRef.current = null;
            }
            onStartEditing(threadId, rowTitle);
          }}
          className="min-w-0 flex-1 truncate text-left cursor-pointer"
        >
          <span className="truncate">{rowTitle}</span>
        </button>
      )}

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onOpenDeleteModal({ threadId, title: rowTitle });
        }}
        className={cn(
          "shrink-0 rounded-lg p-1 text-zinc-500 transition cursor-pointer hover:text-red-400",
          isEditing
            ? "opacity-0 pointer-events-none"
            : "opacity-0 group-hover:opacity-100 focus:opacity-100"
        )}
        aria-label={`Delete thread ${rowTitle}`}
      >
        <LucideTrash2 className="size-3.5" />
      </button>
    </div>
  );
};
