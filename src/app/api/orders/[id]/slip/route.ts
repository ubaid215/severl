import { OrderController } from '@/controllers/orderController'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  return await OrderController.generateOrderSlip(request as any, {params})
}