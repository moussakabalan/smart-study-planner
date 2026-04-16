import { api } from "./client.js";

//? Gets analytics totals (completed tasks, planned vs actual, average completion)
export async function FetchAnalyticsSummary() {
  const { data } = await api.get("/api/analytics/summary");
  return data;
}

//? Gets rule-based risk warnings
export async function FetchRiskSummary() {
  const { data } = await api.get("/api/analytics/risk");
  return data;
}