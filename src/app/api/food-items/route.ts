import { FoodController } from '@/controllers/foodController'

export async function GET(request: Request) {
  return await FoodController.getAllFoodItems(request as any)
}

export async function POST(request: Request) {
  return await FoodController.createFoodItem(request as any)
}