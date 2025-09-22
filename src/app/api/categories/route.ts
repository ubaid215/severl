import { FoodController } from '@/controllers/foodController'

export async function GET(request: Request) {
  return await FoodController.getAllCategories(request as any)
}

export async function POST(request: Request) {
  return await FoodController.createCategory(request as any)
}