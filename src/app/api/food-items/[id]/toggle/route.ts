import { FoodController } from '@/controllers/foodController'

export async function PATCH(request: Request, context: { params: Promise<{id:string}> }) {
  const params = await context.params
  return await FoodController.toggleFoodItemAvailability(request as any, { params })
}