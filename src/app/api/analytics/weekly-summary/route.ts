import { NextRequest } from "next/server";
import { AnalyticsController } from "@/controllers/analyticsController";

export async function GET(req: NextRequest) {
  return AnalyticsController.getWeeklySummary(req);
}