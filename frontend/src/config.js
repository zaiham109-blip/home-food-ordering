const rawApiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const API_URL = rawApiUrl.replace(/\/+$/, "");
export const API_BASE_URL = API_URL.endsWith("/api") ? API_URL.slice(0, -4) : API_URL;
