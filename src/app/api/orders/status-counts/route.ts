import { OrderController } from '@/controllers/orderController';

export async function GET() {
  return await OrderController.getOrdersByStatus();
}
