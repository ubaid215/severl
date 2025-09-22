import { prisma } from '../app/lib/prisma'

export interface CreateCategoryData {
  name: string
  image?: string
}

export interface UpdateCategoryData {
  name?: string
  image?: string
  isActive?: boolean
}

export interface CreateFoodItemData {
  name: string
  description?: string
  price: number
  image?: string
  categoryId: string
  isAvailable?: boolean
}

export interface UpdateFoodItemData {
  name?: string
  description?: string
  price?: number
  image?: string
  categoryId?: string
  isAvailable?: boolean
}

export class CategoryModel {
  static async create(data: CreateCategoryData) {
    return await prisma.category.create({
      data,
    })
  }

  static async getAll() {
    return await prisma.category.findMany({
      where: { isActive: true },
      include: {
        foodItems: {
          where: { isAvailable: true },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })
  }

  static async getById(id: string) {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        foodItems: {
          orderBy: { name: 'asc' }
        }
      }
    })
  }

  static async update(id: string, data: UpdateCategoryData) {
    return await prisma.category.update({
      where: { id },
      data,
    })
  }

  static async delete(id: string) {
    // Check if category has food items
    const category = await prisma.category.findUnique({
      where: { id },
      include: { foodItems: true }
    })

    if (category?.foodItems.length) {
      throw new Error('Cannot delete category with food items')
    }

    return await prisma.category.delete({
      where: { id }
    })
  }

  static async toggleStatus(id: string) {
    const category = await prisma.category.findUnique({ where: { id } })
    return await prisma.category.update({
      where: { id },
      data: { isActive: !category?.isActive }
    })
  }
}

export class FoodItemModel {
  static async create(data: CreateFoodItemData) {
    return await prisma.foodItem.create({
      data,
      include: {
        category: true
      }
    })
  }

  static async getAll(categoryId?: string) {
    return await prisma.foodItem.findMany({
      where: {
        isAvailable: true,
        ...(categoryId && { categoryId })
      },
      include: {
        category: true
      },
      orderBy: { name: 'asc' }
    })
  }

  static async getById(id: string) {
    return await prisma.foodItem.findUnique({
      where: { id },
      include: {
        category: true
      }
    })
  }

  static async update(id: string, data: UpdateFoodItemData) {
    return await prisma.foodItem.update({
      where: { id },
      data,
      include: {
        category: true
      }
    })
  }

  static async delete(id: string) {
    return await prisma.foodItem.delete({
      where: { id }
    })
  }

  static async toggleAvailability(id: string) {
    const foodItem = await prisma.foodItem.findUnique({ where: { id } })
    return await prisma.foodItem.update({
      where: { id },
      data: { isAvailable: !foodItem?.isAvailable },
      include: {
        category: true
      }
    })
  }

  static async search(query: string) {
    return await prisma.foodItem.findMany({
      where: {
        isAvailable: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        category: true
      }
    })
  }
}