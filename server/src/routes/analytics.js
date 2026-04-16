import { Router } from "express";
import { GetAnalyticsSummary } from "../services/analyticsService.js";
import { GetRiskSummary } from "../services/riskService.js";

//? Analytics and risk endpoints for phase 5
export function AnalyticsRouter(db) {
  const r = Router();

  r.get("/summary", (req, res) => {
    return res.json(GetAnalyticsSummary(db));
  });

  r.get("/risk", (req, res) => {
    return res.json(GetRiskSummary(db));
  });

  return r;
}