import axios from "axios";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const collectMessages = (value: unknown, messages: string[]) => {
  if (value == null) return;

  if (typeof value === "string") {
    const message = value.trim();
    if (message) messages.push(message);
    return;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    messages.push(String(value));
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectMessages(item, messages));
    return;
  }

  if (!isRecord(value)) return;

  for (const nested of Object.values(value)) {
    collectMessages(nested, messages);
  }
};

export const getApiErrorPayload = (
  error: unknown,
  fallback = "Something went wrong",
) => {
  const payload = axios.isAxiosError(error) ? error.response?.data : error;
  const message =
    isRecord(payload) && typeof payload.message === "string" && payload.message.trim()
      ? payload.message.trim()
      : error instanceof Error && error.message.trim()
        ? error.message.trim()
        : fallback;

  const details: string[] = [];
  if (isRecord(payload) && "errors" in payload) {
    collectMessages(payload.errors, details);
  }

  return {
    message,
    details: Array.from(new Set(details)),
  };
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong",
) => {
  return getApiErrorPayload(error, fallback).message;
};
