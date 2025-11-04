import { NextRequest, NextResponse } from 'next/server'
import { FoodController } from '@/controllers/foodController'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params promise
  const resolvedParams = await params
  return await FoodController.toggleCategoryStatus(request, { params: resolvedParams })
}