import { useState, useRef } from "react";
import { Calendar } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const DatePicker = ({
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
}: DatePickerProps) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    inputRef.current?.showPicker?.();
    inputRef.current?.focus();
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`flex items-center gap-2 bg-surface-raised border rounded-lg px-4 py-2 cursor-pointer transition-colors ${
        focused
          ? "border-white"
          : "border-surface-border hover:border-surface-muted"
      }`}
    >
      <Calendar size={14} className="text-surface-muted shrink-0" />
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="bg-transparent border-none p-0 text-sm text-white focus:outline-none cursor-pointer w-full [color-scheme:dark]"
        placeholder={placeholder}
      />
    </div>
  );
};
