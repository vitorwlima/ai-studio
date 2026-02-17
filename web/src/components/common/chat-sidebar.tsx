import { api } from "@convex/api";
import { useUser } from "@clerk/clerk-react";
import { useUIMessages } from "@convex-dev/agent/react";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  LucideLoader,
  LucidePanelRightOpen,
  LucideSettings,
  LucideSquarePen,
  LucideTrash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { cn } from "src/lib/utils";

type ThreadItem = {
  _id: string;
  title?: string;
};

type DeleteModalThread = {
  threadId: string;
  title: string;
};

const getDisplayTitle = (title?: string) => {
  const trimmed = title?.trim();
  return trimmed ? trimmed : "New Chat";
};

const ThreadRow = ({
  thread,
  isEditing,
  editingTitle,
  isRenaming,
  isActive,
  onNavigate,
  onStartEditing,
  onEditingTitleChange,
  onSaveEditing,
  onCancelEditing,
  onOpenDeleteModal,
}: {
  thread: ThreadItem;
  isEditing: boolean;
  editingTitle: string;
  isRenaming: boolean;
  isActive: boolean;
  onNavigate: (threadId: string) => void;
  onStartEditing: (threadId: string, currentTitle: string) => void;
  onEditingTitleChange: (value: string) => void;
  onSaveEditing: (thread: ThreadItem, originalTitle: string) => Promise<void>;
  onCancelEditing: () => void;
  onOpenDeleteModal: (thread: DeleteModalThread) => void;
}) => {
  const threadId = thread._id;
  const rowTitle = getDisplayTitle(thread.title);
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
        "group shrink-0 text-sm font-medium p-2 rounded-xl transition-colors hover:bg-zinc-300/70 flex items-center gap-2",
        isActive && "bg-zinc-300/70"
      )}
    >
      {isStreaming && (
        <LucideLoader className="size-3 shrink-0 animate-spin text-zinc-400" />
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
          className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-400 disabled:opacity-50"
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
          "shrink-0 rounded-lg p-1 text-zinc-500 transition cursor-pointer hover:bg-red-50 hover:text-red-600",
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

const DeleteThreadModal = ({
  thread,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  thread: DeleteModalThread;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/30 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl">
        <h2 className="text-base font-semibold text-zinc-900">Delete thread?</h2>
        <p className="mt-2 text-sm text-zinc-600">
          This permanently deletes <strong>{thread.title}</strong> and all its
          messages. This action cannot be undone.
        </p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors cursor-pointer hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white transition-colors cursor-pointer hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ChatSidebar = () => {
  const threads = useQuery(api.threads.list);
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const renameThreadTitle = useMutation(api.threads.renameThreadTitle);
  const deleteThread = useAction(api.threads.deleteThread);

  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [deleteModalThread, setDeleteModalThread] =
    useState<DeleteModalThread | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [threadActionError, setThreadActionError] = useState<string | null>(
    null
  );

  const threadItems = useMemo(
    () => (threads?.page ?? []) as ThreadItem[],
    [threads?.page]
  );

  useEffect(() => {
    if (!deleteModalThread) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) {
        setDeleteModalThread(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteModalThread, isDeleting]);

  useEffect(() => {
    if (!editingThreadId) {
      return;
    }

    const editingThreadStillExists = threadItems.some(
      (thread) => thread._id === editingThreadId
    );
    if (!editingThreadStillExists) {
      setEditingThreadId(null);
      setEditingTitle("");
    }
  }, [editingThreadId, threadItems]);

  const clearEditingState = () => {
    setEditingThreadId(null);
    setEditingTitle("");
  };

  const handleStartEditing = (targetThreadId: string, currentTitle: string) => {
    setThreadActionError(null);
    setEditingThreadId(targetThreadId);
    setEditingTitle(currentTitle);
  };

  const handleCancelEditing = () => {
    if (isRenaming) return;
    clearEditingState();
  };

  const handleSaveEditing = async (thread: ThreadItem, originalTitle: string) => {
    if (editingThreadId !== thread._id || isRenaming) {
      return;
    }

    const normalizedTitle = editingTitle.trim();
    if (!normalizedTitle || normalizedTitle === originalTitle.trim()) {
      clearEditingState();
      return;
    }

    setThreadActionError(null);
    setIsRenaming(true);

    try {
      await renameThreadTitle({
        threadId: thread._id,
        title: normalizedTitle,
      });
      clearEditingState();
    } catch {
      setThreadActionError("Could not rename thread. Try again.");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalThread || isDeleting) return;

    const deletingThreadId = deleteModalThread.threadId;
    setThreadActionError(null);
    setIsDeleting(true);

    try {
      await deleteThread({ threadId: deletingThreadId });
      setDeleteModalThread(null);

      if (editingThreadId === deletingThreadId) {
        clearEditingState();
      }

      if (threadId === deletingThreadId) {
        navigate("/");
      }
    } catch {
      setThreadActionError("Could not delete thread. Try again.");
    } finally {
      setIsDeleting(false);
    }
  };

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
        {threadActionError && (
          <p className="px-2 text-xs text-red-600">{threadActionError}</p>
        )}
        <div className="flex flex-col gap-0.5 overflow-y-auto min-h-0">
          {threadItems.map((thread) => (
            <ThreadRow
              key={thread._id}
              thread={thread}
              isEditing={editingThreadId === thread._id}
              editingTitle={editingTitle}
              isRenaming={isRenaming}
              isActive={threadId === thread._id}
              onNavigate={(targetThreadId) => navigate(`/chat/${targetThreadId}`)}
              onStartEditing={handleStartEditing}
              onEditingTitleChange={setEditingTitle}
              onSaveEditing={handleSaveEditing}
              onCancelEditing={handleCancelEditing}
              onOpenDeleteModal={(threadToDelete) => {
                setThreadActionError(null);
                setDeleteModalThread(threadToDelete);
              }}
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

      {deleteModalThread && (
        <DeleteThreadModal
          thread={deleteModalThread}
          isDeleting={isDeleting}
          onCancel={() => {
            if (!isDeleting) {
              setDeleteModalThread(null);
            }
          }}
          onConfirm={() => {
            void handleConfirmDelete();
          }}
        />
      )}
    </div>
  );
};
