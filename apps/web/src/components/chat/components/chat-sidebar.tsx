import { api } from "@convex/api";
import { useUser } from "@clerk/clerk-react";
import { useAction, useQuery } from "convex/react";
import {
  LucidePanelLeftClose,
  LucidePanelLeftOpen,
  LucideSettings,
  LucideSquarePen,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { DeleteThreadModal } from "./delete-thread-modal";
import { ThreadList } from "./thread-list";
import type { DeleteModalThread, ThreadItem } from "../types";

const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

const SidebarPanel = ({
  threadItems,
  activeThreadId,
  onRequestDelete,
  onCollapse,
}: {
  threadItems: ThreadItem[];
  activeThreadId: string | undefined;
  onRequestDelete: (thread: DeleteModalThread) => void;
  onCollapse: () => void;
}) => {
  const { user } = useUser();

  return (
    <div className="h-full flex flex-col w-72 gap-1 text-zinc-300">
      <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl">
        <div className="flex items-center gap-0.5">
          <img src="/logo.svg" alt="AI Studio logo" className="size-7" />
          <h1 className="font-medium text-sm text-zinc-200">AI Studio</h1>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={onCollapse}
            className="p-1 flex items-center justify-center rounded-lg text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <LucidePanelLeftClose className="size-4" />
          </button>
          <Link
            to="/"
            className="p-1 flex items-center justify-center rounded-lg text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <LucideSquarePen className="size-4" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col flex-1 bg-zinc-900 rounded-xl h-0">
        <div className="flex flex-col min-h-0 flex-1 px-2 py-3">
          <ThreadList
            threadItems={threadItems}
            activeThreadId={activeThreadId}
            onRequestDelete={onRequestDelete}
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
  const isMobile = useIsMobile();

  const [isOpen, setIsOpen] = useState(!isMobile);
  const [deleteModalThread, setDeleteModalThread] =
    useState<DeleteModalThread | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Close sidebar when switching to mobile
  const prevIsMobile = useRef(isMobile);
  useEffect(() => {
    if (isMobile && !prevIsMobile.current) {
      setIsOpen(false);
    } else if (!isMobile && prevIsMobile.current) {
      setIsOpen(true);
    }
    prevIsMobile.current = isMobile;
  }, [isMobile]);

  const closeSidebar = useCallback(() => setIsOpen(false), []);

  const threadItems = useMemo(
    () => (threads?.page ?? []) as ThreadItem[],
    [threads?.page]
  );

  const onConfirmDelete = async () => {
    if (!deleteModalThread || isDeleting) return;

    const deletingThreadId = deleteModalThread.threadId;
    setIsDeleting(true);

    try {
      await deleteThread({ threadId: deletingThreadId });
      setDeleteModalThread(null);

      if (threadId === deletingThreadId) {
        navigate("/");
      }
    } catch (e) {
      console.error("Failed to delete thread", e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && (
        <div
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${
            isOpen
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      {isMobile ? (
        <div
          className={`fixed top-0 left-0 z-50 h-full p-1 transition-transform duration-200 ease-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarPanel
            threadItems={threadItems}
            activeThreadId={threadId}
            onRequestDelete={(thread) => {
              setDeleteModalThread(thread);
            }}
            onCollapse={closeSidebar}
          />
        </div>
      ) : (
        <div
          className="shrink-0 transition-[width,padding,opacity] duration-200 ease-out overflow-hidden"
          style={{
            width: isOpen ? "calc(18rem + 0.5rem)" : "0",
            padding: isOpen ? "0.25rem" : "0",
            opacity: isOpen ? 1 : 0,
          }}
        >
          <SidebarPanel
            threadItems={threadItems}
            activeThreadId={threadId}
            onRequestDelete={(thread) => {
              setDeleteModalThread(thread);
            }}
            onCollapse={closeSidebar}
          />
        </div>
      )}

      {/* Open button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`absolute top-3 left-3 z-30 p-2 flex items-center justify-center rounded-lg bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all duration-200 cursor-pointer ${
          isOpen
            ? "opacity-0 scale-75 pointer-events-none"
            : "opacity-100 scale-100"
        }`}
      >
        <LucidePanelLeftOpen className="size-4" />
      </button>

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
