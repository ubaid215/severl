import { NextRequest } from 'next/server'
import { FoodController } from '@/controllers/foodController'

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params; // ✅ await it
  return FoodController.toggleCategoryStatus(req, { params });
}
