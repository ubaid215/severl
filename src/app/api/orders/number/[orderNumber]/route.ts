import { NextRequest } from 'next/server';
import { OrderController } from '@/controllers/orderController';

export async function GET(req: NextRequest, context: { params: Promise<{ orderNumber: string }> }) {
  const params = await context.params; // ✅ Await the Promise
  return OrderController.getOrderByOrderNumber(req, { params });
}