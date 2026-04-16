import axios from "axios";

//? Shared Axios instance; Vite proxy sends /api to the Express server in dev (duh?)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});