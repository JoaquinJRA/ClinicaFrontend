import axios from "axios";

const api = axios.create({
  baseURL: "https://clinicabackend-9qp3.onrender.com/api",
  withCredentials: true,
});

export default api;
