// src/app/api/orders/analytics/revenue/route.ts
import { NextRequest } from 'next/server';
import { OrderController } from '@/controllers/orderController';

export async function GET(req: NextRequest) {
  return OrderController.getRevenueReport(req);
}