import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
}: SearchInputProps) => (
  <div className="relative">
    <Search
      size={16}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted"
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-8"
    />
    {value && (
      <button
        onClick={() => onChange("")}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-muted cursor-pointer hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-1 rounded cursor-pointer"
      >
        <X size={14} />
      </button>
    )}
  </div>
);
