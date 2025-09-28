// File: app/api/dashboard/stats/route.ts
import { NextRequest } from 'next/server';
import { OrderController } from '@/controllers/orderController';

export async function GET(request: NextRequest) {
  return await OrderController.getDashboardStats(request);
}