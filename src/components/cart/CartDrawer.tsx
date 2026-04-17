// components/cart/CartDrawer.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X, ShoppingBag, Trash2, Sparkles, TrendingUp } from "lucide-react";
import CartItem from "./CartItem";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useData } from "@/context/DataContext";

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
  variants?: Array<{
    id: string;
    label: string;
    price: number;
    isDefault: boolean;
    isActive: boolean;
  }>;
}

interface CartDrawerProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

const transformCartItem = (item: any) => ({
  id: item.id,
  foodItemId: item.foodItemId,
  quantity: item.quantity,
  variantId: item.variantId,
  variantLabel: item.variant?.label,
  foodItem: {
    id: item.foodItemId,
    name: item.foodItem?.name || "Unknown Item",
    price: item.price || 0,
    image: item.foodItem?.image,
  },
});

export default function CartDrawer({ isOpen, onCloseAction }: CartDrawerProps) {
  const { cart, loading, addToCart, removeFromCart, updateQuantity, refreshCart, sessionId } = useCart();
  const { foodItems } = useData();

  const [clearingCart, setClearingCart] = useState(false);
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [addingVariant, setAddingVariant] = useState<{ itemId: string; variantId: string } | null>(null);

  // Animation state
  const [animState, setAnimState] = useState<"closed" | "opening" | "open" | "closing">("closed");
  const [rendered, setRendered] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drive open / close animation
  useEffect(() => {
    if (isOpen) {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      setRendered(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimState("open"));
      });
    } else {
      setAnimState("closing");
      closeTimerRef.current = setTimeout(() => {
        setRendered(false);
        setAnimState("closed");
      }, 380);
    }
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [isOpen]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Suggestions with variant awareness
  useEffect(() => {
    if (!cart || cart.items.length === 0 || !foodItems.length) {
      setSuggestions([]);
      return;
    }
    const cartItemIds = cart.items.map((item) => item.foodItemId);
    const availableItems = foodItems.filter(
      (item) => !cartItemIds.includes(item.id) && item.isAvailable
    );
    const isDrink = (n: string) =>
      ["drink", "beverage", "juice", "soda", "coffee", "tea", "shake", "smoothie", "water"].some((k) =>
        n.toLowerCase().includes(k)
      );
    const isSauce = (n: string) =>
      ["sauce", "dip", "condiment", "ketchup", "mayo", "chutney", "raita"].some((k) =>
        n.toLowerCase().includes(k)
      );
    const isDeal = (n: string) =>
      ["top deals", "special deals", "deals", "offer", "discount"].some((k) =>
        n.toLowerCase().includes(k)
      );
    const unique = Array.from(
      new Map(
        [
          ...availableItems.filter((i) => isDrink(i.category?.name || "")).slice(0, 2),
          ...availableItems.filter((i) => isSauce(i.category?.name || "")).slice(0, 1),
          ...availableItems.filter((i) => isDeal(i.category?.name || "")).slice(0, 1),
          ...availableItems.slice(0, 2),
        ].map((i) => [i.id, i])
      ).values()
    ).slice(0, 5);
    setSuggestions(unique);
  }, [cart?.items.length, foodItems]);

  // Refresh on open
  useEffect(() => {
    if (isOpen) refreshCart();
  }, [isOpen, refreshCart]);

  const handleAddSuggestion = async (foodItemId: string, variantId?: string) => {
    setAddingToCart(foodItemId);
    try {
      await addToCart(foodItemId, 1, variantId);
      setSuggestions((prev) => prev.filter((i) => i.id !== foodItemId));
    } catch (error) {
      console.error("Failed to add suggestion:", error);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setUpdatingItem(itemId);
    await updateQuantity(itemId, newQuantity);
    setUpdatingItem(null);
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItem(itemId);
    await removeFromCart(itemId);
    setUpdatingItem(null);
  };

  const clearCart = async () => {
    try {
      setClearingCart(true);
      await fetch("/api/cart/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      await refreshCart();
    } catch (error) {
      console.error("Failed to clear cart:", error);
    } finally {
      setClearingCart(false);
    }
  };

  const isDealItem = (item: FoodItem) =>
    ["top deals", "special deals", "deals", "offer", "discount"].some((k) =>
      (item.category?.name || "").toLowerCase().includes(k)
    );

  // Helper to get variant selector for suggestion items
  const SuggestionItem = ({ item, idx }: { item: FoodItem; idx: number }) => {
    const [showVariants, setShowVariants] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<{ id: string; label: string; price: number } | null>(
      () => {
        if (item.variants && item.variants.length > 0) {
          const defaultVariant = item.variants.find(v => v.isDefault);
          return defaultVariant || item.variants[0] || null;
        }
        return null;
      }
    );
    
    const isDeals = isDealItem(item);
    const hasVariants = item.variants && item.variants.length > 0;
    const isAdding = addingToCart === item.id;
    const displayPrice = selectedVariant?.price ?? item.price;
    
    const handleAdd = async () => {
      if (hasVariants && !selectedVariant && !showVariants) {
        setShowVariants(true);
        return;
      }
      await handleAddSuggestion(item.id, selectedVariant?.id);
    };
    
    const handleVariantSelect = async (variant: NonNullable<typeof item.variants>[0]) => {
      setSelectedVariant({ id: variant.id, label: variant.label, price: variant.price });
      setShowVariants(false);
      // Auto-add after selection
      await handleAddSuggestion(item.id, variant.id);
    };
    
    return (
      <div
        style={{
          transition: `opacity 0.28s ease ${0.38 + idx * 0.07}s, transform 0.28s ease ${0.38 + idx * 0.07}s`,
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateX(0)" : "translateX(16px)",
        }}
        className={`flex flex-col p-2.5 rounded-lg border transition-colors ${
          isDeals
            ? "bg-red-900/20 border-red-500/30 hover:border-red-500/50"
            : "bg-black/30 border-yellow-500/20 hover:border-yellow-500/40"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden">
            {item.image ? (
              <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
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
          <div className="flex-1 min-w-0">
            <h4 className="text-white text-xs font-medium truncate">{item.name}</h4>
            {hasVariants && !showVariants && selectedVariant && (
              <p className="text-yellow-500/70 text-[10px]">{selectedVariant.label}</p>
            )}
            <p className={`text-xs font-bold ${isDeals ? "text-red-400" : "text-yellow-500"}`}>
              Rs {displayPrice.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={isAdding || (hasVariants && !selectedVariant && !showVariants)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[32px] flex items-center gap-1 ${
              isDeals
                ? "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-500/50"
                : "bg-yellow-500 text-black hover:bg-yellow-600 disabled:bg-yellow-500/50"
            }`}
          >
            {isAdding ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
            ) : (
              <>
                <TrendingUp className="w-3 h-3" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
        
        {/* Variant selector */}
        {hasVariants && showVariants && (
          <div className="mt-2 pt-2 border-t border-yellow-500/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-gray-400">Select option:</span>
              <button
                onClick={() => setShowVariants(false)}
                className="text-gray-500 hover:text-gray-300 text-[10px]"
              >
                Cancel
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.variants?.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => handleVariantSelect(variant)}
                  disabled={!variant.isActive}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                    isDeals
                      ? "bg-red-900/30 text-red-400 hover:bg-red-800/50"
                      : "bg-yellow-900/30 text-yellow-400 hover:bg-yellow-800/50"
                  } ${!variant.isActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {variant.label} - Rs {variant.price}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!rendered) return null;

  const isVisible = animState === "open";

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onCloseAction}
        style={{
          transition: "opacity 0.38s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: isVisible ? 1 : 0,
        }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 cursor-pointer"
      />

      {/* Drawer panel */}
      <div
        style={{
          transition: "transform 0.38s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.38s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isVisible ? "translateX(0)" : "translateX(100%)",
          opacity: isVisible ? 1 : 0,
        }}
        className="fixed right-0 top-0 h-full w-full sm:w-[90vw] sm:max-w-md bg-[#1A1C20] z-50 border-l-2 border-yellow-500/20 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div
          style={{
            transition: "opacity 0.32s ease 0.1s, transform 0.32s ease 0.1s",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(-8px)",
          }}
          className="flex items-center justify-between p-4 sm:p-5 border-b border-yellow-500/20 flex-shrink-0"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            <h2 className="text-base sm:text-lg font-bold text-white">Your Cart</h2>
            {cart && (
              <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                {cart.totalItems}
              </span>
            )}
          </div>
          <button
            onClick={onCloseAction}
            className="p-2 sm:p-2.5 hover:bg-yellow-500/10 rounded-full transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            transition: "opacity 0.35s ease 0.15s",
            opacity: isVisible ? 1 : 0,
          }}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-yellow-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm sm:text-base">Loading cart...</p>
              </div>
            </div>
          ) : !cart || cart.items.length === 0 ? (
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
                  onClick={onCloseAction}
                  className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors text-sm sm:text-base min-h-[44px]"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Items list */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                <div className="space-y-3">
                  {cart.items.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        transition: `opacity 0.3s ease ${0.18 + idx * 0.06}s, transform 0.3s ease ${0.18 + idx * 0.06}s`,
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? "translateX(0)" : "translateX(24px)",
                      }}
                    >
                      <CartItem
                        item={transformCartItem(item)}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemoveItem}
                        isUpdating={updatingItem === item.id}
                      />
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div
                    style={{
                      transition: "opacity 0.35s ease 0.35s, transform 0.35s ease 0.35s",
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? "translateY(0)" : "translateY(12px)",
                    }}
                    className="mt-6 pt-4 border-t border-yellow-500/20"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <h3 className="text-sm font-bold text-white">Complete Your Meal</h3>
                      <span className="text-[10px] text-gray-500 ml-auto">Drinks & More</span>
                    </div>

                    <div className="space-y-2">
                      {suggestions.map((item, idx) => (
                        <SuggestionItem key={item.id} item={item} idx={idx} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  transition: "opacity 0.35s ease 0.22s, transform 0.35s ease 0.22s",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(16px)",
                }}
                className="border-t border-yellow-500/20 p-3 sm:p-4 space-y-3 sm:space-y-4 flex-shrink-0 bg-[#101828]"
              >
                <div className="space-y-2">
                  <div className="flex justify-between text-sm sm:text-base text-gray-300">
                    <span>Subtotal:</span>
                    <span>Rs {cart.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg font-bold text-white border-t border-yellow-500/20 pt-2">
                    <span>Total:</span>
                    <span className="text-yellow-500">Rs {cart.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => { onCloseAction(); window.location.href = "/checkout"; }}
                    className="w-full bg-yellow-500 text-black py-3 sm:py-3.5 rounded-lg font-bold hover:bg-yellow-600 transition-colors text-sm sm:text-base min-h-[44px]"
                  >
                    Proceed to Checkout
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onCloseAction(); window.location.href = "/cart"; }}
                      className="flex-1 bg-transparent border border-yellow-500 text-yellow-500 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-yellow-500/10 transition-colors text-sm sm:text-base min-h-[44px]"
                    >
                      View Cart
                    </button>
                    <button
                      onClick={clearCart}
                      disabled={clearingCart}
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