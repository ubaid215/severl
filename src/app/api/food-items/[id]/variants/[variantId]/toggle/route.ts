// app/api/menu-items/[id]/variants/[variantId]/toggle/route.ts
// Handles: PATCH /api/menu/[id]/variants/[variantId]/toggle
import { NextRequest } from 'next/server'
import { FoodController } from '@/controllers/foodController'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; variantId: string }> }
) {
  const params = await context.params
  return FoodController.toggleVariantStatus(request, { params })
}