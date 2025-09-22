import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify, importSPKI, importPKCS8 } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Convert string secret to Uint8Array for jose
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

  console.log(`🚀 Middleware hit: ${method} ${pathname}`)

  // Skip authentication for public routes
  if (pathname === '/api/auth' && method === 'POST') {
    console.log('✅ Skipping auth for /api/auth POST')
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
    console.log('✅ Allowing public GET request')
    return NextResponse.next()
  }

  // Skip authentication for cart and order creation (public endpoints)
  if ((pathname === '/api/cart' || pathname === '/api/orders') && ['POST', 'DELETE'].includes(method)) {
    console.log('✅ Allowing public cart/order request')
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/cart/') && ['PUT', 'DELETE'].includes(method)) {
    console.log('✅ Allowing public cart item request')
    return NextResponse.next()
  }

  // Check if route requires admin authentication
  const requiresAdmin = adminRoutes.some(route => pathname.startsWith(route)) ||
    adminMethodRoutes.some(({ path, methods }) => 
      pathname.match(path.replace('[id]', '[^/]+')) && methods.includes(method)
    )

  console.log(`🔒 Requires admin: ${requiresAdmin}`)

  if (!requiresAdmin) {
    console.log('✅ No admin required, allowing request')
    return NextResponse.next()
  }

  // Get authorization header
  const authHeader = request.headers.get('authorization')
  console.log(`🔑 Auth header: ${authHeader ? 'Present' : 'Missing'}`)
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Missing or invalid authorization header')
    return NextResponse.json(
      { error: 'Authorization token required' },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7)
  console.log(`🎫 Token: ${token.substring(0, 20)}...`)

  try {
    // Verify JWT token using jose (Edge Runtime compatible)
    const { payload } = await jwtVerify(token, secret)
    console.log(`👤 Decoded user: ${payload.email}, role: ${payload.role}`)
    
    // Check if user has admin privileges
    if (!['ADMIN', 'SUPER_ADMIN'].includes(payload.role as string)) {
      console.log('❌ Insufficient privileges')
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }

    console.log('✅ Admin authentication successful')

    // Add user info to request headers for controllers to use
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId as string)
    response.headers.set('x-user-role', payload.role as string)
    response.headers.set('x-user-email', payload.email as string)

    return response

  } catch (error) {
    console.log('❌ JWT verification failed:', error)
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