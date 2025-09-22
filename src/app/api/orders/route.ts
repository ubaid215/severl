import { NextRequest } from 'next/server';
import { OrderController } from '@/controllers/orderController';

export async function POST(req: NextRequest) {
  return OrderController.createOrder(req);
}

export async function GET(req: NextRequest) {
  return OrderController.getAllOrders(req);
}