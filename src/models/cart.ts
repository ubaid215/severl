import { prisma } from '../app/lib/prisma'

export interface AddToCartData {
  sessionId: string
  foodItemId: string
  quantity: number
}

export interface UpdateCartItemData {
  quantity: number
}

export class CartModel {
  static async getOrCreateCart(sessionId: string) {
    let cart = await prisma.cart.findUnique({
      where: { sessionId },
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

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId },
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

    return cart
  }

  static async addItem(data: AddToCartData) {
    const { sessionId, foodItemId, quantity } = data

    // Get or create cart
    const cart = await this.getOrCreateCart(sessionId)

    // Get food item to get current price
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: foodItemId }
    })

    if (!foodItem) {
      throw new Error('Food item not found')
    }

    if (!foodItem.isAvailable) {
      throw new Error('Food item is not available')
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_foodItemId: {
          cartId: cart.id,
          foodItemId
        }
      }
    })

    if (existingItem) {
      // Update quantity
      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { 
          quantity: existingItem.quantity + quantity,
          price: foodItem.price // Update price in case it changed
        },
        include: {
          foodItem: {
            include: {
              category: true
            }
          }
        }
      })
    } else {
      // Create new cart item
      return await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          foodItemId,
          quantity,
          price: foodItem.price
        },
        include: {
          foodItem: {
            include: {
              category: true
            }
          }
        }
      })
    }
  }

  static async updateItem(cartItemId: string, data: UpdateCartItemData) {
    if (data.quantity <= 0) {
      return await this.removeItem(cartItemId)
    }

    return await prisma.cartItem.update({
      where: { id: cartItemId },
      data,
      include: {
        foodItem: {
          include: {
            category: true
          }
        }
      }
    })
  }

  static async removeItem(cartItemId: string) {
    return await prisma.cartItem.delete({
      where: { id: cartItemId }
    })
  }

  static async clearCart(sessionId: string) {
    const cart = await prisma.cart.findUnique({
      where: { sessionId }
    })

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      })
    }

    return { success: true }
  }

  static async getCartSummary(sessionId: string) {
    const cart = await this.getOrCreateCart(sessionId)
    
    const summary = {
      items: cart.items,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    }

    return summary
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
}