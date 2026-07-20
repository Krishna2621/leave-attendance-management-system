import axios from "axios";
import { emitAuthEvent } from "../services/authEvents";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

const refreshClient = axios.create({ baseURL: API_URL, withCredentials: true, timeout: 15000 });
let refreshRequest = null;

const refreshSession = async () => {
  if (!refreshRequest) {
    refreshRequest = refreshClient.post("/auth/refresh-token").finally(() => {
      refreshRequest = null;
    });
  }
  return refreshRequest;
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const request = error.config;

    if (status === 401 && request && !request._retry && !request.url?.includes("/auth/")) {
      request._retry = true;
      try {
        await refreshSession();
        return client(request);
      } catch {
        emitAuthEvent("session-expired");
      }
    }

    if (status === 401 && !request?.url?.includes("/auth/refresh-token")) emitAuthEvent("unauthorized");
    return Promise.reject(error);
  },
);

export { API_URL, refreshSession };
export default client;
