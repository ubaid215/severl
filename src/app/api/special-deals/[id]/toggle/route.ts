import { SpecialDealsController } from '@/controllers/specialDealsController'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params  // Await the params
  return await SpecialDealsController.toggleDealStatus(request as any, { params })
}