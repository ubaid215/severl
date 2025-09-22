import { prisma } from '../app/lib/prisma'
import { DiscountType } from '@prisma/client'

export interface CreateSpecialDealData {
  title: string
  description: string
  image?: string
  discount: number
  discountType: DiscountType
  minOrderAmount?: number
  validFrom: Date
  validTo: Date
}

export interface UpdateSpecialDealData {
  title?: string
  description?: string
  image?: string
  discount?: number
  discountType?: DiscountType
  minOrderAmount?: number
  validFrom?: Date
  validTo?: Date
  isActive?: boolean
}

export class SpecialDealModel {
  static async create(data: CreateSpecialDealData) {
    return await prisma.specialDeal.create({
      data,
    })
  }

  static async getAll() {
    return await prisma.specialDeal.findMany({
      orderBy: { createdAt: 'desc' }
    })
  }

  static async getActive() {
    const now = new Date()
    return await prisma.specialDeal.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validTo: { gte: now }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async getById(id: string) {
    return await prisma.specialDeal.findUnique({
      where: { id }
    })
  }

  static async update(id: string, data: UpdateSpecialDealData) {
    return await prisma.specialDeal.update({
      where: { id },
      data,
    })
  }

  static async delete(id: string) {
    return await prisma.specialDeal.delete({
      where: { id }
    })
  }

  static async toggleStatus(id: string) {
    const deal = await prisma.specialDeal.findUnique({ where: { id } })
    return await prisma.specialDeal.update({
      where: { id },
      data: { isActive: !deal?.isActive }
    })
  }

  static async getValidDealsForOrder(orderAmount: number) {
    const now = new Date()
    return await prisma.specialDeal.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validTo: { gte: now },
        OR: [
          { minOrderAmount: null },
          { minOrderAmount: { lte: orderAmount } }
        ]
      },
      orderBy: { discount: 'desc' }
    })
  }

  static calculateDiscount(deal: any, orderAmount: number): number {
    if (deal.minOrderAmount && orderAmount < deal.minOrderAmount) {
      return 0
    }

    if (deal.discountType === 'PERCENTAGE') {
      return (orderAmount * deal.discount) / 100
    } else {
      return deal.discount
    }
  }
}