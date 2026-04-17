// app/api/auth/account/route.ts

import { NextRequest } from 'next/server'
import { UserController } from '@/controllers/userController'

/**
 * PATCH /api/auth/account?action=email   → change email
 * PATCH /api/auth/account?action=password → change password
 */
export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'email') {
    return UserController.changeEmail(request)
  }

  if (action === 'password') {
    return UserController.changePassword(request)
  }

  return Response.json(
    { error: 'Invalid action. Use ?action=email or ?action=password' },
    { status: 400 }
  )
}