import { api } from "@convex/api";
import { useMutation, useQuery } from "convex/react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useNavigate } from "react-router";
import type { ReasoningEffort, SavedModel } from "../types";

type ChatContextValue = {
  // Model state
  selectedModelCode: string | null;
  selectedModelIsSaved: boolean;
  isSavingSelectedModel: boolean;
  modelsForMenu: string[];
  savedModelCodes: string[];
  savedModelsLoaded: boolean;
  isSavingModel: boolean;
  deletingModelCode: string | null;
  // Model actions
  addModel: (modelCode: string) => void;
  deleteModel: (modelCode: string) => void;
  saveSelectedModel: () => void;
  selectModel: (modelCode: string) => void;
  // Reasoning
  selectedReasoningEffort: ReasoningEffort;
  setSelectedReasoningEffort: (effort: ReasoningEffort) => void;
  // Composer
  input: string;
  setInput: (value: string) => void;
  canSend: boolean;
  inputDisabled: boolean;
  inputPlaceholder: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  resizeTextarea: () => void;
  // Submit
  hasApiKey: boolean | undefined;
  handleSubmit: (e?: FormEvent<HTMLFormElement>) => void;
  // Auto-scroll
  onSend: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};

type ChatProviderProps = {
  threadId: string | undefined;
  children: ReactNode;
};

export const ChatProvider = ({ threadId, children }: ChatProviderProps) => {
  const [selectedModelCode, setSelectedModelCode] = useState<string | null>(
    null
  );
  const [selectedReasoningEffort, setSelectedReasoningEffort] =
    useState<ReasoningEffort>("low");
  const [input, setInput] = useState("");
  const [isSavingModel, setIsSavingModel] = useState(false);
  const [isSavingSelectedModel, setIsSavingSelectedModel] = useState(false);
  const [deletingModelCode, setDeletingModelCode] = useState<string | null>(
    null
  );
  const initializedSelectionRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const onSendRef = useRef<() => void>(() => {});
  const navigate = useNavigate();
  const sendMessage = useMutation(api.messages.sendMessage);
  const saveUserModel = useMutation(api.models.saveUserModel);
  const deleteUserModel = useMutation(api.models.deleteUserModel);
  const hasApiKey = useQuery(api.settings.hasApiKey);
  const savedModels = useQuery(api.models.listUserModels) as
    | SavedModel[]
    | undefined;
  const threadLastModelCode = useQuery(
    api.threads.getThreadLastModelCode,
    threadId ? { threadId } : "skip"
  );
  const threadLastReasoningEffort = useQuery(
    api.threads.getThreadLastReasoningEffort,
    threadId ? { threadId } : "skip"
  );

  const savedModelCodes = useMemo(
    () => (savedModels ?? []).map((m) => m.modelCode),
    [savedModels]
  );
  const selectedModelIsSaved = selectedModelCode
    ? savedModelCodes.includes(selectedModelCode)
    : false;

  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, []);

  // Initialize model selection from thread or saved models
  useEffect(() => {
    initializedSelectionRef.current = false;
  }, [threadId]);

  useEffect(() => {
    if (initializedSelectionRef.current) return;
    if (savedModels === undefined) return;
    if (threadId && threadLastModelCode === undefined) return;
    if (threadId && threadLastReasoningEffort === undefined) return;

    const firstSavedModelCode = savedModels[0]?.modelCode ?? null;
    let nextSelection = selectedModelCode;
    let nextReasoningEffort = selectedReasoningEffort;

    if (threadId) {
      if (threadLastModelCode) {
        nextSelection = threadLastModelCode;
      } else if (!nextSelection) {
        nextSelection = firstSavedModelCode;
      }
      if (threadLastReasoningEffort) {
        nextReasoningEffort = threadLastReasoningEffort;
      }
    } else if (!nextSelection) {
      nextSelection = firstSavedModelCode;
    }

    if (nextSelection !== selectedModelCode) {
      setSelectedModelCode(nextSelection);
    }
    if (nextReasoningEffort !== selectedReasoningEffort) {
      setSelectedReasoningEffort(nextReasoningEffort);
    }

    initializedSelectionRef.current = true;
  }, [
    savedModels,
    selectedModelCode,
    selectedReasoningEffort,
    threadId,
    threadLastModelCode,
    threadLastReasoningEffort,
  ]);

  const addModel = useCallback(
    async (modelCode: string) => {
      setIsSavingModel(true);
      try {
        await saveUserModel({ modelCode });
        setSelectedModelCode(modelCode);
      } finally {
        setIsSavingModel(false);
      }
    },
    [saveUserModel]
  );

  const deleteModel = useCallback(
    async (modelCode: string) => {
      setDeletingModelCode(modelCode);
      try {
        await deleteUserModel({ modelCode });
      } finally {
        setDeletingModelCode(null);
      }
    },
    [deleteUserModel]
  );

  const saveSelectedModel = useCallback(async () => {
    if (!selectedModelCode) return;
    setIsSavingSelectedModel(true);
    try {
      await saveUserModel({ modelCode: selectedModelCode });
    } finally {
      setIsSavingSelectedModel(false);
    }
  }, [selectedModelCode, saveUserModel]);

  const selectModel = useCallback((modelCode: string) => {
    setSelectedModelCode(modelCode);
  }, []);

  const handleSubmit = useCallback(
    async (e?: FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      if (!input.trim() || !selectedModelCode || hasApiKey !== true) return;

      const message = input;
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      onSendRef.current();

      const result = await sendMessage({
        prompt: message,
        threadId,
        modelCode: selectedModelCode,
        reasoningEffort: selectedReasoningEffort,
      });

      if (!threadId && result?.threadId) {
        navigate(`/chat/${result.threadId}`);
      }
    },
    [
      input,
      selectedModelCode,
      hasApiKey,
      sendMessage,
      threadId,
      selectedReasoningEffort,
      navigate,
    ]
  );

  const inputDisabled = hasApiKey === false;
  const canSend =
    !!input.trim() && hasApiKey === true && !!selectedModelCode;
  const inputPlaceholder =
    hasApiKey === false
      ? "Add an API key in settings to start chatting..."
      : selectedModelCode
        ? "Your prompt here..."
        : "Select a model to start chatting...";
  const modelsForMenu =
    selectedModelCode && !selectedModelIsSaved
      ? [selectedModelCode, ...savedModelCodes]
      : savedModelCodes;

  const value = useMemo(
    (): ChatContextValue => ({
      selectedModelCode,
      selectedModelIsSaved,
      isSavingSelectedModel,
      modelsForMenu,
      savedModelCodes,
      savedModelsLoaded: savedModels !== undefined,
      isSavingModel,
      deletingModelCode,
      addModel: (code: string) => void addModel(code),
      deleteModel: (code: string) => void deleteModel(code),
      saveSelectedModel: () => void saveSelectedModel(),
      selectModel,
      selectedReasoningEffort,
      setSelectedReasoningEffort,
      input,
      setInput,
      canSend,
      inputDisabled,
      inputPlaceholder,
      textareaRef,
      resizeTextarea,
      hasApiKey,
      handleSubmit: (e?: FormEvent<HTMLFormElement>) => void handleSubmit(e),
      onSend: () => onSendRef.current(),
    }),
    [
      selectedModelCode,
      selectedModelIsSaved,
      isSavingSelectedModel,
      modelsForMenu,
      savedModelCodes,
      savedModels,
      isSavingModel,
      deletingModelCode,
      addModel,
      deleteModel,
      saveSelectedModel,
      selectModel,
      selectedReasoningEffort,
      input,
      canSend,
      inputDisabled,
      inputPlaceholder,
      resizeTextarea,
      hasApiKey,
      handleSubmit,
    ]
  );

  return (
    <ChatContext.Provider value={value}>
      <ChatOnSendRef.Provider value={onSendRef}>
        {children}
      </ChatOnSendRef.Provider>
    </ChatContext.Provider>
  );
};

// Expose the ref so ChatContainer can register the auto-scroll callback
export const ChatOnSendRef = createContext<React.RefObject<() => void> | null>(null);

export const useChatOnSendRef = () => {
  const ref = useContext(ChatOnSendRef);
  if (!ref) throw new Error("useChatOnSendRef must be used within ChatProvider");
  return ref;
};
