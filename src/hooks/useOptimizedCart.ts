// hooks/useOptimizedCart.ts
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface CartItem {
  id: string
  foodItemId: string
  variantId?: string
  quantity: number
  price: number // This should be the actual price (variant price)
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

const CART_CACHE_DURATION = 3 * 1000 // 3 seconds for better sync

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

  // Enhanced fetch cart function with better cache invalidation
  const fetchCart = useCallback(async (force: boolean = false) => {
    if (!sessionId) return

    // Clear cache if forced
    if (force) {
      globalCartCache.timestamp = 0
      console.log('🗑️ Cart cache invalidated - forced refresh')
    }

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
      return globalCartCache.data
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
        return result
      } catch (error) {
        console.error('Cart fetch error:', error)
        if (mountedRef.current) {
          setLoading(false)
        }
        return null
      }
    }

    // Clear existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
    }

    // Mark as fetching
    globalCartCache.isFetching = true
    if (mountedRef.current) {
      setLoading(true)
    }

    // Create new fetch promise
    globalFetchPromise = new Promise(async (resolve, reject) => {
      fetchTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('🔄 Fetching cart from API...')
          const response = await fetch(`/api/cart?sessionId=${sessionId}&t=${Date.now()}`, {
            cache: 'no-cache'
          })
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const data = await response.json()
          console.log('📦 Cart API response:', data)

          let cartData: Cart = {
            items: [],
            totalItems: 0,
            totalPrice: 0
          }

          if (data.success && data.data) {
            // Transform data to match our Cart interface
            // IMPORTANT: Use the item's price from the API (which should be the variant price)
            cartData = {
              items: data.data.items?.map((item: any) => {
                // Determine the correct price: item.price (from cart) > variant.price > foodItem.price
                let itemPrice = item.price
                if (!itemPrice && item.variant?.price) {
                  itemPrice = item.variant.price
                }
                if (!itemPrice && item.foodItem?.price) {
                  itemPrice = item.foodItem.price
                }
                
                console.log(`💰 Item ${item.foodItem?.name}:`, {
                  cartItemPrice: item.price,
                  variantPrice: item.variant?.price,
                  foodItemPrice: item.foodItem?.price,
                  finalPrice: itemPrice
                })
                
                return {
                  id: item.id,
                  foodItemId: item.foodItemId,
                  variantId: item.variantId,
                  quantity: item.quantity,
                  price: itemPrice, // Use the actual price from cart/variant
                  variant: item.variant,
                  foodItem: {
                    id: item.foodItem?.id || item.foodItemId,
                    name: item.foodItem?.name || 'Unknown Item',
                    image: item.foodItem?.image,
                    price: item.foodItem?.price || 0
                  }
                }
              }) || [],
              totalItems: data.data.itemCount || 0,
              totalPrice: data.data.subtotal || 0
            }
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
            setLoading(false)
          }

          console.log('✅ Cart data updated:', {
            itemsCount: cartData.items.length,
            totalPrice: cartData.totalPrice,
            items: cartData.items.map(i => ({
              name: i.foodItem.name,
              price: i.price,
              quantity: i.quantity,
              variant: i.variant?.label
            }))
          })
          resolve(cartData)
        } catch (error) {
          console.error('❌ Error fetching cart:', error)
          globalCartCache.isFetching = false
          if (mountedRef.current) {
            setLoading(false)
          }
          reject(error)
        } finally {
          globalFetchPromise = null
        }
      }, 100)
    })

    try {
      const result = await globalFetchPromise
      return result
    } catch (error) {
      return null
    }
  }, [sessionId])

  // Fetch cart on mount and when sessionId changes
  useEffect(() => {
    mountedRef.current = true
    if (sessionId) {
      fetchCart()
    }

    // Listen for cart updates from anywhere in the app
    const handleCartUpdate = (event: CustomEvent) => {
      console.log('📢 useOptimizedCart: Received cart update event', event.detail)
      fetchCart(true) // Force refresh
    }

    // Listen for both custom events and storage events
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cartUpdated') {
        console.log('💾 Storage event: cart updated')
        fetchCart(true)
      }
    }

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      mountedRef.current = false
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [sessionId, fetchCart])

  // FIXED: Enhanced add to cart with variantId support and price handling
  const addToCart = useCallback(async (foodItemId: string, quantity: number = 1, variantId?: string) => {
    if (!sessionId) {
      console.error('❌ No session ID available')
      return
    }

    try {
      // Immediately invalidate cache
      globalCartCache.timestamp = 0
      
      console.log('🛒 Adding item to cart:', { foodItemId, quantity, variantId, sessionId })

      // Build request body - only include variantId if provided
      const requestBody: any = { 
        sessionId, 
        foodItemId, 
        quantity 
      }
      
      if (variantId) {
        requestBody.variantId = variantId
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Add to cart response:', data)
      
      if (data.success) {
        // Fetch updated cart immediately to get the correct price
        const updatedCart = await fetchCart(true)
        
        // Log the added item price for verification
        const addedItem = updatedCart?.items.find(item => item.foodItemId === foodItemId)
        if (addedItem) {
          console.log(`💰 Item "${addedItem.foodItem.name}" added with price: ${addedItem.price}`, 
            addedItem.variant ? `(Variant: ${addedItem.variant.label})` : '(No variant)')
        }
        
        // Trigger multiple update methods for maximum compatibility
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { source: 'addToCart', foodItemId, quantity, variantId } 
        }))
        
        // Also update localStorage as a backup sync method
        localStorage.setItem('cartUpdated', Date.now().toString())
        
        console.log('🎉 Item added to cart and events dispatched')
      } else {
        throw new Error(data.message || 'Failed to add item to cart')
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error)
      // Even on error, refresh cart to ensure sync
      await fetchCart(true)
      throw error // Re-throw so FoodCard can handle it
    }
  }, [sessionId, fetchCart])

  // Enhanced remove from cart
  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (!sessionId) return

    try {
      globalCartCache.timestamp = 0

      console.log('🗑️ Removing item from cart:', cartItemId)

      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      if (response.ok) {
        await fetchCart(true)
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { source: 'removeFromCart', cartItemId } 
        }))
        localStorage.setItem('cartUpdated', Date.now().toString())
      }
    } catch (error) {
      console.error('❌ Error removing from cart:', error)
      await fetchCart(true)
    }
  }, [sessionId, fetchCart])

  // Enhanced update quantity
  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (!sessionId) return

    try {
      globalCartCache.timestamp = 0

      console.log('📊 Updating quantity:', { cartItemId, quantity })

      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, sessionId })
      })

      if (response.ok) {
        await fetchCart(true)
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { source: 'updateQuantity', cartItemId, quantity } 
        }))
        localStorage.setItem('cartUpdated', Date.now().toString())
      }
    } catch (error) {
      console.error('❌ Error updating quantity:', error)
      await fetchCart(true)
    }
  }, [sessionId, fetchCart])

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!sessionId) return

    try {
      globalCartCache.timestamp = 0

      console.log('🧹 Clearing entire cart')

      const response = await fetch('/api/cart/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      if (response.ok) {
        await fetchCart(true)
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { source: 'clearCart' } 
        }))
        localStorage.setItem('cartUpdated', Date.now().toString())
      }
    } catch (error) {
      console.error('❌ Error clearing cart:', error)
      await fetchCart(true)
    }
  }, [sessionId, fetchCart])

  // Manual refresh
  const refreshCart = useCallback(() => {
    console.log('🔃 Manual cart refresh triggered')
    fetchCart(true)
  }, [fetchCart])

  return {
    cart,
    loading,
    sessionId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart
  }
}