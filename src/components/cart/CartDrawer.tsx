// components/CartDrawer.tsx
"use client";

import { useState, useEffect } from "react";
import { X, ShoppingBag, Trash2, Sparkles, TrendingUp } from "lucide-react";
import CartItem from "./CartItem";
import Image from "next/image";

interface FoodItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image?: string;
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
  };
}

interface CartItemType {
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
  items: CartItemType[];
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
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

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

  // Fetch smart suggestions based on cart items
  const fetchSuggestions = async () => {
    if (!cartData || cartData.items.length === 0) return;

    try {
      setLoadingSuggestions(true);
      
      // Get all menu items
      const response = await fetch('/api/food-items');
      const data = await response.json();
      
      if (data.success) {
        const allItems = data.data as FoodItem[];
        const cartItemIds = cartData.items.map(item => item.foodItemId);
        
        // Filter out items already in cart and unavailable items
        const availableItems = allItems.filter(
          item => !cartItemIds.includes(item.id) && item.isAvailable
        );

        // Helper function to check if item is in drinks/beverage category
        const isDrinkCategory = (categoryName: string): boolean => {
          const drinkKeywords = ["drink", "beverage", "juice", "soda", "coffee", "tea", "shake", "smoothie", "water"];
          return drinkKeywords.some(keyword => 
            categoryName.toLowerCase().includes(keyword)
          );
        };

        // Helper function to check if item is in sauce/condiment category
        const isSauceCategory = (categoryName: string): boolean => {
          const sauceKeywords = ["sauce", "dip", "condiment", "ketchup", "mayo", "chutney", "raita"];
          return sauceKeywords.some(keyword => 
            categoryName.toLowerCase().includes(keyword)
          );
        };

        // Prioritize drinks and sauces
        const drinkItems = availableItems.filter(item =>
          isDrinkCategory(item.category?.name || "")
        );

        const sauceItems = availableItems.filter(item =>
          isSauceCategory(item.category?.name || "")
        );

        // Check for deal items (secondary priority)
        const dealItems = availableItems.filter(item => {
          const dealKeywords = ["top deals", "special deals", "deals", "offer", "discount"];
          const categoryName = item.category?.name?.toLowerCase() || "";
          return dealKeywords.some(keyword => categoryName.includes(keyword));
        });

        // Combine suggestions with priority: drinks → sauces → deals → other items
        const suggestedItems = [
          ...drinkItems.slice(0, 2),      // Show up to 2 drinks
          ...sauceItems.slice(0, 1),       // Show 1 sauce/dip
          ...dealItems.slice(0, 1),        // Show 1 deal item
          ...availableItems.slice(0, 2)    // Fallback items
        ];

        // Remove duplicates and limit to 4-5 items
        const uniqueSuggestions = Array.from(
          new Map(suggestedItems.map(item => [item.id, item])).values()
        ).slice(0, 5);

        setSuggestions(uniqueSuggestions);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Add suggested item to cart
  const addSuggestionToCart = async (foodItemId: string) => {
    try {
      setAddingToCart(foodItemId);
      
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          foodItemId,
          quantity: 1,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        await fetchCart();
        // Remove the added item from suggestions
        setSuggestions(prev => prev.filter(item => item.id !== foodItemId));
      }
    } catch (error) {
      console.error("Failed to add suggestion to cart:", error);
    } finally {
      setAddingToCart(null);
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
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newQuantity }),
        });
      }

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

  // Fetch suggestions when cart data changes
  useEffect(() => {
    if (cartData && cartData.items.length > 0) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [cartData?.items.length]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Helper function to check if item is a deal
  const isDealItem = (item: FoodItem): boolean => {
    const dealKeywords = ["top deals", "special deals", "deals", "offer", "discount"];
    const categoryName = item.category?.name?.toLowerCase() || "";
    return dealKeywords.some(keyword => categoryName.includes(keyword));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[90vw] sm:max-w-md bg-[#101828] z-50 transform transition-transform border-l-2 border-yellow-500/20 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-yellow-500/20 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            <h2 className="text-base sm:text-lg font-bold text-white">Your Cart</h2>
            {cartData && (
              <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                {cartData.itemCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 hover:bg-yellow-500/10 rounded-full transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-yellow-500 mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm sm:text-base">Loading cart...</p>
              </div>
            </div>
          ) : !cartData || cartData.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <ShoppingBag className="w-16 h-16 sm:w-20 sm:h-20 text-gray-600 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                  Your cart is empty
                </h3>
                <p className="text-sm sm:text-base text-gray-400 mb-6">
                  Add some delicious items to get started!
                </p>
                <button
                  onClick={onClose}
                  className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors text-sm sm:text-base min-h-[44px]"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
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

                {/* Suggestions Section */}
                {suggestions.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-yellow-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <h3 className="text-sm font-bold text-white">Complete Your Meal</h3>
                      <span className="text-[10px] text-gray-500 ml-auto">Drinks & More</span>
                    </div>
                    
                    <div className="space-y-2">
                      {suggestions.map((item) => {
                        const isDeals = isDealItem(item);
                        const isAdding = addingToCart === item.id;
                        
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                              isDeals
                                ? 'bg-red-900/20 border-red-500/30 hover:border-red-500/50'
                                : 'bg-black/30 border-yellow-500/20 hover:border-yellow-500/40'
                            }`}
                          >
                            {/* Item Image */}
                            <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                  <ShoppingBag className="w-6 h-6 text-gray-600" />
                                </div>
                              )}
                              {isDeals && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white px-1 py-0.5 text-[8px] font-bold rounded-bl">
                                  DEAL
                                </div>
                              )}
                            </div>

                            {/* Item Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white text-xs font-medium truncate">
                                {item.name}
                              </h4>
                              <p className={`text-xs font-bold ${isDeals ? 'text-red-400' : 'text-yellow-500'}`}>
                                Rs {item.price.toFixed(2)}
                              </p>
                            </div>

                            {/* Add Button */}
                            <button
                              onClick={() => addSuggestionToCart(item.id)}
                              disabled={isAdding}
                              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[32px] flex items-center gap-1 ${
                                isDeals
                                  ? 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-500/50'
                                  : 'bg-yellow-500 text-black hover:bg-yellow-600 disabled:bg-yellow-500/50'
                              }`}
                            >
                              {isAdding ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                              ) : (
                                <>
                                  <TrendingUp className="w-3 h-3" />
                                  <span>Add</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {loadingSuggestions && (
                      <div className="text-center py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mx-auto"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Summary & Actions */}
              <div className="border-t border-yellow-500/20 p-3 sm:p-4 space-y-3 sm:space-y-4 flex-shrink-0 bg-[#101828]">
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm sm:text-base text-gray-300">
                    <span>Subtotal:</span>
                    <span>Rs {(cartData?.subtotal ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg font-bold text-white border-t border-yellow-500/20 pt-2">
                    <span>Total:</span>
                    <span className="text-yellow-500">
                      Rs {(cartData?.subtotal ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 text-center">
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
                    className="w-full bg-yellow-500 text-black py-3 sm:py-3.5 rounded-lg font-bold hover:bg-yellow-600 transition-colors text-sm sm:text-base min-h-[44px]"
                  >
                    Proceed to Checkout
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        window.location.href = "/cart";
                      }}
                      className="flex-1 bg-transparent border border-yellow-500 text-yellow-500 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-yellow-500/10 transition-colors text-sm sm:text-base min-h-[44px]"
                    >
                      View Cart
                    </button>
                    <button
                      onClick={clearCart}
                      disabled={loading}
                      className="px-4 sm:px-5 py-2.5 sm:py-3 bg-transparent border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Clear cart"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
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