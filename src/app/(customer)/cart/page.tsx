"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Plus, Minus, Trash2, Clock, ShoppingBag, ChevronRight, Sparkles, ChefHat, GlassWater, Utensils } from "lucide-react";

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
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  
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

  // Enhanced smart suggestions with better categorization
  const fetchSuggestions = useCallback(async () => {
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

        // Enhanced category detection
        const isDrinkCategory = (categoryName: string): boolean => {
          const drinkKeywords = ["drink", "beverage", "juice", "soda", "coffee", "tea", "shake", "smoothie", "water", "cold", "hot"];
          return drinkKeywords.some(keyword => 
            categoryName.toLowerCase().includes(keyword)
          );
        };

        const isSauceCategory = (categoryName: string): boolean => {
          const sauceKeywords = ["sauce", "dip", "condiment", "ketchup", "mayo", "chutney", "raita", "dressing"];
          return sauceKeywords.some(keyword => 
            categoryName.toLowerCase().includes(keyword)
          );
        };

        const isDessertCategory = (categoryName: string): boolean => {
          const dessertKeywords = ["dessert", "sweet", "ice cream", "cake", "pastry", "pudding"];
          return dessertKeywords.some(keyword => 
            categoryName.toLowerCase().includes(keyword)
          );
        };

        const isSideCategory = (categoryName: string): boolean => {
          const sideKeywords = ["side", "appetizer", "starter", "snack", "fries", "salad", "bread"];
          return sideKeywords.some(keyword => 
            categoryName.toLowerCase().includes(keyword)
          );
        };

        // Categorize available items
        const drinkItems = availableItems.filter(item =>
          isDrinkCategory(item.category?.name || "")
        );

        const sauceItems = availableItems.filter(item =>
          isSauceCategory(item.category?.name || "")
        );

        const dessertItems = availableItems.filter(item =>
          isDessertCategory(item.category?.name || "")
        );

        const sideItems = availableItems.filter(item =>
          isSideCategory(item.category?.name || "")
        );

        // Check for deal items
        const dealItems = availableItems.filter(item => {
          const dealKeywords = ["top deals", "special deals", "deals", "offer", "discount", "promo"];
          const categoryName = item.category?.name?.toLowerCase() || "";
          const itemName = item.name.toLowerCase();
          return dealKeywords.some(keyword => 
            categoryName.includes(keyword) || itemName.includes(keyword)
          );
        });

        // Smart suggestion logic based on cart contents
        const cartCategories = new Set(
          cartData.items.map(item => {
            const category = allItems.find(food => food.id === item.foodItemId)?.category?.name || "";
            return category.toLowerCase();
          })
        );

        // Priority-based suggestions
        const suggestedItems = [
          // Drinks are always good suggestions
          ...drinkItems.slice(0, 2),
          
          // If cart has main courses, suggest sides/desserts
          ...(cartCategories.has('main course') || cartCategories.has('burger') || cartCategories.has('pizza') ? 
            [...sideItems.slice(0, 1), ...dessertItems.slice(0, 1)] : []),
          
          // If cart has spicy items, suggest drinks/sauces
          ...(cartData.items.some(item => {
            const foodItem = allItems.find(food => food.id === item.foodItemId);
            return foodItem?.name.toLowerCase().includes('spicy') || 
                   foodItem?.description?.toLowerCase().includes('spicy');
          }) ? [...drinkItems.slice(0, 1), ...sauceItems.slice(0, 1)] : []),
          
          // Always include some deal items
          ...dealItems.slice(0, 1),
          
          // Fallback to popular items
          ...availableItems
            .sort((a, b) => (b.price - a.price)) // Higher priced items first (often more premium)
            .slice(0, 2)
        ];

        // Remove duplicates and limit to 6 items for desktop
        const uniqueSuggestions = Array.from(
          new Map(suggestedItems.map(item => [item.id, item])).values()
        ).slice(0, 6);

        setSuggestions(uniqueSuggestions);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [cartData]);

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
        await fetchCart(true);
        // Trigger cart update event for other components
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error) {
      console.error("Failed to add suggestion to cart:", error);
    } finally {
      setAddingToCart(null);
    }
  };

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
      setSuggestions([]);
      
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

  // Fetch suggestions when cart data changes
  useEffect(() => {
    if (cartData && cartData.items.length > 0) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [cartData, fetchSuggestions]);

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

  // Enhanced helper functions
  const isDealItem = (item: FoodItem): boolean => {
    const dealKeywords = ["top deals", "special deals", "deals", "offer", "discount", "promo", "sale"];
    const categoryName = item.category?.name?.toLowerCase() || "";
    const itemName = item.name.toLowerCase();
    return dealKeywords.some(keyword => 
      categoryName.includes(keyword) || itemName.includes(keyword)
    );
  };

  const getSuggestionIcon = (item: FoodItem) => {
    const category = item.category?.name?.toLowerCase() || "";
    
    if (category.includes('drink') || category.includes('beverage')) {
      return <GlassWater className="w-3 h-3 sm:w-4 sm:h-4" />;
    } else if (category.includes('dessert') || category.includes('sweet')) {
      return <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />;
    } else if (category.includes('sauce') || category.includes('dip')) {
      return <Utensils className="w-3 h-3 sm:w-4 sm:h-4" />;
    } else {
      return <ChefHat className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  const getSuggestionType = (item: FoodItem): string => {
    const category = item.category?.name?.toLowerCase() || "";
    
    if (category.includes('drink') || category.includes('beverage')) {
      return "Drink";
    } else if (category.includes('dessert') || category.includes('sweet')) {
      return "Dessert";
    } else if (category.includes('sauce') || category.includes('dip')) {
      return "Sauce";
    } else if (category.includes('side') || category.includes('appetizer')) {
      return "Side";
    } else if (isDealItem(item)) {
      return "Deal";
    } else {
      return "Popular";
    }
  };

  // Show loading state during SSR and initial client mount
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#101828] to-gray-900">
        <div className="flex justify-center items-center py-20 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm sm:text-base">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart state only after we've loaded data
  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#101828] to-gray-900">
        <div className="container mx-auto px-4 py-8 sm:py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6 sm:mb-8">
              <ShoppingBag className="w-16 h-16 sm:w-24 sm:h-24 text-gray-600 mx-auto" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 px-4">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center bg-yellow-500 text-black px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold hover:bg-yellow-600 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Safe helper functions to handle potential undefined values
  const getSubtotal = () => cartData?.subtotal || 0;
  const getItemCount = () => cartData?.itemCount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#101828] to-gray-900">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Mobile Header - Sticky */}
        <div className="sticky top-0 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-sm z-10 pb-4 pt-2 sm:pt-0 sm:relative sm:bg-transparent">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/menu"
              className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                Shopping Cart
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm truncate">
                Review your items before checkout
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-6">
          {/* Cart Items & Suggestions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items Section */}
            <div className="bg-[#101828] rounded-xl sm:rounded-2xl border border-yellow-500/20 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Cart Items ({getItemCount()})
                </h2>
                <button
                  onClick={clearCart}
                  disabled={loading}
                  className="text-red-500 hover:text-red-400 text-xs sm:text-sm font-medium disabled:opacity-50 px-2 py-1 sm:px-3 sm:py-1 rounded border border-red-500/30 hover:border-red-500/50 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {cartData.items.map((item) => (
                  <div key={item.id} className="relative">
                    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-black/30 rounded-lg sm:rounded-xl border border-yellow-500/20">
                      {/* Food Image */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden">
                        {item.foodItem.image ? (
                          <Image
                            src={item.foodItem.image}
                            alt={item.foodItem.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 64px, 80px"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm sm:text-lg mb-1 line-clamp-1">
                          {item.foodItem.name}
                        </h3>
                        {item.foodItem.description && (
                          <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                            {item.foodItem.description}
                          </p>
                        )}
                        <p className="text-yellow-500 font-bold text-sm sm:text-base">
                          Rs {(item.foodItem.price || 0).toFixed(2)} each
                        </p>
                      </div>

                      {/* Quantity Controls and Price - Stack on mobile */}
                      <div className="flex flex-col items-end gap-2 sm:gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-black/50 rounded-lg border border-yellow-500/30">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updatingItems.has(item.id) || item.quantity <= 1}
                            className="p-1 sm:p-2 hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                          </button>
                          
                          <span className="px-2 sm:px-4 py-1 sm:py-2 text-white font-semibold text-xs sm:text-sm min-w-[2rem] sm:min-w-[3rem] text-center">
                            {updatingItems.has(item.id) ? "..." : item.quantity}
                          </span>
                          
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updatingItems.has(item.id)}
                            className="p-1 sm:p-2 hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                          </button>
                        </div>
                        
                        {/* Item Total and Remove Button */}
                        <div className="flex items-center gap-2">
                          <p className="text-yellow-500 font-bold text-sm sm:text-lg whitespace-nowrap">
                            Rs {((item.foodItem.price || 0) * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={updatingItems.has(item.id)}
                            className="p-1 sm:p-2 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
                            title="Remove item"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Loading Overlay */}
                    {updatingItems.has(item.id) && (
                      <div className="absolute inset-0 bg-black/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-6 sm:w-6 border-b-2 border-yellow-500"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Suggestions Section */}
            {suggestions.length > 0 && (
              <div className="bg-[#101828] rounded-xl sm:rounded-2xl border border-yellow-500/20 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Complete Your Meal</h2>
                    <p className="text-gray-400 text-xs sm:text-sm">Popular additions you might like</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {suggestions.map((item) => {
                    const isDeals = isDealItem(item);
                    const isAdding = addingToCart === item.id;
                    const suggestionType = getSuggestionType(item);
                    
                    return (
                      <div
                        key={item.id}
                        className={`group relative p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
                          isDeals
                            ? 'bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-500/30 hover:border-red-500/50'
                            : 'bg-gradient-to-br from-black/30 to-black/10 border-yellow-500/20 hover:border-yellow-500/40'
                        } hover:scale-[1.02] active:scale-95`}
                      >
                        {/* Item Image */}
                        <div className="relative w-full h-32 sm:h-36 mb-3 rounded-lg overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                              <ShoppingBag className="w-8 h-8 text-gray-600" />
                            </div>
                          )}
                          {/* Badge */}
                          <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
                            isDeals 
                              ? 'bg-red-500 text-white' 
                              : 'bg-yellow-500 text-black'
                          }`}>
                            {suggestionType}
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-2 flex-1">
                              {item.name}
                            </h3>
                            <div className="flex-shrink-0 text-yellow-500">
                              {getSuggestionIcon(item)}
                            </div>
                          </div>
                          <p className={`text-sm sm:text-base font-bold ${
                            isDeals ? 'text-red-400' : 'text-yellow-500'
                          }`}>
                            Rs {item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Add Button */}
                        <button
                          onClick={() => addSuggestionToCart(item.id)}
                          disabled={isAdding}
                          className={`w-full mt-3 py-2 px-4 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2 ${
                            isDeals
                              ? 'bg-red-500 text-white hover:bg-red-600 active:scale-95 disabled:bg-red-500/50'
                              : 'bg-yellow-500 text-black hover:bg-yellow-600 active:scale-95 disabled:bg-yellow-500/50'
                          }`}
                        >
                          {isAdding ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              <span>Adding...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {loadingSuggestions && (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-3"></div>
                    <p className="text-gray-400 text-sm">Finding perfect suggestions...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary - Sticky on mobile */}
          <div className="lg:col-span-1">
            <div className="bg-[#101828] rounded-xl sm:rounded-2xl border border-yellow-500/20 p-4 sm:p-6 sticky bottom-0 sm:sticky sm:top-24 z-20 sm:z-10 shadow-2xl sm:shadow-none">
              {/* Mobile Summary Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white">Order Summary</h2>
                <div className="sm:hidden text-yellow-500">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-gray-300">
                  <span className="text-sm sm:text-base">Subtotal ({getItemCount()} items):</span>
                  <span className="text-sm sm:text-base">Rs {getSubtotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-300">
                  <span className="text-sm sm:text-base">Delivery Fee:</span>
                  <span className="text-sm sm:text-base">Rs {(cartData.deliveryCharges || 0).toFixed(2)}</span>
                </div>
                
                <hr className="border-yellow-500/20" />
                
                <div className="flex justify-between text-base sm:text-lg font-bold text-white">
                  <span>Total:</span>
                  <span className="text-yellow-500">Rs {(getSubtotal() + (cartData.deliveryCharges || 0)).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Link
                  href="/checkout"
                  className="w-full bg-yellow-500 text-black py-3 sm:py-4 rounded-lg font-bold hover:bg-yellow-600 transition-colors flex items-center justify-center text-sm sm:text-base"
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  href="/menu"
                  className="w-full bg-transparent border border-yellow-500 text-yellow-500 py-3 sm:py-4 rounded-lg font-semibold hover:bg-yellow-500/10 transition-colors flex items-center justify-center text-sm sm:text-base"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Mobile Bottom Spacer for Safe Area */}
              <div className="h-2 sm:h-0"></div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation Spacer */}
        <div className="h-20 sm:h-0"></div>
      </div>
    </div>
  );
}