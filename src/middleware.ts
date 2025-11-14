import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const secret = new TextEncoder().encode(JWT_SECRET)

// Routes that require admin authentication
const adminRoutes = [
  '/api/admin',
  '/api/categories',
  '/api/food-items',
  '/api/special-deals',
  '/api/orders/analytics'
]

// Routes that require admin authentication for specific methods
const adminMethodRoutes = [
  { path: '/api/orders', methods: ['PUT', 'DELETE'] },
  { path: '/api/orders/[id]', methods: ['PUT', 'DELETE'] }
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // Only log non-GET requests to reduce noise
  if (method !== 'GET') {
    console.log(`🚀 Middleware: ${method} ${pathname}`)
  }

  // Skip authentication for public routes
  if (pathname === '/api/auth' && method === 'POST') {
    return NextResponse.next()
  }

  // Skip authentication for GET requests on public endpoints
  const publicGetRoutes = [
    '/api/food-items',
    '/api/categories',
    '/api/special-deals',
    '/api/cart',
    '/api/delivery-charges'
  ]

  if (method === 'GET' && publicGetRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Skip authentication for cart and order creation (public endpoints)
  if ((pathname === '/api/cart' || pathname === '/api/orders') && ['POST', 'DELETE'].includes(method)) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/cart/') && ['PUT', 'DELETE', 'PATCH'].includes(method)) {
    return NextResponse.next()
  }

  // Check if route requires admin authentication
  const requiresAdmin = adminRoutes.some(route => pathname.startsWith(route)) ||
    adminMethodRoutes.some(({ path, methods }) => 
      pathname.match(path.replace('[id]', '[^/]+')) && methods.includes(method)
    )

  if (!requiresAdmin) {
    return NextResponse.next()
  }

  // Get authorization header
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(`❌ ${method} ${pathname}: Missing auth`)
    return NextResponse.json(
      { error: 'Authorization token required' },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7)

  try {
    // Verify JWT token using jose (Edge Runtime compatible)
    const { payload } = await jwtVerify(token, secret)
    
    // Check if user has admin privileges
    if (!['ADMIN', 'SUPER_ADMIN'].includes(payload.role as string)) {
      console.log(`❌ ${method} ${pathname}: Insufficient privileges`)
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }

    // Add user info to request headers for controllers to use
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId as string)
    response.headers.set('x-user-role', payload.role as string)
    response.headers.set('x-user-email', payload.email as string)

    return response

  } catch (error) {
    console.log(`❌ ${method} ${pathname}: Invalid token`)
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }
}

export const config = {
  matcher: [
    '/api/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}