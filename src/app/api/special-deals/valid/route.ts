import { SpecialDealsController } from '@/controllers/specialDealsController'

export async function GET(request: Request) {
  return await SpecialDealsController.getValidDealsForOrder(request as any)
}