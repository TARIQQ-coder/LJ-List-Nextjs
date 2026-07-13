import { clsx, type ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const formatCurrency = (amount: number | string): string => {
  const numeric =
    typeof amount === "number"
      ? amount
      : Number(String(amount).replace(/[^0-9.-]/g, ""));

  return `GHC ${Number.isFinite(numeric) ? numeric.toLocaleString() : "0"}`;
};

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "pending":
      return "text-yellow-400";
    case "reviewed":
      return "text-blue-400";
    case "approved":
      return "text-green-400";
    case "declined":
      return "text-red-400";
    default:
      return "text-surface-muted";
  }
};
