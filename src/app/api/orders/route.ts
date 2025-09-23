import { NextRequest } from "next/server";
import { OrderController } from "@/controllers/orderController";

export async function POST(req: NextRequest) {
  console.log("📩 [API] POST /api/orders hit");
  return OrderController.createOrder(req);
}

export async function GET(req: NextRequest) {
  console.log("📩 [API] GET /api/orders hit");
  return OrderController.getAllOrders(req);
}
