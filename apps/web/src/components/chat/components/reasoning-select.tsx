import * as Select from "@radix-ui/react-select";
import { BrainCircuit, LucideCheck, LucideChevronDown } from "lucide-react";
import { cn } from "src/lib/utils";
import type { ReasoningEffort } from "../types";

const options: {
  value: ReasoningEffort;
  label: string;
  description: string;
}[] = [
  { value: "off", label: "Off", description: "No reasoning" },
  { value: "low", label: "Low", description: "Quick thinking" },
  { value: "medium", label: "Medium", description: "Balanced" },
  { value: "high", label: "High", description: "Deep reasoning" },
];

type ReasoningSelectProps = {
  selectedReasoningEffort: ReasoningEffort;
  onReasoningChange: (effort: ReasoningEffort) => void;
};

export const ReasoningSelect = ({
  selectedReasoningEffort,
  onReasoningChange,
}: ReasoningSelectProps) => {
  const isActive = selectedReasoningEffort !== "off";

  return (
    <Select.Root
      value={selectedReasoningEffort}
      onValueChange={onReasoningChange}
    >
      <Select.Trigger
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] transition-colors cursor-pointer outline-none",
          "bg-zinc-800 hover:bg-zinc-750",
          isActive ? "text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
        )}
      >
        <BrainCircuit
          className={cn(
            "size-3 shrink-0 transition-colors duration-200",
            isActive ? "text-violet-400" : "text-zinc-600"
          )}
        />
        <Select.Value>
          {isActive ? selectedReasoningEffort : "Off"}
        </Select.Value>
        <Select.Icon>
          <LucideChevronDown className="size-2.5 text-zinc-500" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          side="top"
          sideOffset={8}
          className="z-50 min-w-[180px] rounded-xl border border-zinc-200 bg-white p-1 shadow-lg animate-fade-in"
        >
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs cursor-pointer outline-none data-[highlighted]:bg-zinc-100 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <Select.ItemText>
                    <span className="font-medium text-zinc-800">
                      {option.label}
                    </span>
                  </Select.ItemText>
                  <span className="text-[10px] text-zinc-400">
                    {option.description}
                  </span>
                </div>
                <Select.ItemIndicator className="ml-auto">
                  <LucideCheck className="size-3.5 text-zinc-600" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
