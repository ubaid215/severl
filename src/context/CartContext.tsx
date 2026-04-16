// contexts/CartContext.tsx
'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useOptimizedCart } from '@/hooks/useOptimizedCart'

interface CartItem {
  id: string
  foodItemId: string
  variantId?: string  // Add this
  quantity: number
  price: number
  variant?: {
    id: string
    label: string
    price: number
  }
  foodItem: {
    id: string
    name: string
    image?: string
    price: number
  }
}

interface Cart {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

interface CartContextType {
  cart: Cart | null
  loading: boolean
  sessionId: string
  addToCart: (foodItemId: string, quantity?: number, variantId?: string) => Promise<void>  // Add variantId parameter
  removeFromCart: (cartItemId: string) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const cartData = useOptimizedCart()

  return (
    <CartContext.Provider value={cartData}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}