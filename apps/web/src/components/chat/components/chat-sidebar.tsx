import { api } from "@convex/api";
import { useUser } from "@clerk/clerk-react";
import { useAction, useQuery } from "convex/react";
import {
  LucidePanelLeftClose,
  LucidePanelLeftOpen,
  LucideSettings,
  LucideSquarePen,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { DeleteThreadModal } from "./delete-thread-modal";
import { ThreadList } from "./thread-list";
import type { DeleteModalThread, ThreadItem } from "../types";

const SidebarPanel = ({
  threadItems,
  activeThreadId,
  threadActionError,
  onRequestDelete,
  onActionError,
  onCollapse,
}: {
  threadItems: ThreadItem[];
  activeThreadId: string | undefined;
  threadActionError: string | null;
  onRequestDelete: (thread: DeleteModalThread) => void;
  onActionError: (message: string | null) => void;
  onCollapse: () => void;
}) => {
  const { user } = useUser();

  return (
    <div className="h-full flex flex-col w-64 gap-0.5 text-zinc-300">
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
        <div className="flex flex-col min-h-0 flex-1 px-2 py-3">
          {threadActionError && (
            <p className="px-2 pb-2 text-xs text-red-400">{threadActionError}</p>
          )}
          <ThreadList
            threadItems={threadItems}
            activeThreadId={activeThreadId}
            onRequestDelete={onRequestDelete}
            onActionError={onActionError}
          />
        </div>

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
              to="/settings/api-key"
              className="p-1.5 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
            >
              <LucideSettings className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export const ChatSidebar = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const threads = useQuery(api.threads.list);
  const deleteThread = useAction(api.threads.deleteThread);

  const [isOpen, setIsOpen] = useState(true);
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

  const onConfirmDelete = async () => {
    if (!deleteModalThread || isDeleting) return;

    const deletingThreadId = deleteModalThread.threadId;
    setThreadActionError(null);
    setIsDeleting(true);

    try {
      await deleteThread({ threadId: deletingThreadId });
      setDeleteModalThread(null);

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
    <>
      {isOpen ? (
        <div className="shrink-0 p-2">
          <SidebarPanel
            threadItems={threadItems}
            activeThreadId={threadId}
            threadActionError={threadActionError}
            onRequestDelete={(thread) => {
              setThreadActionError(null);
              setDeleteModalThread(thread);
            }}
            onActionError={setThreadActionError}
            onCollapse={() => setIsOpen(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="absolute top-2 left-2 z-30 p-3 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <LucidePanelLeftOpen className="size-4" />
        </button>
      )}

      <DeleteThreadModal
        deleteModalThread={deleteModalThread}
        isDeleting={isDeleting}
        onCloseDeleteModal={() => {
          if (!isDeleting) setDeleteModalThread(null);
        }}
        onConfirmDelete={() => {
          void onConfirmDelete();
        }}
      />
    </>
  );
};
