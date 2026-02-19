import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AUTO_SCROLL_BUFFER_PX } from "../constants";

type UseAutoScrollOptions = {
  messageCount: number;
};

export const useAutoScroll = ({ messageCount }: UseAutoScrollOptions) => {
  const [needsScrollSpacer, setNeedsScrollSpacer] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);
  const messageCountAtSendRef = useRef<number | null>(null);
  const hasScrolledRef = useRef(false);

  const shouldAutoScroll = () => {
    const container = scrollContainerRef.current;
    const content = scrollContentRef.current;
    if (!container || !content) return false;
    return (
      content.scrollHeight >= container.clientHeight - AUTO_SCROLL_BUFFER_PX
    );
  };

  useEffect(() => {
    if (hasScrolledRef.current || messageCount === 0) return;
    const container = scrollContainerRef.current;
    if (container && shouldAutoScroll()) {
      container.scrollTop = container.scrollHeight;
      hasScrolledRef.current = true;
    }
  }, [messageCount]);

  useLayoutEffect(() => {
    if (
      shouldScrollRef.current &&
      messageCountAtSendRef.current !== null &&
      messageCount > messageCountAtSendRef.current
    ) {
      const container = scrollContainerRef.current;
      const userMessage = lastUserMessageRef.current;

      if (container && userMessage) {
        const containerRect = container.getBoundingClientRect();
        const messageRect = userMessage.getBoundingClientRect();
        const offsetFromContainerTop = messageRect.top - containerRect.top;
        const targetScrollTop = container.scrollTop + offsetFromContainerTop;
        const maxScrollTop = container.scrollHeight - container.clientHeight;

        container.scrollTop = Math.max(
          0,
          Math.min(targetScrollTop, maxScrollTop)
        );
      }

      shouldScrollRef.current = false;
      messageCountAtSendRef.current = null;
    }
  }, [messageCount]);

  const onSend = useCallback(() => {
    const enableAutoScroll = shouldAutoScroll();
    shouldScrollRef.current = enableAutoScroll;
    messageCountAtSendRef.current = messageCount;
    setNeedsScrollSpacer(enableAutoScroll);
  }, [messageCount]);

  return {
    scrollContainerRef,
    scrollContentRef,
    lastUserMessageRef,
    needsScrollSpacer,
    onSend,
  };
};
