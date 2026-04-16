// models/cart.ts
import { prisma } from '../app/lib/prisma'

export interface AddToCartData {
  sessionId: string
  foodItemId: string
  /** Pass variantId when the item has size/portion variants */
  variantId?: string
  quantity: number
}

export interface UpdateCartItemData {
  quantity: number
}

// ─── Shared select shapes ─────────────────────────────────────────────────────

const variantSelect = {
  id: true,
  label: true,
  price: true,
} as const

const cartItemSelect = {
  id: true,
  cartId: true,
  foodItemId: true,
  variantId: true,
  quantity: true,
  price: true,
  variant: { select: variantSelect },
  foodItem: {
    select: {
      id: true,
      name: true,
      image: true,
      price: true,
      isAvailable: true,
      category: { select: { id: true, name: true, isActive: true } },
      variants: {
        where: { isActive: true },
        select: { id: true, label: true, price: true, isDefault: true, sortOrder: true },
        orderBy: { sortOrder: 'asc' as const },
      },
    },
  },
} as const

const cartWithItemsSelect = {
  id: true,
  sessionId: true,
  items: { select: cartItemSelect },
} as const

// ─── CartModel ────────────────────────────────────────────────────────────────

export class CartModel {
  static async getOrCreateCart(sessionId: string) {
    return await prisma.cart.upsert({
      where: { sessionId },
      update: {},
      create: { sessionId },
      select: cartWithItemsSelect,
    })
  }

  /**
   * Add an item (with optional variant) to the cart.
   *
   * Rules:
   *  - If the food item has variants, `variantId` is **required**.
   *  - Price is always taken from the variant when one is provided,
   *    otherwise from the food item's base price.
   *  - Uniqueness is (cartId, foodItemId, variantId) so e.g. a Small and a
   *    Large pizza are stored as separate cart lines.
   */
  static async addItem(data: AddToCartData) {
    const { sessionId, foodItemId, variantId, quantity } = data

    // Run cart lookup and food item lookup in parallel
    const [cart, foodItem] = await Promise.all([
      this.getOrCreateCart(sessionId),
      prisma.foodItem.findUnique({
        where: { id: foodItemId },
        select: {
          id: true,
          price: true,
          isAvailable: true,
          variants: {
            where: { isActive: true },
            select: { id: true, price: true },
          },
        },
      }),
    ])

    if (!foodItem) throw new Error('Food item not found')
    if (!foodItem.isAvailable) throw new Error('Food item is not available')

    // Validate variantId when the item has variants
    if (foodItem.variants.length > 0 && !variantId) {
      throw new Error('Please select a size/variant for this item')
    }

    let resolvedVariantId: string | null = null
    let price = foodItem.price

    if (variantId) {
      const variant = foodItem.variants.find((v: { id: string; price: number }) => v.id === variantId)
      if (!variant) throw new Error('Selected variant not found or inactive')
      resolvedVariantId = variantId
      price = variant.price
    }

    // Check for an existing line with the same (foodItem + variant)
    // Use findFirst with compound where instead of findUnique with compound key
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        foodItemId: foodItemId,
        variantId: resolvedVariantId,
      },
      select: { id: true, quantity: true },
    })

    if (existingItem) {
      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          price, // refresh price in case it changed
        },
        select: cartItemSelect,
      })
    }

    return await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        foodItemId,
        variantId: resolvedVariantId,
        quantity,
        price,
      },
      select: cartItemSelect,
    })
  }

  static async updateItem(cartItemId: string, data: UpdateCartItemData) {
    if (data.quantity <= 0) return await this.removeItem(cartItemId)

    return await prisma.cartItem.update({
      where: { id: cartItemId },
      data,
      select: cartItemSelect,
    })
  }

  static async removeItem(cartItemId: string) {
    return await prisma.cartItem.delete({
      where: { id: cartItemId },
      select: { id: true },
    })
  }

  static async clearCart(sessionId: string) {
    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      select: { id: true },
    })
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    }
    return { success: true }
  }

  static async getCartSummary(sessionId: string) {
    const cart = await this.getOrCreateCart(sessionId)

    return {
      items: cart.items,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }
  }

  static calculateDeliveryCharges(distance: number): number {
    if (distance <= 4) return 0
    if (distance <= 6) return 50
    return 120
  }
}