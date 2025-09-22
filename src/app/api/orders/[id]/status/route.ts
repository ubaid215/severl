import { OrderController } from '@/controllers/orderController';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  return await OrderController.updateOrderStatus(request, { params });
}
