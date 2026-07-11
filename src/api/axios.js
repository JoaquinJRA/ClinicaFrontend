import axios from "axios";

const API_URL = import.meta.env.PROD
  ? "https://clinicabackend-9qp3.onrender.com/api"
  : "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default api;
