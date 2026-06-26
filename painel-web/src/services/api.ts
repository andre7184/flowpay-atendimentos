import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Interceptor: Adiciona o Token automaticamente em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = "Bearer token-flowpay-teste";

    if (config.headers) {
      config.headers.Authorization = token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
