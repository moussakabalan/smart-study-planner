import { api } from "./client.js";

//? Session cookie auth: register, login, logout, current user
export async function FetchMe() {
  const { data } = await api.get("/api/auth/me");
  return data;
}

export async function LoginRequest(email, password) {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data;
}

export async function RegisterRequest(email, password) {
  const { data } = await api.post("/api/auth/register", { email, password });
  return data;
}

export async function LogoutRequest() {
  await api.post("/api/auth/logout");
}