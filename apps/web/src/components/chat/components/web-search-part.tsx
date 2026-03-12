import * as Popover from "@radix-ui/react-popover";
import { useCallback, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "../types";

type WebSearchResult = {
  title: string;
  url: string;
  highlights?: string[];
};

type WebSearchSourcesProps = {
  parts: ChatMessage["parts"];
};

const MAX_VISIBLE = 3;
const CLOSE_DELAY = 120;

const POPOVER_CONTENT_CLASS =
  "z-50 rounded-lg border border-zinc-200 bg-white px-1 py-1 shadow-md w-56 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out";

export const WebSearchSources = ({ parts }: WebSearchSourcesProps) => {
  const webParts = parts.filter((p) => p.type === "tool-webSearch");
  const isAnyLoading = webParts.some((p) => p.state !== "output-available");

  const allResults = useMemo(() => {
    const seen = new Set<string>();
    const results: WebSearchResult[] = [];
    for (const part of webParts) {
      const items = (part.output as { results?: WebSearchResult[] })?.results;
      if (!items) continue;
      for (const item of items) {
        if (!seen.has(item.url)) {
          seen.add(item.url);
          results.push(item);
        }
      }
    }
    return results;
  }, [webParts]);

  // Single hover state shared across all items
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>();

  const onEnter = useCallback((key: string) => {
    clearTimeout(closeTimeout.current);
    setActiveKey(key);
  }, []);

  const onLeave = useCallback(() => {
    closeTimeout.current = setTimeout(
      () => setActiveKey(null),
      CLOSE_DELAY,
    );
  }, []);

  if (isAnyLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500 py-1.5 mt-2">
        <span className="inline-block w-3 h-3 border-2 border-zinc-300 border-t-zinc-500 rounded-full animate-spin" />
        Searching the web...
      </div>
    );
  }

  if (!allResults.length) return null;

  const visible = allResults.slice(0, MAX_VISIBLE);
  const overflowCount = allResults.length - MAX_VISIBLE;

  return (
    <div className="flex items-center gap-2 mt-3">
      <div className="flex items-center -space-x-1">
        {visible.map((result) => (
          <SourceFavicon
            key={result.url}
            result={result}
            isOpen={activeKey === result.url}
            onEnter={() => onEnter(result.url)}
            onLeave={onLeave}
          />
        ))}
        {overflowCount > 0 && (
          <OverflowBubble
            count={overflowCount}
            results={allResults.slice(MAX_VISIBLE)}
            isOpen={activeKey === "__overflow"}
            onEnter={() => onEnter("__overflow")}
            onLeave={onLeave}
          />
        )}
      </div>
      <span className="text-[11px] text-zinc-400">Sources</span>
    </div>
  );
};

const SourceFavicon = ({
  result,
  isOpen,
  onEnter,
  onLeave,
}: {
  result: WebSearchResult;
  isOpen: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) => {
  const hostname = new URL(result.url).hostname;

  return (
    <Popover.Root open={isOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          className="relative w-5 h-5 rounded-full border border-zinc-200 bg-white flex items-center justify-center hover:border-zinc-400 hover:z-10 transition-colors cursor-pointer"
        >
          <img
            src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
            alt=""
            className="w-3 h-3 rounded-sm"
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={4}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={POPOVER_CONTENT_CLASS}
        >
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-50 transition-colors"
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
              alt=""
              className="w-3 h-3 rounded-sm shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs text-zinc-700 truncate">{result.title}</p>
              <p className="text-[10px] text-zinc-400 truncate">{hostname}</p>
            </div>
          </a>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const OverflowBubble = ({
  count,
  results,
  isOpen,
  onEnter,
  onLeave,
}: {
  count: number;
  results: WebSearchResult[];
  isOpen: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) => (
  <Popover.Root open={isOpen}>
    <Popover.Trigger asChild>
      <button
        type="button"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="relative w-5 h-5 rounded-full border border-zinc-200 bg-zinc-100 flex items-center justify-center hover:border-zinc-400 hover:z-10 transition-colors cursor-pointer"
      >
        <span className="text-[8px] font-semibold text-zinc-500 leading-none">
          +{count}
        </span>
      </button>
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content
        side="top"
        sideOffset={4}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={`${POPOVER_CONTENT_CLASS} max-h-52 overflow-y-auto`}
      >
        {results.map((result) => {
          const hostname = new URL(result.url).hostname;
          return (
            <a
              key={result.url}
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-50 transition-colors"
            >
              <img
                src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                alt=""
                className="w-3 h-3 rounded-sm shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs text-zinc-700 truncate">
                  {result.title}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  {hostname}
                </p>
              </div>
            </a>
          );
        })}
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
);
