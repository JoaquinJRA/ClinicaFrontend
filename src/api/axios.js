import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const API_URL = rawApiUrl.replace(/\/$/, "");

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default api;
