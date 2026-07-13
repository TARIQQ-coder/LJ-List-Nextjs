import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  badge?: string;
  tooltip?: string;
}

interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  buttonClassName?: string;
  menuClassName?: string;
}

export const SelectDropdown = ({
  value,
  onChange,
  options,
  placeholder = "Select",
  disabled = false,
  buttonClassName,
  menuClassName,
}: SelectDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((option) => option.value === value);
  const selectedBadge = selected?.badge;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "w-full flex items-center justify-between gap-2 bg-surface-raised border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white cursor-pointer hover:border-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
          buttonClassName,
        )}
      >
        <span className={cn(!selected && "text-surface-muted")}>
          {selected?.label ?? placeholder}
          {selectedBadge ? (
            <span className="ml-2 rounded-full border border-yellow-500/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-normal text-yellow-300">
              {selectedBadge}
            </span>
          ) : null}
        </span>
        <ChevronDown
          size={14}
          className={`text-surface-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "absolute z-20 mt-2 w-full rounded-xl border border-surface-border bg-surface-raised p-1 shadow-xl",
              menuClassName,
            )}
          >
            {options.map((option) => {
              const isSelected = value === option.value;
              const optionClassName = option.disabled
                ? "cursor-not-allowed text-surface-muted opacity-60"
                : isSelected
                  ? "bg-white/10 text-white"
                  : "text-surface-muted hover:bg-surface-overlay hover:text-white";

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-disabled={option.disabled}
                  title={option.disabled ? option.tooltip : undefined}
                  onClick={() => {
                    if (option.disabled) return;
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "group relative w-full text-left rounded-lg px-3 py-2 text-sm transition-colors",
                    optionClassName,
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate">{option.label}</span>
                    {option.badge ? (
                      <span className="shrink-0 rounded-full border border-yellow-500/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-normal text-yellow-300">
                        {option.badge}
                      </span>
                    ) : null}
                  </span>
                  {option.description && (
                    <span className="mt-0.5 block text-xs text-surface-muted">
                      {option.description}
                    </span>
                  )}
                  {option.disabled && option.tooltip ? (
                    <span className="pointer-events-none absolute right-2 top-full z-30 mt-1 hidden max-w-60 rounded-lg border border-surface-border bg-black px-3 py-2 text-xs leading-5 text-white shadow-xl group-hover:block">
                      {option.tooltip}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
