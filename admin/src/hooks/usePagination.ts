import { useState, useCallback } from "react";
import type { PaginationMeta } from "../types";

export const usePagination = () => {
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);

  const goNext = useCallback(() => {
    if (meta?.has_next) setPage((p) => p + 1);
  }, [meta]);

  const goPrev = useCallback(() => {
    if (meta?.has_prev) setPage((p) => p - 1);
  }, [meta]);

  const reset = useCallback(() => {
    setPage(1);
    setMeta(null);
  }, []);

  return {
    page,
    meta,
    loading,
    setLoading,
    setMeta,
    setPage,
    goNext,
    goPrev,
    reset,
  };
};
