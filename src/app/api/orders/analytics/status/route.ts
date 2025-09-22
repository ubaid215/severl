import { NextRequest } from 'next/server';
import { OrderController } from '@/controllers/orderController';

export async function GET() {
  return OrderController.getOrdersByStatus();
}