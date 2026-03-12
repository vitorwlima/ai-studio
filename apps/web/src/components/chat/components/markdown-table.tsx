import { Check, Copy, Download, Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { cn } from "src/lib/utils";

export const MarkdownTable = ({ children }: { children?: ReactNode }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);

  const getTableText = useCallback(() => {
    if (!tableRef.current) return "";
    const rows = tableRef.current.querySelectorAll("tr");
    return Array.from(rows)
      .map((row) =>
        Array.from(row.querySelectorAll("th, td"))
          .map((cell) => cell.textContent?.trim() ?? "")
          .join("\t")
      )
      .join("\n");
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(getTableText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [getTableText]);

  const handleDownload = useCallback(() => {
    const text = getTableText();
    const blob = new Blob([text], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table.tsv";
    a.click();
    URL.revokeObjectURL(url);
  }, [getTableText]);

  return (
    <div className="rounded-xl border border-zinc-300 bg-zinc-100 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-1.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer p-1 rounded-md hover:bg-zinc-100"
          title={expanded ? "Collapse table" : "Expand table"}
        >
          {expanded ? (
            <Minimize2 className="size-3.5" />
          ) : (
            <Maximize2 className="size-3.5" />
          )}
        </button>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleDownload}
            className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer p-1 rounded-md hover:bg-zinc-100"
            title="Download as TSV"
          >
            <Download className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer p-1 rounded-md hover:bg-zinc-100"
            title="Copy table"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table
          ref={tableRef}
          className={cn(
            "w-full border-collapse text-sm",
            !expanded && "[&_th]:whitespace-nowrap [&_td]:whitespace-nowrap [&_td]:max-w-[400px] [&_td]:truncate [&_th]:max-w-[400px] [&_th]:truncate"
          )}
        >
          {children}
        </table>
      </div>
    </div>
  );
};
