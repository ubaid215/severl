import { FoodController } from '@/controllers/foodController'

export async function PATCH(request: Request, context: { params: { id: string } }) {
  return await FoodController.toggleCategoryStatus(request as any, context)
}