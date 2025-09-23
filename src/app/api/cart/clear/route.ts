import { CartController } from '@/controllers/cartController';

export async function POST(request: Request) {
  return await CartController.clearCart(request as any);
}
