// app/cart/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Plus, Minus, Trash2, Clock, ShoppingBag } from "lucide-react";

interface CartItem {
  id: string;
  foodItemId: string;
  quantity: number;
  foodItem: {
    id: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
  };
}

interface CartSummary {
  items: CartItem[];
  subtotal: number;
  deliveryCharges: number;
  total: number;
  itemCount: number;
}

// Custom hook for debounced API calls
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]) as T;
}

export default function CartPage() {
  const [cartData, setCartData] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Cache for pending operations to prevent redundant API calls
  const pendingOperations = useRef(new Map<string, Promise<any>>());
  const lastFetchTime = useRef(0);
  const FETCH_COOLDOWN = 1000; // Minimum 1 second between fetches

  // Initialize everything on client only
  useEffect(() => {
    setMounted(true);
    
    let existingSessionId = localStorage.getItem("sessionId");
    if (!existingSessionId) {
      existingSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("sessionId", existingSessionId);
    }
    setSessionId(existingSessionId);
  }, []);

  // Optimized fetch cart with caching and cooldown
  const fetchCart = useCallback(async (force = false) => {
    if (!sessionId || !mounted) return;
    
    const now = Date.now();
    if (!force && now - lastFetchTime.current < FETCH_COOLDOWN) {
      return; // Skip if called too recently
    }
    
    // Check if there's already a pending fetch
    if (pendingOperations.current.has('fetch')) {
      return pendingOperations.current.get('fetch');
    }
    
    try {
      setLoading(true);
      lastFetchTime.current = now;
      
      const fetchPromise = fetch(`/api/cart?sessionId=${sessionId}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setCartData(data.data);
          } else {
            setCartData(null);
          }
          return data;
        })
        .finally(() => {
          pendingOperations.current.delete('fetch');
        });
      
      pendingOperations.current.set('fetch', fetchPromise);
      await fetchPromise;
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCartData(null);
      pendingOperations.current.delete('fetch');
    } finally {
      setLoading(false);
    }
  }, [sessionId, mounted]);

  // Debounced fetch to prevent excessive API calls
  const debouncedFetchCart = useDebounce(fetchCart, 500);

  // Optimistic UI updates with batch operations
  const updateCartItemOptimistically = useCallback((itemId: string, newQuantity: number) => {
    if (!cartData) return;
    
    setCartData(prevData => {
      if (!prevData) return null;
      
      const updatedItems = prevData.items.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity: Math.max(0, newQuantity) };
        }
        return item;
      }).filter(item => item.quantity > 0); // Remove items with 0 quantity
      
      const subtotal = updatedItems.reduce((sum, item) => 
        sum + (item.foodItem.price * item.quantity), 0
      );
      
      return {
        ...prevData,
        items: updatedItems,
        subtotal,
        total: subtotal + prevData.deliveryCharges,
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    });
  }, [cartData]);

  // Batch update operations to reduce API calls
  const batchUpdateQueue = useRef(new Map<string, number>());
  const processBatchUpdates = useCallback(async () => {
    if (batchUpdateQueue.current.size === 0 || !sessionId) return;
    
    const updates = Array.from(batchUpdateQueue.current.entries());
    batchUpdateQueue.current.clear();
    
    try {
      // Process all updates in parallel
      await Promise.all(
        updates.map(async ([itemId, quantity]) => {
          const operationKey = `update_${itemId}`;
          
          if (pendingOperations.current.has(operationKey)) {
            return;
          }
          
          const updatePromise = (async () => {
            if (quantity <= 0) {
              // Remove item
              const response = await fetch(`/api/cart/${itemId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
              });
              return response.json();
            } else {
              // Update quantity
              const response = await fetch(`/api/cart/${itemId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity, sessionId }),
              });
              return response.json();
            }
          })().finally(() => {
            pendingOperations.current.delete(operationKey);
            setUpdatingItems(prev => {
              const next = new Set(prev);
              next.delete(itemId);
              return next;
            });
          });
          
          pendingOperations.current.set(operationKey, updatePromise);
          return updatePromise;
        })
      );
      
      // Fetch fresh data after all updates
      setTimeout(() => fetchCart(true), 100);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
    } catch (error) {
      console.error("Failed to process batch updates:", error);
      // Revert optimistic updates by fetching fresh data
      fetchCart(true);
    }
  }, [sessionId, fetchCart]);

  // Debounced batch processor
  const debouncedBatchProcess = useDebounce(processBatchUpdates, 800);

  // Update item quantity with optimistic UI and batching
  const updateQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0 || !mounted || !sessionId) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    // Optimistic update
    updateCartItemOptimistically(itemId, newQuantity);
    
    // Add to batch queue
    batchUpdateQueue.current.set(itemId, newQuantity);
    
    // Process batch after delay
    debouncedBatchProcess();
  }, [mounted, sessionId, updateCartItemOptimistically, debouncedBatchProcess]);

  // Remove item from cart with optimistic update
  const removeItem = useCallback(async (itemId: string) => {
    if (!mounted || !sessionId) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    // Optimistic update
    updateCartItemOptimistically(itemId, 0);
    
    // Add to batch queue
    batchUpdateQueue.current.set(itemId, 0);
    
    // Process batch after delay
    debouncedBatchProcess();
  }, [mounted, sessionId, updateCartItemOptimistically, debouncedBatchProcess]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!sessionId || !mounted) return;
    
    // Clear any pending batch operations
    batchUpdateQueue.current.clear();
    
    try {
      setLoading(true);
      const response = await fetch("/api/cart/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optimistically clear the cart
      setCartData(null);
      
      // Fetch to confirm
      setTimeout(() => fetchCart(true), 100);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error("Failed to clear cart:", error);
      // Revert by fetching fresh data
      fetchCart(true);
    } finally {
      setLoading(false);
    }
  }, [sessionId, mounted, fetchCart]);

  // Initial cart fetch
  useEffect(() => {
    if (sessionId && mounted) {
      fetchCart();
    }
  }, [sessionId, mounted, fetchCart]);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = () => debouncedFetchCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [debouncedFetchCart]);

  // Cleanup pending operations on unmount
  useEffect(() => {
    return () => {
      pendingOperations.current.clear();
      batchUpdateQueue.current.clear();
    };
  }, []);

  // Show loading state during SSR and initial client mount
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#101828] to-gray-900">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart state only after we've loaded data
  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#101828] to-gray-900">
        <div className="text-center py-20">
          <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link
            href="/menu"
            className="inline-flex items-center bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Safe helper functions to handle potential undefined values
  const getSubtotal = () => cartData?.subtotal || 0;
  const getItemCount = () => cartData?.itemCount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#101828] to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/menu"
            className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-yellow-500" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
            <p className="text-gray-400">Review your items before checkout</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-[#101828] rounded-xl border-2 border-yellow-500/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Cart Items ({getItemCount()})
                </h2>
                <button
                  onClick={clearCart}
                  disabled={loading}
                  className="text-red-500 hover:text-red-400 text-sm font-medium disabled:opacity-50"
                >
                  Clear Cart
                </button>
              </div>

              <div className="space-y-4">
                {cartData.items.map((item) => (
                  <div key={item.id} className="relative">
                    <div className="flex items-start gap-4 p-4 bg-black/30 rounded-lg border border-yellow-500/20">
                      {/* Food Image */}
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                        {item.foodItem.image ? (
                          <Image
                            src={item.foodItem.image}
                            alt={item.foodItem.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <Clock className="w-8 h-8 text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg mb-1">
                          {item.foodItem.name}
                        </h3>
                        {item.foodItem.description && (
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                            {item.foodItem.description}
                          </p>
                        )}
                        <p className="text-yellow-500 font-bold">
                          Rs {(item.foodItem.price || 0).toFixed(2)} each
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-black/50 rounded-lg border border-yellow-500/30">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updatingItems.has(item.id) || item.quantity <= 1}
                            className="p-2 hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4 text-yellow-500" />
                          </button>
                          
                          <span className="px-4 py-2 text-white font-semibold min-w-[3rem] text-center">
                            {updatingItems.has(item.id) ? "..." : item.quantity}
                          </span>
                          
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updatingItems.has(item.id)}
                            className="p-2 hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4 text-yellow-500" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={updatingItems.has(item.id)}
                          className="p-2 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-500">
                          Rs {((item.foodItem.price || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Loading Overlay */}
                    {updatingItems.has(item.id) && (
                      <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#101828] rounded-xl border-2 border-yellow-500/20 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal ({getItemCount()} items):</span>
                  <span>Rs {getSubtotal().toFixed(2)}</span>
                </div>
                
                <hr className="border-yellow-500/20" />
                
                <div className="flex justify-between text-lg font-bold text-white">
                  <span>Total:</span>
                  <span className="text-yellow-500">Rs {getSubtotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="w-full bg-yellow-500 text-black py-3 rounded-lg font-bold hover:bg-yellow-600 transition-colors flex items-center justify-center"
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  href="/menu"
                  className="w-full bg-transparent border border-yellow-500 text-yellow-500 py-3 rounded-lg font-semibold hover:bg-yellow-500/10 transition-colors flex items-center justify-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}