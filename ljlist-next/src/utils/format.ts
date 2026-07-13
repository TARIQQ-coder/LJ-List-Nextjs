export const fmt = (n: number | string | null | undefined) => `GH₵${Number(n || 0).toLocaleString()}`
export const disc = (p: number, op?: number | null) => op ? Math.max(0, Math.round(((op - p) / op) * 100)) : 0
