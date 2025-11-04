import { NextRequest } from 'next/server';
import { OrderController } from '@/controllers/orderController';

export async function PATCH(
  request: NextRequest, // ✅ Change from Request to NextRequest
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  return await OrderController.updatePaymentStatus(request, { params });
}