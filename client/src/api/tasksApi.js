import { api } from "./client.js";

//? Loads tasks from the server with optional filters
export async function FetchTasks(params) {
  const { data } = await api.get("/api/tasks", { params });
  return data;
}

//? Loads tasks that are due today or later and not completed
export async function FetchUpcomingTasks() {
  const { data } = await api.get("/api/tasks", { params: { category: "upcoming" } });
  return data;
}

//? Creates a new task row
export async function CreateTaskApi(body) {
  const { data } = await api.post("/api/tasks", body);
  return data;
}

//? Updates an existing task by id
export async function UpdateTaskApi(id, body) {
  const { data } = await api.put(`/api/tasks/${id}`, body);
  return data;
}

//? Deletes a task by id
export async function DeleteTaskApi(id) {
  await api.delete(`/api/tasks/${id}`);
}

//? Loads sessions for a week start date (YYYY-MM-DD format)
export async function FetchSessionsByWeek(weekStart) {
  const { data } = await api.get("/api/sessions", { params: { weekStart } });
  return data;
}

//? Creates one session linked to a real task id
export async function CreateSessionApi(body) {
  const { data } = await api.post("/api/sessions", body);
  return data;
}

//? Deletes one session by id
export async function DeleteSessionApi(id) {
  await api.delete(`/api/sessions/${id}`);
}