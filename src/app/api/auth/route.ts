import { UserController } from '@/controllers/userController'

export async function POST(request: Request) {
  return await UserController.login(request as any)
}

export async function GET(request: Request) {
  return await UserController.getProfile(request as any)
}