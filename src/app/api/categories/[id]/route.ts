// /app/api/categories/[id]/route.ts
import { FoodController } from '@/controllers/foodController'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params  // Await the params
  return await FoodController.getCategoryById(request as any, { params })
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params  // Await the params
  return await FoodController.updateCategory(request as any, { params })
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params  // Await the params
  return await FoodController.deleteCategory(request as any, { params })
}