// models/order.ts
import { prisma } from '../app/lib/prisma'
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CreateOrderData {
  customerName: string
  customerPhone: string
  customerEmail?: string
  deliveryAddress: string
  latitude?: number
  longitude?: number
  distance?: number
  sessionId: string
  paymentMethod?: PaymentMethod
  notes?: string
  dealId?: string
}

export interface UpdateOrderData {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  estimatedTime?: number
  notes?: string
}

// ─── Shared select shapes ─────────────────────────────────────────────────────

const orderItemSelect = {
  id: true,
  quantity: true,
  price: true,
  total: true,
  variantId: true,
  variantLabel: true,
  foodItem: {
    select: {
      id: true,
      name: true,
      image: true,
      category: { select: { id: true, name: true } },
    },
  },
} as const

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
  updatedAt: true,
  items: { select: orderItemSelect },
} as const

// ─── OrderModel ───────────────────────────────────────────────────────────────

export class OrderModel {
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `ORD${timestamp}${random}`
  }

  static calculateDeliveryCharges(distance: number): number {
    if (distance <= 4) return 0
    if (distance <= 6) return 50
    return 120
  }

  static async create(data: CreateOrderData) {
    const { sessionId, dealId, ...orderData } = data

    // Fetch cart with variant info so we can snapshot variant labels
    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      select: {
        id: true,
        items: {
          select: {
            foodItemId: true,
            variantId: true,
            quantity: true,
            price: true,
            variant: { select: { label: true } },
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) throw new Error('Cart is empty')

    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const deliveryCharges = this.calculateDeliveryCharges(data.distance ?? 0)

    // Resolve discount — only hit DB if a dealId was provided
    let discount = 0
    if (dealId) {
      const deal = await prisma.specialDeal.findUnique({
        where: { id: dealId },
        select: {
          isActive: true,
          validFrom: true,
          validTo: true,
          minOrderAmount: true,
          discountType: true,
          discount: true,
        },
      })

      if (deal?.isActive) {
        const now = new Date()
        const eligible =
          deal.validFrom <= now &&
          deal.validTo >= now &&
          (!deal.minOrderAmount || subtotal >= deal.minOrderAmount)

        if (eligible) {
          discount =
            deal.discountType === 'PERCENTAGE'
              ? (subtotal * deal.discount) / 100
              : deal.discount
        }
      }
    }

    const total = subtotal + deliveryCharges - discount
    const orderNumber = this.generateOrderNumber()

    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          ...orderData,
          orderNumber,
          subtotal,
          deliveryCharges,
          discount,
          total,
          paymentMethod: orderData.paymentMethod ?? PaymentMethod.CASH_ON_DELIVERY,
          items: {
            create: cart.items.map((item) => ({
              foodItemId: item.foodItemId,
              // Persist the variant reference and snapshot its label
              variantId: item.variantId ?? null,
              variantLabel: item.variant?.label ?? null,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
            })),
          },
        },
        select: orderSelect,
      })

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      return order
    })
  }

  static async getAll(page = 1, limit = 20, status?: OrderStatus) {
    const skip = (page - 1) * limit
    const where = status ? { status } : {}

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: orderSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  static async getById(id: string) {
    return await prisma.order.findUnique({ where: { id }, select: orderSelect })
  }

  static async getByOrderNumber(orderNumber: string) {
    return await prisma.order.findUnique({ where: { orderNumber }, select: orderSelect })
  }

  static async updateStatus(id: string, data: UpdateOrderData) {
    return await prisma.order.update({
      where: { id },
      data,
      select: orderSelect,
    })
  }

  static async getOrderAnalytics(startDate?: Date, endDate?: Date) {
    const where = {
      ...(startDate && endDate && { createdAt: { gte: startDate, lte: endDate } }),
    }

    const [totalOrders, totalRevenue, ordersByStatus, averageOrderValue] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where: { ...where, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      prisma.order.groupBy({ by: ['status'], where, _count: { status: true } }),
      prisma.order.aggregate({
        where: { ...where, status: { not: 'CANCELLED' } },
        _avg: { total: true },
      }),
    ])

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total ?? 0,
      averageOrderValue: averageOrderValue._avg.total ?? 0,
      ordersByStatus,
    }
  }

  static generateWhatsAppMessage(order: any): string {
    const items = order.items
      .map((item: any) => {
        const variantSuffix = item.variantLabel ? ` (${item.variantLabel})` : ''
        return `• ${item.foodItem.name}${variantSuffix} x${item.quantity} - Rs.${item.total}`
      })
      .join('\n')

    return `🍽️ *Order Confirmation*

📋 *Order #:* ${order.orderNumber}
👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.customerPhone}
📍 *Address:* ${order.deliveryAddress}

*Items:*
${items}

💰 *Subtotal:* Rs.${order.subtotal}
🚚 *Delivery:* Rs.${order.deliveryCharges}
💸 *Discount:* Rs.${order.discount}
*Total:* Rs.${order.total}

📊 *Status:* ${order.status}
🕐 *Ordered at:* ${new Date(order.createdAt).toLocaleString()}

Thank you for your order! 🙏`
  }
}