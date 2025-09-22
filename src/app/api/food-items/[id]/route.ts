import { FoodController } from '@/controllers/foodController'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params  // Await the params
  return await FoodController.getFoodItemById(request as any, { params })
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params  // Await the params
  return await FoodController.updateFoodItem(request as any, { params })
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params  // Await the params
  return await FoodController.deleteFoodItem(request as any, { params })
}