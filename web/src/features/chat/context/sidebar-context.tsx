import { api } from "@convex/api";
import { useAction, useMutation } from "convex/react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, useParams } from "react-router";
import type { DeleteModalThread, ThreadItem } from "../types";

type SidebarContextValue = {
  activeThreadId: string | undefined;
  editingThreadId: string | null;
  editingTitle: string;
  isRenaming: boolean;
  deleteModalThread: DeleteModalThread | null;
  isDeleting: boolean;
  threadActionError: string | null;
  onStartEditing: (threadId: string, currentTitle: string) => void;
  onEditingTitleChange: (value: string) => void;
  onSaveEditing: (thread: ThreadItem, originalTitle: string) => Promise<void>;
  onCancelEditing: () => void;
  onNavigate: (threadId: string) => void;
  onOpenDeleteModal: (thread: DeleteModalThread) => void;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
};

type SidebarProviderProps = {
  threadItems: ThreadItem[];
  children: ReactNode;
};

export const SidebarProvider = ({
  threadItems,
  children,
}: SidebarProviderProps) => {
  const { threadId } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!editingThreadId) return;
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

  const onStartEditing = (targetThreadId: string, currentTitle: string) => {
    setThreadActionError(null);
    setEditingThreadId(targetThreadId);
    setEditingTitle(currentTitle);
  };

  const onCancelEditing = () => {
    if (isRenaming) return;
    clearEditingState();
  };

  const onSaveEditing = async (thread: ThreadItem, originalTitle: string) => {
    if (editingThreadId !== thread._id || isRenaming) return;

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

  const onConfirmDelete = async () => {
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

  const value = useMemo(
    (): SidebarContextValue => ({
      activeThreadId: threadId,
      editingThreadId,
      editingTitle,
      isRenaming,
      deleteModalThread,
      isDeleting,
      threadActionError,
      onStartEditing,
      onEditingTitleChange: setEditingTitle,
      onSaveEditing,
      onCancelEditing,
      onNavigate: (id: string) => navigate(`/chat/${id}`),
      onOpenDeleteModal: (thread: DeleteModalThread) => {
        setThreadActionError(null);
        setDeleteModalThread(thread);
      },
      onCloseDeleteModal: () => {
        if (!isDeleting) setDeleteModalThread(null);
      },
      onConfirmDelete: () => void onConfirmDelete(),
    }),
    [
      threadId,
      editingThreadId,
      editingTitle,
      isRenaming,
      deleteModalThread,
      isDeleting,
      threadActionError,
      navigate,
    ]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};
