import { useEffect, useLayoutEffect, useRef, useState } from "react";

type UseAutoScrollOptions = {
  messageCount: number;
};

export function useAutoScroll({ messageCount }: UseAutoScrollOptions) {
  const [needsScrollSpacer, setNeedsScrollSpacer] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);
  const messageCountAtSendRef = useRef<number | null>(null);
  const hasScrolledRef = useRef(false);

  // Scroll to bottom on initial load / thread switch
  useEffect(() => {
    if (hasScrolledRef.current || messageCount === 0) return;
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
      hasScrolledRef.current = true;
    }
  }, [messageCount]);

  // Scroll user message to top after sending
  useLayoutEffect(() => {
    if (
      shouldScrollRef.current &&
      messageCountAtSendRef.current !== null &&
      messageCount > messageCountAtSendRef.current &&
      lastUserMessageRef.current
    ) {
      lastUserMessageRef.current.scrollIntoView({
        behavior: "instant",
        block: "start",
      });
      shouldScrollRef.current = false;
      messageCountAtSendRef.current = null;
    }
  }, [messageCount]);

  const onSend = () => {
    shouldScrollRef.current = true;
    messageCountAtSendRef.current = messageCount;
    setNeedsScrollSpacer(true);
  };

  return {
    scrollContainerRef,
    lastUserMessageRef,
    needsScrollSpacer,
    onSend,
  };
}
