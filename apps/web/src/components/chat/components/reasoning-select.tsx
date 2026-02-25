import * as Select from "@radix-ui/react-select";
import { LucideCheck, LucideChevronDown } from "lucide-react";
import type { ReasoningEffort } from "../types";

const options: { value: ReasoningEffort; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

type ReasoningSelectProps = {
  selectedReasoningEffort: ReasoningEffort;
  onReasoningChange: (effort: ReasoningEffort) => void;
};

export const ReasoningSelect = ({
  selectedReasoningEffort,
  onReasoningChange,
}: ReasoningSelectProps) => {
  return (
    <Select.Root value={selectedReasoningEffort} onValueChange={onReasoningChange}>
      <Select.Trigger className="flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer outline-none">
        <Select.Value>Reasoning: {selectedReasoningEffort}</Select.Value>
        <Select.Icon>
          <LucideChevronDown className="size-3 text-zinc-500" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          side="top"
          sideOffset={8}
          className="z-50 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg animate-fade-in"
        >
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="flex items-center justify-between gap-4 rounded-lg px-3 py-1.5 text-xs text-zinc-700 cursor-pointer outline-none data-[highlighted]:bg-zinc-100 transition-colors"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <LucideCheck className="size-3 text-zinc-500" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
