import { api } from "@convex/api";
import { useUIMessages } from "@convex-dev/agent/react";
import { useMutation } from "convex/react";
import { LucideLoader, LucideTrash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { cn } from "src/lib/utils";
import type { DeleteModalThread, ThreadItem } from "../types";

type ThreadRowProps = {
  thread: ThreadItem;
  isActive: boolean;
  onRequestDelete: (thread: DeleteModalThread) => void;
  onActionError: (message: string | null) => void;
};

const getDisplayTitle = (title?: string) => {
  const trimmed = title?.trim();
  return trimmed ? trimmed : "New Chat";
};

export const ThreadRow = ({
  thread,
  isActive,
  onRequestDelete,
  onActionError,
}: ThreadRowProps) => {
  const threadId = thread._id;
  const rowTitle = getDisplayTitle(thread.title);

  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(rowTitle);
  const [isRenaming, setIsRenaming] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigateTimeoutRef = useRef<number | null>(null);

  const navigate = useNavigate();
  const renameThreadTitle = useMutation(api.threads.renameThreadTitle);

  const messagesResult = useUIMessages(
    api.threads.listThreadMessages,
    { threadId },
    { initialNumItems: 9999, stream: true }
  );

  const isStreaming = messagesResult?.results.some((result) =>
    result.id.includes("stream:")
  );

  useEffect(() => {
    if (!isEditing) {
      setEditingTitle(rowTitle);
      return;
    }

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isEditing, rowTitle]);

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
      navigate(`/chat/${threadId}`);
      navigateTimeoutRef.current = null;
    }, 180);
  };

  const saveEditing = async () => {
    if (!isEditing || isRenaming) return;

    const normalizedTitle = editingTitle.trim();
    if (!normalizedTitle || normalizedTitle === rowTitle.trim()) {
      setIsEditing(false);
      setEditingTitle(rowTitle);
      return;
    }

    onActionError(null);
    setIsRenaming(true);

    try {
      await renameThreadTitle({
        threadId,
        title: normalizedTitle,
      });
      setIsEditing(false);
    } catch {
      onActionError("Could not rename thread. Try again.");
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <div
      role="button"
      tabIndex={isEditing ? -1 : 0}
      onClick={() => {
        if (!isEditing) {
          scheduleNavigation();
        }
      }}
      onDoubleClick={(event) => {
        if (isEditing) return;

        event.preventDefault();
        if (navigateTimeoutRef.current !== null) {
          window.clearTimeout(navigateTimeoutRef.current);
          navigateTimeoutRef.current = null;
        }
        onActionError(null);
        setIsEditing(true);
        setEditingTitle(rowTitle);
      }}
      onKeyDown={(event) => {
        if (isEditing) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          scheduleNavigation();
        }
      }}
      className={cn(
        "group shrink-0 text-sm p-2 rounded-lg transition-colors hover:bg-zinc-800 flex items-center gap-2",
        !isEditing && "cursor-pointer",
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
          onChange={(event) => setEditingTitle(event.target.value)}
          onBlur={() => {
            void saveEditing();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void saveEditing();
              return;
            }

            if (event.key === "Escape") {
              event.preventDefault();
              setIsEditing(false);
              setEditingTitle(rowTitle);
            }
          }}
          disabled={isRenaming}
          className="min-w-0 flex-1 rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-white outline-none focus:border-zinc-500 disabled:opacity-50"
        />
      ) : (
        <span className="min-w-0 flex-1 truncate">{rowTitle}</span>
      )}

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRequestDelete({ threadId, title: rowTitle });
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
