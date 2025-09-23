import { NextRequest, NextResponse } from "next/server";
import { OrderController } from "@/controllers/orderController";

export async function POST(req: NextRequest) {
  return OrderController.calculateDelivery(req);
}