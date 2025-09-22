import { NextRequest } from 'next/server';
import { OrderController } from '@/controllers/orderController';

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, context: Params) {
  return await OrderController.generateWhatsAppText(request, context);
}
