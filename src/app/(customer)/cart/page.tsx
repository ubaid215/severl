// app/cart/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Plus, Minus, Trash2, Clock, ShoppingBag } from "lucide-react";
import Navigation from "@/components/layout/Navigation";

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

export default function CartPage() {
  const [cartData, setCartData] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");

  // Initialize session ID
  useEffect(() => {
    let existingSessionId = localStorage.getItem("sessionId");
    if (!existingSessionId) {
      existingSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("sessionId", existingSessionId);
    }
    setSessionId(existingSessionId);
  }, []);

  // Fetch cart data
  const fetchCart = async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/cart?sessionId=${sessionId}`);
      const data = await response.json();
      
      if (data.success) {
        setCartData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    try {
      setUpdatingItem(itemId);
      
      if (newQuantity === 0) {
        await fetch(`/api/cart/${itemId}`, {
          method: "DELETE",
        });
      } else {
        await fetch(`/api/cart/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newQuantity }),
        });
      }
      
      await fetchCart();
      // Trigger cart update event for navigation
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error("Failed to update item:", error);
    } finally {
      setUpdatingItem(null);
    }
  };

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    try {
      setUpdatingItem(itemId);
      await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });
      await fetchCart();
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setUpdatingItem(null);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setLoading(true);
      await fetch("/api/cart/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      await fetchCart();
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error("Failed to clear cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchCart();
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#101828] to-gray-900">
      <Navigation />
      
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

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your cart...</p>
            </div>
          </div>
        ) : !cartData || cartData.items.length === 0 ? (
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
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-[#101828] rounded-xl border-2 border-yellow-500/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Cart Items ({cartData.itemCount})
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
                            Rs {item.foodItem.price.toFixed(2)} each
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-black/50 rounded-lg border border-yellow-500/30">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updatingItem === item.id || item.quantity <= 1}
                              className="p-2 hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-4 h-4 text-yellow-500" />
                            </button>
                            
                            <span className="px-4 py-2 text-white font-semibold min-w-[3rem] text-center">
                              {updatingItem === item.id ? "..." : item.quantity}
                            </span>
                            
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updatingItem === item.id}
                              className="p-2 hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus className="w-4 h-4 text-yellow-500" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={updatingItem === item.id}
                            className="p-2 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-yellow-500">
                            Rs {(item.foodItem.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Loading Overlay */}
                      {updatingItem === item.id && (
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
                    <span>Subtotal ({cartData.itemCount} items):</span>
                    <span>Rs {cartData.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-300">
                    <span>Delivery Charges:</span>
                    <span>Rs {cartData.deliveryCharges.toFixed(2)}</span>
                  </div>
                  
                  {cartData.deliveryCharges === 0 && (
                    <p className="text-green-500 text-sm">🎉 Free delivery!</p>
                  )}
                  
                  <hr className="border-yellow-500/20" />
                  
                  <div className="flex justify-between text-lg font-bold text-white">
                    <span>Total:</span>
                    <span className="text-yellow-500">Rs {cartData.total.toFixed(2)}</span>
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

                {/* Delivery Info */}
                <div className="mt-6 p-4 bg-black/30 rounded-lg border border-yellow-500/20">
                  <h3 className="text-white font-semibold mb-2">Delivery Information</h3>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• Free delivery within 4km</li>
                    <li>• Rs 50 for 4-6km distance</li>
                    <li>• Rs 120 for above 6km</li>
                    <li>• Estimated time: 30-45 minutes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}