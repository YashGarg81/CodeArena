import axios, { AxiosError, type AxiosResponse } from "axios";

export const API = typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL
  ? (import.meta as any).env.VITE_API_URL
  : (typeof process !== "undefined" && process.env?.API_URL) || "http://localhost:3000";

export const getAuthHeaders = (): Record<string, string> => {
  const t = typeof window !== "undefined" ? localStorage.getItem("ca_token") : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export interface ApiErrorDetail {
  status: number;
  message: string;
  code?: string;
  isNetworkError: boolean;
  isAuthError: boolean;
  isForbidden: boolean;
  isNotFound: boolean;
  isConflict: boolean;
  isRateLimited: boolean;
  isServerError: boolean;
  data?: any;
}

export class ApiError extends Error {
  public status: number;
  public detail: ApiErrorDetail;

  constructor(detail: ApiErrorDetail) {
    super(detail.message);
    this.name = "ApiError";
    this.status = detail.status;
    this.detail = detail;
  }
}

// Axios instance with centralized interceptor
const axiosInstance = axios.create({
  baseURL: API,
  timeout: 30000,
});

axiosInstance.interceptors.request.use((config) => {
  const headers = getAuthHeaders();
  if (headers.Authorization) {
    config.headers.Authorization = headers.Authorization;
  }
  return config;
});

// Create event dispatcher for UI notifications
export type ApiErrorListener = (err: ApiErrorDetail) => void;
const listeners = new Set<ApiErrorListener>();

export const onApiError = (listener: ApiErrorListener) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

const notifyError = (detail: ApiErrorDetail) => {
  listeners.forEach((fn) => {
    try { fn(detail); } catch {}
  });
};

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status || 0;
    const responseData: any = error.response?.data;
    const rawMessage = responseData?.error || responseData?.message || error.message;

    let friendlyMessage = rawMessage;
    const isNetworkError = !error.response || error.code === "ERR_NETWORK";
    const isAuthError = status === 401;
    const isForbidden = status === 403;
    const isNotFound = status === 404;
    const isConflict = status === 409;
    const isRateLimited = status === 429;
    const isServerError = status >= 500;

    if (isNetworkError) {
      friendlyMessage = "Network error: unable to reach the server. Please check your connection.";
    } else if (isAuthError) {
      friendlyMessage = "Session expired or unauthorized. Please sign in again.";
      // Clean stale token on 401 if running in browser
      if (typeof window !== "undefined") {
        // localStorage.removeItem("ca_token");
      }
    } else if (isForbidden) {
      friendlyMessage = rawMessage || "Access denied: You don't have permission to perform this action.";
    } else if (isNotFound) {
      friendlyMessage = rawMessage || "The requested resource was not found.";
    } else if (isConflict) {
      friendlyMessage = rawMessage || "Conflict: resource state conflict occurred.";
    } else if (isRateLimited) {
      friendlyMessage = "Too many requests. Please slow down and try again shortly.";
    } else if (isServerError) {
      friendlyMessage = "Internal server error. Our team has been notified.";
    }

    const detail: ApiErrorDetail = {
      status,
      message: friendlyMessage,
      code: error.code,
      isNetworkError,
      isAuthError,
      isForbidden,
      isNotFound,
      isConflict,
      isRateLimited,
      isServerError,
      data: responseData
    };

    // Emit to subscribed listeners (toast systems, UI alert banners)
    notifyError(detail);

    // Provide backward-compatible error shape: attach response and status to error
    const errObj = new ApiError(detail);
    (errObj as any).response = error.response;
    return Promise.reject(errObj);
  }
);

export const api = {
  get: (url: string) => axiosInstance.get(url),
  post: (url: string, data?: any) => axiosInstance.post(url, data),
  put: (url: string, data?: any) => axiosInstance.put(url, data),
  delete: (url: string) => axiosInstance.delete(url),
};

// Global unhandled promise rejection handler
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason?.name === "ApiError" || event.reason?.isAxiosError) {
      event.preventDefault();
      console.warn(`[ApiError ${event.reason?.status || "network"}]:`, event.reason?.message);
    }
  });
}
