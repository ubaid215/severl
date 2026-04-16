// app/api/menu-items/[id]/variants/route.ts
// Handles: GET /api/menu/[id]/variants
//          POST /api/menu/[id]/variants
import { NextRequest } from 'next/server'
import { FoodController } from '@/controllers/foodController'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  return FoodController.getVariants(request, { params })
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  return FoodController.createVariant(request, { params })
}