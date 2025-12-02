import axios, { InternalAxiosRequestConfig } from "axios";
import { ACCESS_TOKEN } from "./constants";

const apiUrl = "/choreo-apis/awbo/backend/rest-api-be2/v1.0";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL ?? apiUrl,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      // Ensure headers object exists before setting Authorization
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout - server may not be accessible");
      error.message =
        "Connection timeout - please check if the backend server is running and accessible";
    } else if (error.code === "ERR_NETWORK") {
      console.error("Network error - server may not be accessible");
      error.message =
        "Network error - backend server may not be accessible from this domain";
    }
    return Promise.reject(error);
  },
);

export default api;
