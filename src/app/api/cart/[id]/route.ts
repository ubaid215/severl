import { CartController } from '@/controllers/cartController'

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  return await CartController.updateCartItem(request as any, {params})
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  return await CartController.removeFromCart(request as any, {params})
}