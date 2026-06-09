import {
  Check,
  ChevronRight,
  Loader2,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { cn } from "src/lib/utils";
import type { ChatMessage } from "../types";

type Part = ChatMessage["parts"][number];

const prettyToolName = (part: Part) => {
  const raw = part.toolName ?? part.type.replace(/^tool-/, "");
  return raw.replace(/[_-]+/g, " ").replace(/^\w/, (c) => c.toUpperCase());
};

const stringify = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

/** Extract readable text from an MCP tool result, falling back to JSON. */
const formatOutput = (output: unknown): string => {
  if (output == null) return "";
  if (typeof output === "string") return output;
  // MCP tool results commonly look like { content: [{ type: "text", text }] }
  const content = (output as { content?: unknown }).content;
  if (Array.isArray(content)) {
    const text = content
      .map((c) =>
        c && typeof c === "object" && "text" in c
          ? String((c as { text: unknown }).text)
          : stringify(c)
      )
      .join("\n")
      .trim();
    if (text) return text;
  }
  return stringify(output);
};

export const ToolCallBlock = ({ part }: { part: Part }) => {
  const [open, setOpen] = useState(false);

  const name = prettyToolName(part);
  const isError = part.state === "output-error";
  const hasOutput =
    part.output !== undefined && part.output !== null && !isError;
  const isRunning = !hasOutput && !isError;

  const hasInput = part.input && Object.keys(part.input).length > 0;

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group/tool flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-all duration-200 cursor-pointer",
          "border border-zinc-200/80 hover:border-zinc-300",
          open
            ? "bg-zinc-100 text-zinc-700"
            : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-600"
        )}
      >
        {isRunning ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-sky-500" />
        ) : isError ? (
          <TriangleAlert className="size-3.5 shrink-0 text-red-500" />
        ) : (
          <Wrench
            className={cn(
              "size-3.5 shrink-0 transition-colors",
              open
                ? "text-sky-500"
                : "text-zinc-400 group-hover/tool:text-sky-400"
            )}
          />
        )}

        <span className="font-medium">
          {isRunning ? "Running" : isError ? "Failed" : "Called"}
        </span>
        <span className="truncate font-mono text-[11px] text-zinc-500">
          {name}
        </span>

        {isRunning && (
          <span className="ml-0.5 inline-flex items-center gap-0.5">
            <span className="size-1 rounded-full bg-sky-400 animate-[bounce_1.4s_ease-in-out_infinite]" />
            <span className="size-1 rounded-full bg-sky-400 animate-[bounce_1.4s_ease-in-out_0.2s_infinite]" />
            <span className="size-1 rounded-full bg-sky-400 animate-[bounce_1.4s_ease-in-out_0.4s_infinite]" />
          </span>
        )}
        {!isRunning && !isError && (
          <Check className="size-3 text-emerald-500" />
        )}

        <ChevronRight
          className={cn(
            "ml-auto size-3 shrink-0 transition-transform duration-200",
            open && "rotate-90"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-250 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-2 ml-1 flex flex-col gap-3 rounded-lg border border-zinc-200/60 bg-gradient-to-b from-zinc-50/80 to-white px-4 py-3">
            {hasInput && (
              <Section label="Arguments">
                <CodeBox>{stringify(part.input)}</CodeBox>
              </Section>
            )}
            {isError ? (
              <Section label="Error">
                <p className="text-xs leading-relaxed text-red-600">
                  {part.errorText ?? "The tool call failed."}
                </p>
              </Section>
            ) : hasOutput ? (
              <Section label="Result">
                <CodeBox>{formatOutput(part.output)}</CodeBox>
              </Section>
            ) : (
              <p className="text-xs text-zinc-400">Waiting for result…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
      {label}
    </span>
    {children}
  </div>
);

const CodeBox = ({ children }: { children: string }) => (
  <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md bg-zinc-900/90 px-3 py-2 font-mono text-[11px] leading-relaxed text-zinc-100">
    {children}
  </pre>
);
