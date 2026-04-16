// controllers/orderController.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { CartModel } from '@/models/cart'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  foodItemId: string
  quantity: number
  variantId?: string
}

interface CreateOrderInput {
  sessionId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  deliveryAddress: string
  latitude?: number
  longitude?: number
  items: OrderItem[]
  paymentMethod?: 'CASH_ON_DELIVERY' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'STRIPE'
  notes?: string
}

const VALID_STATUSES = [
  'PENDING', 'CONFIRMED', 'PREPARING', 'READY',
  'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
] as const

const VALID_PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] as const

// ─── Shared order select ──────────────────────────────────────────────────────

const orderSelect = {
  id: true,
  orderNumber: true,
  customerName: true,
  customerPhone: true,
  customerEmail: true,
  deliveryAddress: true,
  latitude: true,
  longitude: true,
  distance: true,
  subtotal: true,
  deliveryCharges: true,
  discount: true,
  total: true,
  status: true,
  paymentStatus: true,
  paymentMethod: true,
  notes: true,
  estimatedTime: true,
  createdAt: true,
  items: {
    select: {
      id: true,
      quantity: true,
      price: true,
      total: true,
      variantId: true,      // ✅ ADDED
      variantLabel: true,   // ✅ ADDED — for success page display
      foodItem: {
        select: { id: true, name: true, image: true },
      },
    },
  },
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateDistance(lat?: number, lng?: number): number {
  if (lat && lng) {
    const restaurantLat = 31.391427
    const restaurantLng = 72.991881
    const latDiff = Math.abs(lat - restaurantLat)
    const lngDiff = Math.abs(lng - restaurantLng)
    return Math.round(Math.sqrt(latDiff ** 2 + lngDiff ** 2) * 111 * 10) / 10
  }
  return 0  // for now delivery is free
}

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).slice(-4)
  const rand = Math.random().toString(36).substring(2, 6)
  return `ORD-${ts}${rand}`.toUpperCase()
}

// ─── Controller ───────────────────────────────────────────────────────────────

export class OrderController {
  // POST /api/orders
  static async createOrder(req: NextRequest) {
    try {
      const orderData: CreateOrderInput = await req.json()

      // ── Input validation ─────────────────────────────────────────────────
      if (!orderData.customerName?.trim() || !orderData.customerPhone?.trim() || !orderData.deliveryAddress?.trim()) {
        return NextResponse.json(
          { error: 'Customer name, phone, and delivery address are required' },
          { status: 400 }
        )
      }
      if (!orderData.items?.length) {
        return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 })
      }
      if (!orderData.sessionId) {
        return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
      }
      for (const item of orderData.items) {
        if (!item.foodItemId || !Number.isInteger(item.quantity) || item.quantity < 1) {
          return NextResponse.json({ error: 'Each item needs a valid foodItemId and positive integer quantity' }, { status: 400 })
        }
      }

      const distance = calculateDistance(orderData.latitude, orderData.longitude)

      // Fetch all food items in a single query
      // Fetch all food items WITH their active variants
      const foodItems = await prisma.foodItem.findMany({
        where: {
          id: { in: orderData.items.map((i) => i.foodItemId) },
          isAvailable: true,
        },
        select: {
          id: true,
          name: true,
          price: true,
          variants: {                          // ✅ ADDED — need variant prices
            where: { isActive: true },
            select: { id: true, price: true, label: true },
          },
        },
      })

      if (foodItems.length !== orderData.items.length) {
        return NextResponse.json(
          { error: 'One or more food items are unavailable or do not exist' },
          { status: 400 }
        )
      }

      const itemMap = new Map(foodItems.map((f) => [f.id, f]))
      let subtotal = 0

      // ✅ REPLACED — resolve price from variant if provided, else base price
      const lineItems = orderData.items.map((item) => {
        const food = itemMap.get(item.foodItemId)!

        let price: number = Number(food.price)
        let variantId: string | null = null
        let variantLabel: string | null = null

        if (item.variantId) {
          const variant = food.variants.find((v: any) => v.id === item.variantId)
          if (!variant) {
            throw new Error(`Variant not found for item "${food.name}". Please re-select your size.`)
          }
          price = Number(variant.price)
          variantId = variant.id
          variantLabel = variant.label
        } else if (food.variants.length > 0) {
          // Item has variants but none was selected — reject instead of silently using base price
          throw new Error(`Please select a size/variant for "${food.name}"`)
        }

        const itemTotal = price * item.quantity
        subtotal += itemTotal

        return {
          foodItemId: item.foodItemId,
          variantId,        // ✅ persist variant reference
          variantLabel,     // ✅ snapshot label so order history is accurate even if variant is later renamed
          quantity: item.quantity,
          price,
          total: itemTotal,
        }
      })

      const deliveryCharges = CartModel.calculateDeliveryCharges(distance)  // ✅ use shared helper, not hardcoded 0
      const total = subtotal + deliveryCharges
      const orderNumber = generateOrderNumber()

      // Single transaction: create order + clear cart
      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            orderNumber,
            customerName: orderData.customerName,
            customerPhone: orderData.customerPhone,
            customerEmail: orderData.customerEmail ?? null,
            deliveryAddress: orderData.deliveryAddress,
            latitude: orderData.latitude ?? null,
            longitude: orderData.longitude ?? null,
            distance,
            subtotal,
            deliveryCharges: 0,
            total,
            paymentMethod: orderData.paymentMethod ?? 'CASH_ON_DELIVERY',
            notes: orderData.notes ?? null,
            items: { create: lineItems },
          },
          select: orderSelect,
        })

        await CartModel.clearCart(orderData.sessionId)
        return created
      })

      return NextResponse.json({ message: 'Order created successfully', order }, { status: 201 })
    } catch (error) {
      console.error('Create order error:', error)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
  }

  // Add this method to your OrderController class

// POST /api/orders/calculate-delivery
static async calculateDelivery(req: NextRequest) {
  try {
    const body = await req.json()
    const { latitude, longitude, address } = body

    // Calculate distance (you can use your existing calculateDistance function)
    let distance = 0
    if (latitude && longitude) {
      distance = calculateDistance(latitude, longitude)
    } else if (address) {
      // Optionally, you could geocode the address here
      // For now, return a default or random distance
      distance = Math.floor(Math.random() * 15) + 1 // 1-15 km
    } else {
      return NextResponse.json(
        { error: 'Either coordinates (latitude/longitude) or address is required' },
        { status: 400 }
      )
    }

    // Calculate delivery charges based on distance
    let deliveryCharges = 0
    if (distance <= 4) {
      deliveryCharges = 0
    } else if (distance <= 6) {
      deliveryCharges = 50
    } else {
      deliveryCharges = 120
    }

    // Optional: Add a maximum delivery radius check
    const MAX_DELIVERY_RADIUS = 15 // km
    const isDeliverable = distance <= MAX_DELIVERY_RADIUS

    return NextResponse.json({
      success: true,
      data: {
        distance,
        deliveryCharges,
        isDeliverable,
        message: isDeliverable 
          ? 'Delivery available' 
          : `Sorry, we only deliver within ${MAX_DELIVERY_RADIUS}km radius`,
      },
    })
  } catch (error) {
    console.error('Calculate delivery error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate delivery charges' },
      { status: 500 }
    )
  }
}

  // GET /api/orders — paginated, with HTTP cache header for list
  static async getAllOrders(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
      const status = searchParams.get('status')
      const dateFrom = searchParams.get('dateFrom')
      const dateTo = searchParams.get('dateTo')
      const skip = (page - 1) * limit

      const where: any = {}
      if (status) where.status = status
      if (dateFrom || dateTo) {
        where.createdAt = {}
        if (dateFrom) where.createdAt.gte = new Date(dateFrom)
        if (dateTo) where.createdAt.lte = new Date(dateTo)
      }

      // Count + data in parallel
      const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
          where,
          select: orderSelect,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.order.count({ where }),
      ])

      return NextResponse.json(
        { orders, pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) } },
        { headers: { 'Cache-Control': 'private, no-store' } } // orders are user-specific / real-time
      )
    } catch (error) {
      console.error('Get all orders error:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
  }

  // GET /api/orders/:id
  static async getOrderById(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: params.id },
        select: orderSelect,
      })
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      return NextResponse.json({ order })
    } catch (error) {
      console.error('Get order error:', error)
      return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
    }
  }

  // GET /api/orders/by-number/:orderNumber
  static async getOrderByOrderNumber(req: NextRequest, { params }: { params: { orderNumber: string } }) {
    try {
      const order = await prisma.order.findUnique({
        where: { orderNumber: params.orderNumber },
        select: orderSelect,
      })
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      return NextResponse.json({ order })
    } catch (error) {
      console.error('Get order by number error:', error)
      return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
    }
  }

  // PATCH /api/orders/:id/status
  static async updateOrderStatus(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const body = await req.json()
      const { status } = body

      if (!status) return NextResponse.json({ error: 'Status is required' }, { status: 400 })
      if (!(VALID_STATUSES as readonly string[]).includes(status)) {
        return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 })
      }

      const order = await prisma.order.update({
        where: { id: params.id },
        data: { status },
        select: orderSelect,
      })
      return NextResponse.json({ message: 'Order status updated successfully', order })
    } catch (error: any) {
      console.error('Update order status error:', error)
      if (error.code === 'P2025') return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
    }
  }

  // PATCH /api/orders/:id/payment-status
  static async updatePaymentStatus(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const { paymentStatus } = await req.json()

      if (!paymentStatus) return NextResponse.json({ error: 'Payment status is required' }, { status: 400 })
      if (!(VALID_PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) {
        return NextResponse.json({ error: `Invalid payment status. Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}` }, { status: 400 })
      }

      const order = await prisma.order.update({
        where: { id: params.id },
        data: { paymentStatus },
        select: orderSelect,
      })
      return NextResponse.json({ message: 'Payment status updated successfully', order })
    } catch (error: any) {
      console.error('Update payment status error:', error)
      if (error.code === 'P2025') return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 })
    }
  }

  // DELETE /api/orders/:id (cancel)
  static async cancelOrder(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const { reason } = await req.json().catch(() => ({ reason: undefined }))

      const existing = await prisma.order.findUnique({
        where: { id: params.id },
        select: { notes: true, status: true },
      })
      if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      if (existing.status === 'CANCELLED') {
        return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 })
      }

      const updatedNotes = reason
        ? `Cancellation reason: ${reason}. ${existing.notes ?? ''}`.trim()
        : existing.notes ?? ''

      const order = await prisma.order.update({
        where: { id: params.id },
        data: { status: 'CANCELLED', notes: updatedNotes },
        select: orderSelect,
      })
      return NextResponse.json({ message: 'Order cancelled successfully', order })
    } catch (error: any) {
      console.error('Cancel order error:', error)
      if (error.code === 'P2025') return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
    }
  }

  // GET /api/orders/dashboard-stats
  static async getDashboardStats(req: NextRequest) {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // All 7 queries in parallel — single round-trip to DB
      const [
        todayOrders,
        todayRevenue,
        totalOrders,
        totalRevenue,
        totalCustomers,
        averageOrderValue,
        pendingOrders,
        completedOrders,
      ] = await Promise.all([
        prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
        prisma.order.aggregate({
          where: { createdAt: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } },
          _sum: { total: true },
        }),
        prisma.order.count(),
        prisma.order.aggregate({
          where: { status: { not: 'CANCELLED' } },
          _sum: { total: true },
        }),
        // Use groupBy instead of fetching full rows for distinct count
        prisma.order.groupBy({ by: ['customerPhone'], _count: { id: true } }),
        prisma.order.aggregate({
          where: { status: { not: 'CANCELLED' } },
          _avg: { total: true },
        }),
        prisma.order.count({
          where: { status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'] } },
        }),
        prisma.order.count({ where: { status: 'DELIVERED' } }),
      ])

      return NextResponse.json(
        {
          stats: {
            todayOrders,
            todayRevenue: todayRevenue._sum.total ?? 0,
            totalOrders,
            totalRevenue: totalRevenue._sum.total ?? 0,
            totalCustomers: totalCustomers.length,
            averageOrderValue: averageOrderValue._avg.total ?? 0,
            pendingOrders,
            completedOrders,
          },
        },
        { headers: { 'Cache-Control': 'private, max-age=30' } } // stale up to 30s is fine for a dashboard
      )
    } catch (error) {
      console.error('Get dashboard stats error:', error)
      return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
    }
  }

  // GET /api/orders/analytics
  static async getOrderAnalytics(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const startDate = searchParams.get('startDate')
      const endDate = searchParams.get('endDate')

      const dateFilter =
        startDate || endDate
          ? {
              createdAt: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
              },
            }
          : {}

      const nonCancelledWhere = { ...dateFilter, status: { not: 'CANCELLED' as const } }

      // Five queries in parallel
      const [totalOrders, totalRevenue, averageOrderValue, ordersByStatus, ordersByPaymentMethod] =
        await Promise.all([
          prisma.order.count({ where: nonCancelledWhere }),
          prisma.order.aggregate({ where: nonCancelledWhere, _sum: { total: true } }),
          prisma.order.aggregate({ where: nonCancelledWhere, _avg: { total: true } }),
          prisma.order.groupBy({ by: ['status'], where: dateFilter, _count: { id: true } }),
          prisma.order.groupBy({ by: ['paymentMethod'], where: nonCancelledWhere, _count: { id: true } }),
        ])

      return NextResponse.json(
        {
          analytics: {
            totalOrders,
            totalRevenue: totalRevenue._sum.total ?? 0,
            averageOrderValue: averageOrderValue._avg.total ?? 0,
            ordersByStatus,
            ordersByPaymentMethod,
          },
        },
        { headers: { 'Cache-Control': 'private, max-age=60' } }
      )
    } catch (error) {
      console.error('Get order analytics error:', error)
      return NextResponse.json({ error: 'Failed to fetch order analytics' }, { status: 500 })
    }
  }

  //  Generate HTML order slip
static async generateOrderSlip(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        deliveryAddress: true,
        subtotal: true,
        deliveryCharges: true,
        discount: true,
        total: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        notes: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            price: true,
            total: true,
            variantLabel: true,
            foodItem: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Thermal printer optimized HTML/CSS
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Order Slip - ${order.orderNumber}</title>
        <style>
          /* Thermal printer optimized styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Courier New', 'Monaco', monospace;
            width: 80mm; /* Standard thermal paper width */
            margin: 0 auto;
            padding: 2mm;
            background: white;
            font-size: 12px;
            line-height: 1.3;
          }
          
          /* Hide shadows, borders, backgrounds for printing */
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .no-print-break {
              page-break-inside: avoid;
            }
          }
          
          .slip {
            width: 100%;
          }
          
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          
          .header h1 {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
          }
          
          .order-number {
            font-size: 14px;
            font-weight: bold;
            margin: 5px 0;
          }
          
          .section {
            margin-bottom: 10px;
          }
          
          .section-title {
            font-size: 14px;
            font-weight: bold;
            border-bottom: 1px dotted #000;
            padding-bottom: 3px;
            margin-bottom: 8px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          
          .info-label {
            font-weight: bold;
          }
          
          /* Table styles for thermal printers */
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
          }
          
          .items-table th,
          .items-table td {
            padding: 4px 2px;
            text-align: left;
            border-bottom: 1px dotted #ccc;
          }
          
          .items-table th {
            font-weight: bold;
            border-bottom: 1px solid #000;
          }
          
          .item-name {
            font-weight: bold;
          }
          
          .item-variant {
            font-size: 10px;
            color: #666;
          }
          
          /* Right-aligned columns */
          .items-table td:nth-child(3),
          .items-table td:nth-child(4),
          .items-table td:nth-child(5),
          .items-table th:nth-child(3),
          .items-table th:nth-child(4),
          .items-table th:nth-child(5) {
            text-align: right;
          }
          
          /* Totals section */
          .totals {
            margin-top: 10px;
            padding-top: 5px;
            border-top: 1px dashed #000;
          }
          
          .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          
          .grand-total {
            font-weight: bold;
            font-size: 14px;
            margin-top: 5px;
            padding-top: 5px;
            border-top: 1px solid #000;
          }
          
          /* Status badges - using text instead of colors for thermal */
          .status {
            font-weight: bold;
          }
          
          .footer {
            margin-top: 15px;
            text-align: center;
            font-size: 10px;
            padding-top: 10px;
            border-top: 1px dashed #000;
          }
          
          /* Divider line */
          .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          
          /* Monospace for better alignment */
          .mono {
            font-family: 'Courier New', monospace;
          }
        </style>
      </head>
      <body>
        <div class="slip">
          <!-- Header -->
          <div class="header">
            <h1>SEVERAL - The taste of life.</h1>
            <div>Order Slip</div>
            <div class="order-number">#${order.orderNumber}</div>
            <div class="mono">${new Date(order.createdAt).toLocaleString()}</div>
          </div>
          
          <div class="divider"></div>
          
          <!-- Customer Info -->
          <div class="section">
            <div class="section-title">CUSTOMER</div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span>${order.customerName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span>${order.customerPhone}</span>
            </div>
            ${order.customerEmail ? `
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span>${order.customerEmail}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">Address:</span>
              <span>${order.deliveryAddress}</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <!-- Order Items -->
          <div class="section">
            <div class="section-title">ITEMS</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map((item: any) => `
                  <tr>
                    <td>
                      <div class="item-name">${item.foodItem.name}</div>
                      ${item.variantLabel ? `<div class="item-variant">${item.variantLabel}</div>` : ''}
                    </td>
                    <td>${item.quantity}</td>
                    <td>${item.price}</td>
                    <td>${item.total}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="divider"></div>
          
          <!-- Totals -->
          <div class="totals">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>Rs. ${order.subtotal}</span>
            </div>
            <div class="total-line">
              <span>Delivery:</span>
              <span>Rs. ${order.deliveryCharges}</span>
            </div>
            ${order.discount > 0 ? `
            <div class="total-line">
              <span>Discount:</span>
              <span>-Rs. ${order.discount}</span>
            </div>
            ` : ''}
            <div class="total-line grand-total">
              <span>TOTAL:</span>
              <span>Rs. ${order.total}</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <!-- Payment & Status -->
          <div class="section">
            <div class="info-row">
              <span class="info-label">Payment:</span>
              <span>${order.paymentMethod} (${order.paymentStatus})</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="status">${order.status}</span>
            </div>
            ${order.notes ? `
            <div class="info-row">
              <span class="info-label">Notes:</span>
              <span>${order.notes}</span>
            </div>
            ` : ''}
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div>Thank you for your order!</div>
            <div class="mono" style="font-size: 10px; margin-top: 5px;">
              ${new Date().toLocaleString()}
            </div>
          </div>
        </div>
        
        <script>
          // Auto-print when loaded
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    console.error('Generate order slip error:', error)
    return NextResponse.json({ error: 'Failed to generate order slip' }, { status: 500 })
  }
}

  // GET /api/orders/revenue-report
  static async getRevenueReport(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const startDate = searchParams.get('startDate')
      const endDate = searchParams.get('endDate')

      const where: any = { status: { not: 'CANCELLED' } }
      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = new Date(startDate)
        if (endDate) where.createdAt.lte = new Date(endDate)
      }

      const revenueData = await prisma.order.findMany({
        where,
        select: { createdAt: true, total: true },
        orderBy: { createdAt: 'asc' },
      })

      const grouped = revenueData.reduce<Record<string, { date: string; revenue: number; orders: number }>>(
        (acc, order) => {
          const date = order.createdAt.toISOString().split('T')[0]
          if (!acc[date]) acc[date] = { date, revenue: 0, orders: 0 }
          acc[date].revenue += order.total
          acc[date].orders += 1
          return acc
        },
        {}
      )

      return NextResponse.json(
        { report: Object.values(grouped) },
        { headers: { 'Cache-Control': 'private, max-age=60' } }
      )
    } catch (error) {
      console.error('Get revenue report error:', error)
      return NextResponse.json({ error: 'Failed to fetch revenue report' }, { status: 500 })
    }
  }

  // GET /api/orders/by-status-count
  static async getOrdersByStatus() {
    try {
      const statusCounts = await prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      })
      return NextResponse.json(
        { statusCounts },
        { headers: { 'Cache-Control': 'private, max-age=30' } }
      )
    } catch (error) {
      console.error('Get orders by status error:', error)
      return NextResponse.json({ error: 'Failed to fetch orders by status' }, { status: 500 })
    }
  }

  // GET /api/orders/:id/whatsapp
  static async generateWhatsAppText(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: params.id },
        select: {
          orderNumber: true,
          status: true,
          customerName: true,
          customerPhone: true,
          deliveryAddress: true,
          total: true,
          items: {
            select: {
              quantity: true,
              foodItem: { select: { name: true } },
            },
          },
        },
      })
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

      const text = `Order #${order.orderNumber}\nStatus: ${order.status}\nCustomer: ${order.customerName} (${order.customerPhone})\nDelivery: ${order.deliveryAddress}\nItems:\n${order.items.map((i: any) => `- ${i.quantity}x ${i.foodItem.name}`).join('\n')}\nTotal: Rs.${order.total}`.trim()

      return NextResponse.json({ text, shareUrl: `https://wa.me/?text=${encodeURIComponent(text)}` })
    } catch (error) {
      console.error('Generate WhatsApp text error:', error)
      return NextResponse.json({ error: 'Failed to generate WhatsApp text' }, { status: 500 })
    }
  }
}