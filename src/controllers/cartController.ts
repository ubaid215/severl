import { NextRequest, NextResponse } from 'next/server'
import { CartModel } from '@/models/cart'

export class CartController {
  static async getCart(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const sessionId = searchParams.get('sessionId')

      if (!sessionId) {
        return NextResponse.json(
          { error: 'Session ID is required' },
          { status: 400 }
        )
      }

      const cartSummary = await CartModel.getCartSummary(sessionId)

      return NextResponse.json({
        success: true,
        data: cartSummary
      })
    } catch (error) {
      console.error('Get cart error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async addToCart(req: NextRequest) {
    try {
      const { sessionId, foodItemId, quantity = 1 } = await req.json()

      if (!sessionId || !foodItemId) {
        return NextResponse.json(
          { error: 'Session ID and food item ID are required' },
          { status: 400 }
        )
      }

      if (quantity <= 0) {
        return NextResponse.json(
          { error: 'Quantity must be greater than 0' },
          { status: 400 }
        )
      }

      const cartItem = await CartModel.addItem({
        sessionId,
        foodItemId,
        quantity
      })

      return NextResponse.json({
        success: true,
        data: cartItem,
        message: 'Item added to cart successfully'
      })
    } catch (error: any) {
      console.error('Add to cart error:', error)
      
      if (error.message === 'Food item not found') {
        return NextResponse.json(
          { error: 'Food item not found' },
          { status: 404 }
        )
      }
      
      if (error.message === 'Food item is not available') {
        return NextResponse.json(
          { error: 'Food item is not available' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async updateCartItem(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const { quantity } = await req.json()

      if (quantity === undefined || quantity < 0) {
        return NextResponse.json(
          { error: 'Valid quantity is required' },
          { status: 400 }
        )
      }

      if (quantity === 0) {
        // Remove item if quantity is 0
        return await this.removeFromCart(req, { params })
      }

      const cartItem = await CartModel.updateItem(params.id, { quantity })

      return NextResponse.json({
        success: true,
        data: cartItem,
        message: 'Cart item updated successfully'
      })
    } catch (error: any) {
      console.error('Update cart item error:', error)
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Cart item not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async removeFromCart(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      await CartModel.removeItem(params.id)

      return NextResponse.json({
        success: true,
        message: 'Item removed from cart successfully'
      })
    } catch (error: any) {
      console.error('Remove from cart error:', error)
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Cart item not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async clearCart(req: NextRequest) {
    try {
      const { sessionId } = await req.json()

      if (!sessionId) {
        return NextResponse.json(
          { error: 'Session ID is required' },
          { status: 400 }
        )
      }

      await CartModel.clearCart(sessionId)

      return NextResponse.json({
        success: true,
        message: 'Cart cleared successfully'
      })
    } catch (error) {
      console.error('Clear cart error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async calculateDeliveryCharges(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const distance = parseFloat(searchParams.get('distance') || '0')

      if (distance < 0) {
        return NextResponse.json(
          { error: 'Distance must be a positive number' },
          { status: 400 }
        )
      }

      const deliveryCharges = CartModel.calculateDeliveryCharges(distance)

      return NextResponse.json({
        success: true,
        data: {
          distance,
          deliveryCharges,
          freeDelivery: distance <= 4
        }
      })
    } catch (error) {
      console.error('Calculate delivery charges error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}