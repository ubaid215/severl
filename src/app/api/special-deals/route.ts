import { SpecialDealsController } from '@/controllers/specialDealsController'

export async function GET(request: Request) {
  return await SpecialDealsController.getAllDeals(request as any)
}

export async function POST(request: Request) {
  return await SpecialDealsController.createDeal(request as any)
}