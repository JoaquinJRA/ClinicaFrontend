import axios from "axios";

const api = axios.create({
  baseURL: "https://clinica-frontend-rosy-six.vercel.app/login",
  withCredentials: true,
});

export default api;
