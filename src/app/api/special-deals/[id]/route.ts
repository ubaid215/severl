// /app/api/special-deals/[id]/route.ts
import { SpecialDealsController } from '@/controllers/specialDealsController'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params  // Await the params
  return await SpecialDealsController.getDealById(request as any, { params })
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params  // Await the params
  return await SpecialDealsController.updateDeal(request as any, { params })
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params  // Await the params
  return await SpecialDealsController.deleteDeal(request as any, { params })
}