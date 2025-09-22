import { prisma } from '../app/lib/prisma'
import { OrderStatus, PaymentStatus } from '@prisma/client'

export interface CreateOrderData {
  customerName: string
  customerPhone: string
  customerEmail?: string
  deliveryAddress: string
  latitude?: number
  longitude?: number
  distance?: number
  sessionId: string
  paymentMethod?: string
  notes?: string
  dealId?: string
}

export interface UpdateOrderData {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  estimatedTime?: number
  notes?: string
}

export class OrderModel {
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `ORD${timestamp}${random}`
  }

  static calculateDeliveryCharges(distance: number): number {
    if (distance <= 4) {
      return 0 // Free delivery
    } else if (distance <= 6) {
      return 50 // 4-6km: 50 rupees
    } else {
      return 120 // Above 6km: 120 rupees
    }
  }

  static async create(data: CreateOrderData) {
    const { sessionId, dealId, ...orderData } = data

    // Get cart items
    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            foodItem: true
          }
        }
      }
    })

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty')
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Calculate delivery charges
    const deliveryCharges = this.calculateDeliveryCharges(data.distance || 0)

    // Calculate discount if deal is applied
    let discount = 0
    if (dealId) {
      const deal = await prisma.specialDeal.findUnique({
        where: { id: dealId }
      })

      if (deal && deal.isActive) {
        const now = new Date()
        if (deal.validFrom <= now && deal.validTo >= now) {
          if (!deal.minOrderAmount || subtotal >= deal.minOrderAmount) {
            if (deal.discountType === 'PERCENTAGE') {
              discount = (subtotal * deal.discount) / 100
            } else {
              discount = deal.discount
            }
          }
        }
      }
    }

    const total = subtotal + deliveryCharges - discount
    const orderNumber = this.generateOrderNumber()

    // Create order in transaction
    return await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          ...orderData,
          orderNumber,
          subtotal,
          deliveryCharges,
          discount,
          total,
        }
      })

      // Create order items
      const orderItems = await Promise.all(
        cart.items.map(item =>
          tx.orderItem.create({
            data: {
              orderId: order.id,
              foodItemId: item.foodItemId,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity
            }
          })
        )
      )

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      })

      // Return order with items
      return await tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              foodItem: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      })
    })
  }

  static async getAll(page = 1, limit = 20, status?: OrderStatus) {
    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              foodItem: {
                include: {
                  category: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where })
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  static async getById(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            foodItem: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })
  }

  static async getByOrderNumber(orderNumber: string) {
    return await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            foodItem: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })
  }

  static async updateStatus(id: string, data: UpdateOrderData) {
    return await prisma.order.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            foodItem: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })
  }

  static async getOrderAnalytics(startDate?: Date, endDate?: Date) {
    const where = {
      ...(startDate && endDate && {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      })
    }

    const [
      totalOrders,
      totalRevenue,
      ordersByStatus,
      averageOrderValue
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where: { ...where, status: { not: 'CANCELLED' } },
        _sum: { total: true }
      }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      }),
      prisma.order.aggregate({
        where: { ...where, status: { not: 'CANCELLED' } },
        _avg: { total: true }
      })
    ])

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      averageOrderValue: averageOrderValue._avg.total || 0,
      ordersByStatus
    }
  }

  static generateWhatsAppMessage(order: any): string {
    const items = order.items.map((item: any) => 
      `• ${item.foodItem.name} x${item.quantity} - Rs.${item.total}`
    ).join('\n')

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