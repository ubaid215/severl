import { NextRequest } from 'next/server';
import { OrderController } from '@/controllers/orderController';

interface Params {
  params: { orderNumber: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  return OrderController.getOrderByOrderNumber(req, { params });
}