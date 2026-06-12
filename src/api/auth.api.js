import api from "./axios";

export const registerRequest = (data) => api.post("/auth/register", data);
export const loginRequest = (data) => api.post("/auth/login", data);
export const logoutRequest = () => api.post("/auth/logout");
export const profileRequest = () => api.get("/auth/profile");
export const solicitarRecuperacionRequest = (data) =>
  api.post("/auth/solicitar-recuperacion", data);
export const resetearContrasenaRequest = (data) =>
  api.post("/auth/resetear-contrasena", data);
