import { api } from "@convex/api";
import { useUIMessages } from "@convex-dev/agent/react";
import { useMutation } from "convex/react";
import { LucideLoader, LucideTrash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
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
      className={cn(
        "group relative shrink-0 text-sm p-2 rounded-lg transition-colors hover:bg-zinc-800 flex items-center gap-2",
        !isEditing && "cursor-pointer",
        isActive && "bg-zinc-800 text-white"
      )}
    >
      {isEditing ? (
        <>
          {isStreaming && (
            <LucideLoader className="size-3 shrink-0 animate-spin text-zinc-500" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={editingTitle}
            onChange={(event) => setEditingTitle(event.target.value)}
            onBlur={() => {
              saveEditing();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                saveEditing();
                return;
              }

              if (event.key === "Escape") {
                event.preventDefault();
                setIsEditing(false);
                setEditingTitle(rowTitle);
              }
            }}
            disabled={isRenaming}
            className="min-w-0 flex-1 text-sm text-white outline-none disabled:opacity-50"
          />
        </>
      ) : (
        <>
          <Link
            to={`/chat/${threadId}`}
            onDoubleClick={(event) => {
              event.preventDefault();
              onActionError(null);
              setIsEditing(true);
              setEditingTitle(rowTitle);
            }}
            className="absolute inset-0 rounded-lg"
            aria-label={`Open thread ${rowTitle}`}
          />
          <div className="relative z-10 min-w-0 flex-1 truncate flex items-center gap-2 pointer-events-none">
            {isStreaming && (
              <LucideLoader className="size-3 shrink-0 animate-spin text-zinc-500" />
            )}
            <span className="truncate">{rowTitle}</span>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRequestDelete({ threadId, title: rowTitle });
        }}
        className={cn(
          "relative z-20 shrink-0 rounded-lg p-1 text-zinc-500 transition cursor-pointer hover:text-red-400",
          isEditing
            ? "opacity-0 pointer-events-none"
            : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus:opacity-100 focus:pointer-events-auto"
        )}
        aria-label={`Delete thread ${rowTitle}`}
      >
        <LucideTrash2 className="size-3.5" />
      </button>
    </div>
  );
};
