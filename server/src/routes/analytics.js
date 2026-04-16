import { Router } from "express";
import { RequireAuth } from "../middleware/requireAuth.js";
import { GetAnalyticsSummary } from "../services/analyticsService.js";
import { GetRiskSummary } from "../services/riskService.js";

//? Analytics and risk endpoints for phase 5
export function AnalyticsRouter(db) {
  const r = Router();
  r.use(RequireAuth);

  r.get("/summary", (req, res) => {
    return res.json(GetAnalyticsSummary(db, req.session.userId));
  });

  r.get("/risk", (req, res) => {
    return res.json(GetRiskSummary(db, req.session.userId));
  });

  return r;
}