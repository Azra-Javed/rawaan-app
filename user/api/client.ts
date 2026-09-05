import { clearAuth, getToken } from "@/utils/authStorage";
import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URI;
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every outgoing request automatically
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-clear token on 401 (expired/invalid)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearAuth();
      // Optionally trigger navigation to login here, or handle it
      // wherever you call the API (see below)
    }
    return Promise.reject(error);
  },
);

export default api;
