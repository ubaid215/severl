import { CartController } from '@/controllers/cartController'

export async function GET(request: Request) {
  return await CartController.calculateDeliveryCharges(request as any)
}