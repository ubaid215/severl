import { UserController } from '@/controllers/userController'

export async function POST(request: Request) {
  return await UserController.createAdmin(request as any)
}

export async function GET(request: Request) {
  return await UserController.getAllAdmins(request as any)
}