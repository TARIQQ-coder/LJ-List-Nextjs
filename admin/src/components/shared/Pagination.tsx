import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "../../types";

interface PaginationProps {
  meta: PaginationMeta | null;
  onNext: () => void;
  onPrev: () => void;
}

export const Pagination = ({ meta, onNext, onPrev }: PaginationProps) => {
  if (!meta || meta.total_pages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-border">
      <span className="text-xs text-surface-muted">
        Page {meta.page} of {meta.total_pages}
        <span className="ml-2">({meta.total} total)</span>
      </span>

      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={!meta.has_prev}
          className="bg-surface-raised text-white border border-surface-border px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-surface-overlay transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-2 cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={onNext}
          disabled={!meta.has_next}
          className="bg-surface-raised text-white border border-surface-border px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-surface-overlay transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-2 cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
