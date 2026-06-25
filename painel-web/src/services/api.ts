import axios from "axios";

const api = axios.create({
  // Esta é a URL padrão onde o seu Spring Boot (Java) está rodando
  baseURL: "http://localhost:8080/api",
});

export default api;
