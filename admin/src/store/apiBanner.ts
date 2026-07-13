import { create } from "zustand";

export type ApiBannerVariant = "success" | "error";

export interface ApiBannerMessage {
  id: number;
  variant: ApiBannerVariant;
  message: string;
  details: string[];
  durationMs: number;
}

interface ApiBannerState {
  current: ApiBannerMessage | null;
  show: (message: Omit<ApiBannerMessage, "id" | "durationMs"> & {
    durationMs?: number;
  }) => void;
  dismiss: (id?: number) => void;
}

export const useApiBannerStore = create<ApiBannerState>((set, get) => ({
  current: null,
  show: ({ durationMs = 5000, ...message }) => {
    set({
      current: {
        ...message,
        id: Date.now(),
        durationMs,
      },
    });
  },
  dismiss: (id) => {
    const current = get().current;
    if (id !== undefined && current?.id !== id) return;
    set({ current: null });
  },
}));
