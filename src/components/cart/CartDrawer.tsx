// components/CartDrawer.tsx
"use client";

import { useState, useEffect } from "react";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import CartItem from "./CartItem";

interface CartItem {
  id: string;
  foodItemId: string;
  quantity: number;
  foodItem: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
}

interface CartSummary {
  items: CartItem[];
  subtotal: number;
  deliveryCharges: number;
  total: number;
  itemCount: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export default function CartDrawer({
  isOpen,
  onClose,
  sessionId,
}: CartDrawerProps) {
  const [cartData, setCartData] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

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
        // Remove item
        await fetch(`/api/cart/${itemId}`, {
          method: "DELETE",
        });
      } else {
        // Update quantity
        await fetch(`/api/cart/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newQuantity }),
        });
      }

      // Refresh cart data
      await fetchCart();
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
    } catch (error) {
      console.error("Failed to clear cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen, sessionId]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#101828] z-50 transform transition-transform border-l-2 border-yellow-500/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-yellow-500/20">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-bold text-white">Your Cart</h2>
            {cartData && (
              <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                {cartData.itemCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-yellow-500/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-80px)]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
                <p className="text-gray-400">Loading cart...</p>
              </div>
            </div>
          ) : !cartData || cartData.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-400 mb-4">
                  Add some delicious items to get started!
                </p>
                <button
                  onClick={onClose}
                  className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cartData.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    isUpdating={updatingItem === item.id}
                  />
                ))}
              </div>

              {/* Summary & Actions */}
              <div className="border-t border-yellow-500/20 p-4 space-y-4">
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span>Rs {(cartData?.subtotal ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-white border-t border-yellow-500/20 pt-2">
                    <span>Total:</span>
                    <span className="text-yellow-500">
                      Rs {(cartData?.subtotal ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 text-center">
                    Delivery charges will be calculated at checkout
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onClose();
                      window.location.href = "/checkout";
                    }}
                    className="w-full bg-yellow-500 text-black py-3 rounded-lg font-bold hover:bg-yellow-600 transition-colors"
                  >
                    Proceed to Checkout
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        window.location.href = "/cart";
                      }}
                      className="flex-1 bg-transparent border border-yellow-500 text-yellow-500 py-2 rounded-lg font-semibold hover:bg-yellow-500/10 transition-colors"
                    >
                      View Cart
                    </button>
                    <button
                      onClick={clearCart}
                      disabled={loading}
                      className="px-4 py-2 bg-transparent border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}