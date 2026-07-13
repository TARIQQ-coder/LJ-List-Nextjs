import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const ranges = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom Range" },
];

interface RangeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const RangeSelect = ({ value, onChange }: RangeSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = ranges.find((r) => r.value === value) || ranges[1];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-surface-raised border border-surface-border rounded-lg px-4 py-2 text-sm text-white cursor-pointer hover:border-surface-muted transition-colors"
      >
        {selected.label}
        <ChevronDown
          size={14}
          className={`text-surface-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-2 w-44 bg-surface-raised border border-surface-border rounded-xl p-1 shadow-xl z-20"
          >
            {ranges.map((range) => (
              <button
                key={range.value}
                onClick={() => {
                  onChange(range.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                  value === range.value
                    ? "bg-white/10 text-white"
                    : "text-surface-muted hover:text-white hover:bg-surface-overlay"
                }`}
              >
                {range.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
