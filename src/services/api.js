import axios from "axios";
import * as SecureStore from "expo-secure-store";

let onUnauthorizedCallback = null;

export const setUnauthorizedHandler = (callback) => {
  onUnauthorizedCallback = callback;
};

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Interceptor de salida: inyecta Doble JWT (App Token + User Token)
api.interceptors.request.use(
  async (config) => {
    const appToken = process.env.EXPO_PUBLIC_API_APP_TOKEN;
    if (appToken) {
      config.headers["x-api-token"] = appToken;
    }

    const userToken = await SecureStore.getItemAsync("token");
    if (userToken) {
      config.headers["Authorization"] = `Bearer ${userToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 2. Interceptor de entrada: manejo centralizado de errores HTTP
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    if (status === 401 && !requestUrl.includes("/auth/login")) {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }

    if (status === 403) {
      error.customMessage =
        error.response?.data?.message ||
        "Acceso restringido: no tienes permisos para realizar esta acción.";
    } else if (status === 404) {
      error.customMessage =
        error.response?.data?.message ||
        "El recurso solicitado no fue encontrado.";
    } else if (status >= 500) {
      error.customMessage =
        "Error interno en el servidor. Intenta nuevamente más tarde.";
    } else {
      error.customMessage =
        error.response?.data?.message || "Error de conexión con el servidor.";
    }

    return Promise.reject(error);
  },
);

export default api;
