// app/api/menu-items/[id]/variants/[variantId]/route.ts
// Handles: PUT    /api/menu/[id]/variants/[variantId]
//          DELETE /api/menu/[id]/variants/[variantId]
import { NextRequest } from 'next/server'
import { FoodController } from '@/controllers/foodController'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; variantId: string }> }
) {
  const params = await context.params
  return FoodController.updateVariant(request, { params })
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; variantId: string }> }
) {
  const params = await context.params
  return FoodController.deleteVariant(request, { params })
}