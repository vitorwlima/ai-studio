import * as Dialog from "@radix-ui/react-dialog";
import type { DeleteModalThread } from "../types";

type DeleteThreadModalProps = {
  deleteModalThread: DeleteModalThread | null;
  isDeleting: boolean;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => void;
};

export const DeleteThreadModal = ({
  deleteModalThread,
  isDeleting,
  onCloseDeleteModal,
  onConfirmDelete,
}: DeleteThreadModalProps) => {
  return (
    <Dialog.Root
      open={!!deleteModalThread}
      onOpenChange={(open) => {
        if (!open) onCloseDeleteModal();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl animate-fade-in">
          <Dialog.Title className="text-base font-semibold text-zinc-900">
            Delete thread?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-zinc-600">
            This permanently deletes <strong>{deleteModalThread?.title}</strong> and
            all its messages. This action cannot be undone.
          </Dialog.Description>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCloseDeleteModal}
              disabled={isDeleting}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors cursor-pointer hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={isDeleting}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white transition-colors cursor-pointer hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
