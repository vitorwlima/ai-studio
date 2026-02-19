import { api } from "@convex/api";
import { useMutation, useQuery } from "convex/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { useNavigate } from "react-router";
import type { ReasoningEffort, SavedModel } from "../types";

type UseChatComposerOptions = {
  threadId: string | undefined;
  onSend: () => void;
};

export type UseChatComposerResult = {
  selectedModelCode: string | null;
  selectedModelIsSaved: boolean;
  isSavingSelectedModel: boolean;
  modelsForMenu: string[];
  savedModelCodes: string[];
  savedModelsLoaded: boolean;
  isSavingModel: boolean;
  deletingModelCode: string | null;
  addModel: (modelCode: string) => void;
  deleteModel: (modelCode: string) => void;
  saveSelectedModel: () => void;
  selectModel: (modelCode: string) => void;
  selectedReasoningEffort: ReasoningEffort;
  setSelectedReasoningEffort: (effort: ReasoningEffort) => void;
  input: string;
  setInput: (value: string) => void;
  canSend: boolean;
  inputDisabled: boolean;
  inputPlaceholder: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  resizeTextarea: () => void;
  hasApiKey: boolean | undefined;
  handleSubmit: (e?: FormEvent<HTMLFormElement>) => Promise<void>;
  selectSuggestion: (suggestion: string) => void;
};

export const useChatComposer = ({
  threadId,
  onSend,
}: UseChatComposerOptions): UseChatComposerResult => {
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
    () => (savedModels ?? []).map((model) => model.modelCode),
    [savedModels]
  );

  const selectedModelIsSaved = selectedModelCode
    ? savedModelCodes.includes(selectedModelCode)
    : false;

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  useEffect(() => {
    initializedSelectionRef.current = false;
  }, [threadId]);

  useEffect(() => {
    if (initializedSelectionRef.current) return;
    if (savedModels === undefined) return;
    if (threadId && threadLastModelCode === undefined) return;
    if (threadId && threadLastReasoningEffort === undefined) return;

    const firstSavedModelCode = savedModels[0]?.modelCode ?? null;
    let nextSelectedModelCode = selectedModelCode;
    let nextReasoningEffort = selectedReasoningEffort;

    if (threadId) {
      if (threadLastModelCode) {
        nextSelectedModelCode = threadLastModelCode;
      } else if (!nextSelectedModelCode) {
        nextSelectedModelCode = firstSavedModelCode;
      }

      if (threadLastReasoningEffort) {
        nextReasoningEffort = threadLastReasoningEffort;
      }
    } else if (!nextSelectedModelCode) {
      nextSelectedModelCode = firstSavedModelCode;
    }

    if (nextSelectedModelCode !== selectedModelCode) {
      setSelectedModelCode(nextSelectedModelCode);
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

  const handleSubmit = useCallback(
    async (e?: FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      if (!input.trim() || !selectedModelCode || hasApiKey !== true) return;

      const message = input;
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      onSend();

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
      onSend,
      sendMessage,
      threadId,
      selectedReasoningEffort,
      navigate,
    ]
  );

  const selectSuggestion = useCallback(
    (suggestion: string) => {
      setInput(suggestion);
      textareaRef.current?.focus();
      resizeTextarea();
    },
    [resizeTextarea]
  );

  const inputDisabled = hasApiKey === false;
  const canSend = !!input.trim() && hasApiKey === true && !!selectedModelCode;
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

  return {
    selectedModelCode,
    selectedModelIsSaved,
    isSavingSelectedModel,
    modelsForMenu,
    savedModelCodes,
    savedModelsLoaded: savedModels !== undefined,
    isSavingModel,
    deletingModelCode,
    addModel: (modelCode: string) => void addModel(modelCode),
    deleteModel: (modelCode: string) => void deleteModel(modelCode),
    saveSelectedModel: () => void saveSelectedModel(),
    selectModel: (modelCode: string) => setSelectedModelCode(modelCode),
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
    handleSubmit,
    selectSuggestion,
  };
};
