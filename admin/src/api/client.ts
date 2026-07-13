import axios from "axios";
import { useAuthStore } from "../store/auth";
import { useApiBannerStore } from "../store/apiBanner";
import { getApiErrorPayload } from "../lib/apiError";

const client = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const API_BANNER_DURATION_MS = 5000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getResponseMessage = (data: unknown) => {
  if (!isRecord(data)) return "";
  return typeof data.message === "string" ? data.message.trim() : "";
};

const getSuccessMessage = (method: string, data: unknown) => {
  const responseMessage = getResponseMessage(data);
  if (responseMessage) return responseMessage;

  return isMutationMethod(method)
    ? "Request completed successfully"
    : "";
};

const isMutationMethod = (method: string) =>
  ["post", "patch", "put", "delete"].includes(method);

const notifySuccess = (method: string, url: string, data: unknown) => {
  if (!isMutationMethod(method)) return;
  if (url.includes("/auth/refresh")) return;

  const message = getSuccessMessage(method, data);
  if (!message) return;

  useApiBannerStore.getState().show({
    variant: "success",
    message,
    details: [],
    durationMs: API_BANNER_DURATION_MS,
  });
};

const notifyError = (error: unknown, method: string) => {
  if (!isMutationMethod(method)) return;

  const apiError = getApiErrorPayload(error, "Request failed");
  useApiBannerStore.getState().show({
    variant: "error",
    message: apiError.message,
    details: apiError.details,
    durationMs: API_BANNER_DURATION_MS,
  });
};

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

client.interceptors.response.use(
  (response) => {
    const method = String(response.config.method || "get").toLowerCase();
    const url = String(response.config.url || "");
    notifySuccess(method, url, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = String(originalRequest?.url || "");
    const isAuthEndpoint =
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout") ||
      requestUrl.includes("/auth/resend-otp") ||
      requestUrl.includes("/auth/verify-otp") ||
      requestUrl.includes("/admin/auth/login");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return client(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await client.post("/auth/refresh");
        processQueue(null);
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useAuthStore.getState().logout();
        if (window.location.pathname !== "/auth/login") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const method = String(originalRequest?.method || "get").toLowerCase();
    notifyError(error, method);
    return Promise.reject(error);
  },
);

export default client;
