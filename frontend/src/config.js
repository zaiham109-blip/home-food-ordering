const DEV_API_URL = "http://127.0.0.1:8000/api";
const PROD_API_URL = "https://home-food-api.onrender.com/api";

const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? DEV_API_URL : PROD_API_URL);

export const API_URL = rawApiUrl.replace(/\/+$/, "");
export const API_BASE_URL = API_URL.endsWith("/api") ? API_URL.slice(0, -4) : API_URL;
