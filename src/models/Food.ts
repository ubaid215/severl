// models/Food.ts
import { prisma } from '../app/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

// ─── Interfaces ───────────────────────────────────────────────────────────────

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
  variants?: CreateVariantData[]
}

export interface UpdateFoodItemData {
  name?: string
  description?: string
  price?: number
  image?: string
  categoryId?: string
  isAvailable?: boolean
}

export interface CreateVariantData {
  label: string
  price: number
  isDefault?: boolean
  sortOrder?: number
  isActive?: boolean
}

export interface UpdateVariantData {
  label?: string
  price?: number
  isDefault?: boolean
  sortOrder?: number
  isActive?: boolean
}

// ─── Shared select shapes ─────────────────────────────────────────────────────

const categorySelect = {
  id: true,
  name: true,
  image: true,
  isActive: true,
} as const

const foodItemCategorySelect = {
  id: true,
  name: true,
  isActive: true,
} as const

const variantSelect = {
  id: true,
  label: true,
  price: true,
  isDefault: true,
  sortOrder: true,
  isActive: true,
} as const

const foodItemSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  image: true,
  isAvailable: true,
  categoryId: true,
  category: { select: foodItemCategorySelect },
  variants: {
    where: { isActive: true },
    select: variantSelect,
    orderBy: { sortOrder: 'asc' as const },
  },
} as const

// ─── CategoryModel ────────────────────────────────────────────────────────────

export class CategoryModel {
  static async create(data: CreateCategoryData) {
    return await prisma.category.create({ data, select: categorySelect })
  }

  static async getAll() {
    return await prisma.category.findMany({
      where: { isActive: true },
      select: {
        ...categorySelect,
        foodItems: {
          where: { isAvailable: true, deletedAt: null },
          orderBy: { name: 'asc' },
          select: foodItemSelect,
        },
      },
      orderBy: { name: 'asc' },
    })
  }

  static async getById(id: string) {
    return await prisma.category.findUnique({
      where: { id },
      select: {
        ...categorySelect,
        createdAt: true,
        updatedAt: true,
        foodItems: {
          where: { deletedAt: null },
          orderBy: { name: 'asc' },
          select: foodItemSelect,
        },
      },
    })
  }

  static async update(id: string, data: UpdateCategoryData) {
    return await prisma.category.update({ where: { id }, data, select: categorySelect })
  }

  static async delete(id: string) {
    const count = await prisma.foodItem.count({ where: { categoryId: id, deletedAt: null } })
    if (count > 0) throw new Error('Cannot delete category with food items')
    return await prisma.category.delete({ where: { id }, select: { id: true } })
  }

  static async toggleStatus(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      select: { isActive: true },
    })
    return await prisma.category.update({
      where: { id },
      data: { isActive: !category?.isActive },
      select: categorySelect,
    })
  }
}

// ─── FoodItemModel ────────────────────────────────────────────────────────────

export class FoodItemModel {
  /**
   * Create a food item, optionally with variants in a single transaction.
   * If variants are supplied the item's base `price` is automatically synced
   * to the default variant's price (or the first variant if none is marked default).
   */
  static async create(data: CreateFoodItemData) {
    const { variants, ...itemData } = data

    if (!variants || variants.length === 0) {
      return await prisma.foodItem.create({
        data: itemData,
        select: foodItemSelect,
      })
    }

    const sanitisedVariants = FoodItemModel.ensureSingleDefault(variants)
    const defaultVariant = sanitisedVariants.find((v) => v.isDefault) ?? sanitisedVariants[0]
    const basePrice = defaultVariant.price

    return await prisma.$transaction(async (tx) => {
      const foodItem = await tx.foodItem.create({
        data: {
          ...itemData,
          price: basePrice,
          variants: {
            create: sanitisedVariants.map((v) => ({ ...v, price: v.price })),
          },
        },
        select: foodItemSelect,
      })

      return {
        ...foodItem,
        price: Number(foodItem.price),
      }
    })
  }

  static async getAll(categoryId?: string) {
    const items = await prisma.foodItem.findMany({
      where: {
        isAvailable: true,
        deletedAt: null,
        ...(categoryId && { categoryId }),
      },
      select: foodItemSelect,
      orderBy: { name: 'asc' },
    })

    return items.map((item) => ({
      ...item,
      price: Number(item.price),
      variants: item.variants.map((v) => ({ ...v, price: Number(v.price) })),
    }))
  }

  static async getById(id: string) {
    const item = await prisma.foodItem.findUnique({
      where: { id },
      select: { ...foodItemSelect, createdAt: true, updatedAt: true },
    })

    if (!item) return null

    return {
      ...item,
      price: Number(item.price),
      variants: item.variants.map((v) => ({ ...v, price: Number(v.price) })),
    }
  }

  static async update(id: string, data: UpdateFoodItemData) {
    const updateData: any = { ...data }
    if (data.price !== undefined) {
      updateData.price = new Decimal(data.price.toString())
    }

    const updated = await prisma.foodItem.update({
      where: { id },
      data: updateData,
      select: foodItemSelect,
    })

    return {
      ...updated,
      price: Number(updated.price),
      variants: updated.variants.map((v) => ({ ...v, price: Number(v.price) })),
    }
  }

  /**
   * Soft delete — sets deletedAt timestamp instead of removing the row.
   * Preserves order history integrity (order_items.foodItemId FK stays valid).
   * The item is immediately excluded from all getAll/search queries.
   */
  static async delete(id: string) {
    const existing = await prisma.foodItem.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!existing) throw new Error('Food item not found')

    // Soft delete cart items referencing this food item so active carts stay clean
    await prisma.cartItem.deleteMany({ where: { foodItemId: id } })

    return await prisma.foodItem.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true },
    })
  }

  static async toggleAvailability(id: string) {
    const foodItem = await prisma.foodItem.findUnique({
      where: { id },
      select: { isAvailable: true },
    })
    const updated = await prisma.foodItem.update({
      where: { id },
      data: { isAvailable: !foodItem?.isAvailable },
      select: foodItemSelect,
    })

    return {
      ...updated,
      price: Number(updated.price),
      variants: updated.variants.map((v) => ({ ...v, price: Number(v.price) })),
    }
  }

  static async search(query: string) {
    const items = await prisma.foodItem.findMany({
      where: {
        isAvailable: true,
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: foodItemSelect,
    })

    return items.map((item) => ({
      ...item,
      price: Number(item.price),
      variants: item.variants.map((v) => ({ ...v, price: Number(v.price) })),
    }))
  }

  // ── Variant helpers ──────────────────────────────────────────────────────────

  private static ensureSingleDefault(variants: CreateVariantData[]): CreateVariantData[] {
    const hasDefault = variants.some((v) => v.isDefault)
    if (hasDefault) {
      let found = false
      return variants.map((v) => {
        if (v.isDefault && !found) { found = true; return v }
        return { ...v, isDefault: false }
      })
    }
    return variants.map((v, i) => ({ ...v, isDefault: i === 0 }))
  }
}

// ─── VariantModel ─────────────────────────────────────────────────────────────

export class VariantModel {
  static async create(foodItemId: string, data: CreateVariantData) {
    return await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.foodItemVariant.updateMany({
          where: { foodItemId, isDefault: true },
          data: { isDefault: false },
        })
      }

      const variant = await tx.foodItemVariant.create({
        data: { ...data, foodItemId, price: data.price },
        select: variantSelect,
      })

      if (data.isDefault) {
        await tx.foodItem.update({
          where: { id: foodItemId },
          data: { price: data.price },
        })
      }

      return { ...variant, price: Number(variant.price) }
    })
  }

  static async getByFoodItem(foodItemId: string) {
    const variants = await prisma.foodItemVariant.findMany({
      where: { foodItemId },
      select: variantSelect,
      orderBy: { sortOrder: 'asc' },
    })

    return variants.map((v) => ({ ...v, price: Number(v.price) }))
  }

  static async getById(id: string) {
    const variant = await prisma.foodItemVariant.findUnique({
      where: { id },
      select: { ...variantSelect, foodItemId: true },
    })

    if (!variant) return null
    return { ...variant, price: Number(variant.price) }
  }

  static async update(id: string, data: UpdateVariantData) {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.foodItemVariant.findUnique({
        where: { id },
        select: { foodItemId: true, isDefault: true },
      })
      if (!existing) throw new Error('Variant not found')

      if (data.isDefault && !existing.isDefault) {
        await tx.foodItemVariant.updateMany({
          where: { foodItemId: existing.foodItemId, isDefault: true },
          data: { isDefault: false },
        })
      }

      const updateData: any = { ...data }
      if (updateData.price === undefined) delete updateData.price

      const variant = await tx.foodItemVariant.update({
        where: { id },
        data: updateData,
        select: variantSelect,
      })

      if (data.isDefault && data.price !== undefined) {
        await tx.foodItem.update({
          where: { id: existing.foodItemId },
          data: { price: data.price },
        })
      }

      return { ...variant, price: Number(variant.price) }
    })
  }

  static async delete(id: string) {
    const variant = await prisma.foodItemVariant.findUnique({
      where: { id },
      select: { foodItemId: true, isDefault: true },
    })
    if (!variant) throw new Error('Variant not found')

    await prisma.foodItemVariant.delete({ where: { id } })

    if (variant.isDefault) {
      const next = await prisma.foodItemVariant.findFirst({
        where: { foodItemId: variant.foodItemId, isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, price: true },
      })
      if (next) {
        await prisma.$transaction([
          prisma.foodItemVariant.update({
            where: { id: next.id },
            data: { isDefault: true },
          }),
          prisma.foodItem.update({
            where: { id: variant.foodItemId },
            data: { price: next.price },
          }),
        ])
      }
    }

    return { id }
  }

  static async toggleActive(id: string) {
    const variant = await prisma.foodItemVariant.findUnique({
      where: { id },
      select: { isActive: true },
    })
    if (!variant) throw new Error('Variant not found')

    const updated = await prisma.foodItemVariant.update({
      where: { id },
      data: { isActive: !variant.isActive },
      select: variantSelect,
    })

    return { ...updated, price: Number(updated.price) }
  }
}