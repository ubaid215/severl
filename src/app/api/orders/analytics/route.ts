import { OrderController } from '@/controllers/orderController'

export async function GET(request: Request) {
  return await OrderController.getOrderAnalytics(request as any)
}