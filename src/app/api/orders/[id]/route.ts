import { OrderController } from '@/controllers/orderController'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> } // 👈 make it a promise
) {
  const params = await context.params; // 👈 await
  return await OrderController.getOrderById(request as any, { params });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params; // 👈 await
  return await OrderController.updateOrderStatus(request as any, { params });
}
