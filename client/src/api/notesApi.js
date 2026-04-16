import { api } from "./client.js";

//? Loads notes with optional search and task filter
export async function FetchNotes(params) {
  const { data } = await api.get("/api/notes", { params });
  return data;
}

//? Creates one note
export async function CreateNoteApi(body) {
  const { data } = await api.post("/api/notes", body);
  return data;
}

//? Updates one note
export async function UpdateNoteApi(id, body) {
  const { data } = await api.put(`/api/notes/${id}`, body);
  return data;
}

//? Deletes one note
export async function DeleteNoteApi(id) {
  await api.delete(`/api/notes/${id}`);
}