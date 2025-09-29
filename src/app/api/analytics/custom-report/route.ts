import { NextRequest } from "next/server";
import { AnalyticsController } from "@/controllers/analyticsController";

export async function POST(req: NextRequest) {
  return AnalyticsController.generateCustomReport(req);
}