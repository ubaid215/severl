import { NextRequest } from 'next/server';
import { OrderController } from '@/controllers/orderController';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params; // ✅ Await the Promise
  return await OrderController.generateWhatsAppText(request, { params });
}