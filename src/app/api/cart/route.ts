import { CartController } from '@/controllers/cartController'

export async function GET(request: Request) {
  return await CartController.getCart(request as any)
}

export async function POST(request: Request) {
  return await CartController.addToCart(request as any)
}

export async function DELETE(request: Request) {
  return await CartController.clearCart(request as any)
}