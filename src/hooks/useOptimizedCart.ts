// hooks/useOptimizedCart.ts
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface CartItem {
  id: string
  foodItemId: string
  quantity: number
  price: number
  foodItem: {
    name: string
    image?: string
  }
}

interface Cart {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

// Global cart cache - shared across all hook instances
let globalCartCache: {
  data: Cart | null
  timestamp: number
  sessionId: string
  isFetching: boolean
} = {
  data: null,
  timestamp: 0,
  sessionId: '',
  isFetching: false
}

// Global fetch promise to prevent duplicate requests
let globalFetchPromise: Promise<Cart | null> | null = null

const CART_CACHE_DURATION = 10 * 1000 // 10 seconds

export function useOptimizedCart() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string>('')
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // Generate or retrieve session ID
  useEffect(() => {
    let id = localStorage.getItem('sessionId')
    if (!id) {
      id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('sessionId', id)
    }
    setSessionId(id)
  }, [])

  // Fetch cart function with global deduplication
  const fetchCart = useCallback(async (force: boolean = false) => {
    if (!sessionId) return

    // Use global cache if available and fresh
    if (
      !force &&
      globalCartCache.data &&
      globalCartCache.sessionId === sessionId &&
      Date.now() - globalCartCache.timestamp < CART_CACHE_DURATION
    ) {
      if (mountedRef.current) {
        setCart(globalCartCache.data)
        setLoading(false)
      }
      console.log('✅ Using cached cart data')
      return
    }

    // If already fetching, wait for that promise
    if (globalCartCache.isFetching && globalFetchPromise) {
      console.log('⏳ Cart fetch already in progress, waiting...')
      try {
        const result = await globalFetchPromise
        if (mountedRef.current) {
          setCart(result)
          setLoading(false)
        }
      } catch (error) {
        console.error('Cart fetch error:', error)
        if (mountedRef.current) {
          setLoading(false)
        }
      }
      return
    }

    // Clear existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
    }

    // Mark as fetching
    globalCartCache.isFetching = true

    // Create new fetch promise
    globalFetchPromise = new Promise(async (resolve) => {
      // Debounce the fetch
      fetchTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('🔄 Fetching cart from API')
          const response = await fetch(`/api/cart?sessionId=${sessionId}`)
          const data = await response.json()

          const cartData = {
            items: data.items || [],
            totalItems: data.totalItems || 0,
            totalPrice: data.totalPrice || 0
          }

          // Update global cache
          globalCartCache = {
            data: cartData,
            timestamp: Date.now(),
            sessionId,
            isFetching: false
          }

          if (mountedRef.current) {
            setCart(cartData)
          }

          resolve(cartData)
        } catch (error) {
          console.error('Error fetching cart:', error)
          globalCartCache.isFetching = false
          resolve(null)
        } finally {
          if (mountedRef.current) {
            setLoading(false)
          }
          globalFetchPromise = null
        }
      }, 300) // 300ms debounce
    })

    await globalFetchPromise
  }, [sessionId])

  // Fetch cart on mount and when sessionId changes
  useEffect(() => {
    mountedRef.current = true
    if (sessionId) {
      fetchCart()
    }
    return () => {
      mountedRef.current = false
    }
  }, [sessionId, fetchCart])

  // Add to cart with optimistic update
  const addToCart = useCallback(async (foodItemId: string, quantity: number = 1) => {
    if (!sessionId) return

    try {
      // Invalidate cache
      globalCartCache.timestamp = 0

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, foodItemId, quantity })
      })

      if (response.ok) {
        // Fetch updated cart after short delay
        setTimeout(() => fetchCart(true), 500)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }, [sessionId, fetchCart])

  // Remove from cart
  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (!sessionId) return

    try {
      // Invalidate cache
      globalCartCache.timestamp = 0

      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Fetch updated cart after short delay
        setTimeout(() => fetchCart(true), 500)
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
    }
  }, [sessionId, fetchCart])

  // Update quantity
  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (!sessionId) return

    try {
      // Invalidate cache
      globalCartCache.timestamp = 0

      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      })

      if (response.ok) {
        // Fetch updated cart after short delay
        setTimeout(() => fetchCart(true), 500)
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }, [sessionId, fetchCart])

  // Manual refresh
  const refreshCart = useCallback(() => {
    fetchCart(true)
  }, [fetchCart])

  return {
    cart,
    loading,
    sessionId,
    addToCart,
    removeFromCart,
    updateQuantity,
    refreshCart
  }
}