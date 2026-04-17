// components/FoodCard.tsx
"use client";
import Image from "next/image";
import { ShoppingCart, Clock, Tag, Flame, ChevronDown, ChevronUp, Zap, Crown, Star, Circle, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

interface Variant {
  id: string;
  label: string;
  price: number;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
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
  variants?: Variant[];
}

interface FoodCardProps {
  foodItem: FoodItem;
}

// Helper to get friendly size label
const getSizeLabel = (label: string): string => {
  const labels: Record<string, string> = {
    small: "S",
    medium: "M",
    large: "L",
    extra_large: "XL",
    regular: "Reg",
    large_pizza: "14\"",
    medium_pizza: "12\"",
    small_pizza: "9\"",
  };
  return labels[label.toLowerCase()] || label.charAt(0).toUpperCase();
};

// Get variant badge color based on size
const getVariantColor = (label: string): string => {
  const size = label.toLowerCase();
  if (size.includes("small") || size.includes("s")) return "from-blue-500 to-blue-600";
  if (size.includes("medium") || size.includes("m")) return "from-green-500 to-green-600";
  if (size.includes("large") || size.includes("l")) return "from-orange-500 to-orange-600";
  if (size.includes("xl") || size.includes("extra")) return "from-red-500 to-red-600";
  return "from-yellow-500 to-yellow-600";
};

export default function FoodCard({ foodItem }: FoodCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(() => {
    if (foodItem.variants && foodItem.variants.length > 0) {
      const defaultVariant = foodItem.variants.find(v => v.isDefault);
      return defaultVariant?.id || foodItem.variants[0]?.id || null;
    }
    return null;
  });
  const [hoveredSizeId, setHoveredSizeId] = useState<string | null>(null);

  const { addToCart } = useCart();

  const hasSizes = foodItem.variants && foodItem.variants.length > 0;
  const selectedSize = hasSizes && selectedSizeId
    ? foodItem.variants?.find(v => v.id === selectedSizeId)
    : null;
  
  const displayPrice = selectedSize?.price ?? foodItem.price;
  
  const isDealItem = (): boolean => {
    const dealKeywords = ["top deals", "special deals", "deals", "offer", "discount", "promo", "sale"];
    const categoryName = foodItem.category?.name?.toLowerCase() || "";
    const itemName = foodItem.name?.toLowerCase() || "";
    const itemDescription = foodItem.description?.toLowerCase() || "";
    return dealKeywords.some(
      (keyword) =>
        categoryName.includes(keyword) ||
        itemName.includes(keyword) ||
        itemDescription.includes(keyword)
    );
  };

  const shortenDescription = (description: string | null, maxLength: number = 60): string => {
    if (!description) return "No description available";
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + "…";
  };

  const isDeals = isDealItem();
  const accentColor = isDeals ? "red" : "yellow";
  const accentGradient = isDeals 
    ? "from-red-500/20 via-red-500/5 to-transparent" 
    : "from-yellow-500/20 via-yellow-500/5 to-transparent";

  const handleAddToCart = async () => {
    if (!foodItem.isAvailable || isAdding) return;
    
    // If item has sizes but no size selected, just show selector - don't add to cart
    if (hasSizes && !selectedSizeId) {
      setShowSizeSelector(true);
      return;
    }
    
    setIsAdding(true);
    try {
      await addToCart(foodItem.id, 1, selectedSizeId || undefined);
      // Visual feedback - button animation
      const btn = document.activeElement as HTMLElement;
      if (btn) btn.style.transform = "scale(0.95)";
      setTimeout(() => {
        if (btn) btn.style.transform = "";
      }, 150);
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setIsAdding(false);
    }
  };

  // FIX: Size selection only updates state, does NOT automatically add to cart
  const handleSizeSelect = (sizeId: string) => {
    setSelectedSizeId(sizeId);
    setShowSizeSelector(false);
    // Removed auto-add to cart - cart icon won't refresh until user clicks Add to Cart button
  };

  return (
    <div
      className={[
        "group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer h-full w-full",
        "bg-gradient-to-br from-[#1A1C20] to-[#13151A]",
        isDeals
          ? "border border-red-600/30 hover:border-red-500/70 shadow-lg hover:shadow-red-500/20"
          : "border border-yellow-500/20 hover:border-yellow-500/50 shadow-lg hover:shadow-yellow-500/20",
        "transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "hover:-translate-y-1 active:scale-[0.98] sm:hover:-translate-y-3", // Responsive hover effect
      ].join(" ")}
    >
      {/* Animated gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      {/* Deal badge with animation - responsive positioning */}
      {isDeals && (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold shadow-lg animate-pulse">
          {/* <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> */}
          <span className="hidden xs:inline">HOT DEAL</span>
          {/* <span className="xs:hidden">HOT</span> */}
        </div>
      )}

      {/* Size options badge - visual indicator */}
      {hasSizes && (
        <div 
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold backdrop-blur-md shadow-lg ${
            isDeals 
              ? "bg-red-500/90 text-white" 
              : "bg-gradient-to-r from-yellow-500 to-amber-500 text-black"
          }`}
        >
          <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span>{foodItem.variants?.length} Sizes</span>
        </div>
      )}

      {/* Image area with responsive aspect ratio */}
      <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-900 to-black flex-shrink-0">
        {foodItem.image && !imageError ? (
          <Image
            src={foodItem.image}
            alt={foodItem.name}
            fill
            sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 400px"
            className="object-cover transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:rotate-1"
            onError={() => setImageError(true)}
            priority={false}
            quality={90}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <Clock
              className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mb-2 ${
                isDeals ? "text-red-500" : "text-yellow-500"
              } opacity-50`}
            />
            <span className="text-gray-500 text-[10px] sm:text-[11px] text-center px-3">
              No image
            </span>
          </div>
        )}

        {/* Price pill - responsive */}
        <div
          className={`absolute top-2 left-2 sm:top-3 sm:left-3 z-10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-xl backdrop-blur-sm transition-all duration-300 group-hover:scale-105 ${
            isDeals
              ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
              : "bg-gradient-to-r from-yellow-500 to-amber-500 text-black"
          }`}
        >
          ₨ {displayPrice.toFixed(2)}
        </div>

        {/* Rating badge - responsive */}
        {/* <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-500 text-yellow-500" />
          <span className="text-white text-[9px] sm:text-[10px] font-medium">4.9</span>
        </div> */}

        {/* Out-of-stock overlay */}
        {!foodItem.isAvailable && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="bg-gray-900/90 text-gray-300 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold border border-gray-700">
              Out of Stock
            </div>
          </div>
        )}

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-[#1A1C20] via-[#1A1C20]/60 to-transparent pointer-events-none" />
      </div>

      {/* Card body - responsive padding */}
      <div className="flex flex-col flex-grow p-3 sm:p-4 relative z-10">
        {/* Name with icon */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className={`font-bold text-sm sm:text-base line-clamp-1 transition-all duration-200 ${
              isDeals
                ? "text-white group-hover:text-red-400"
                : "text-white group-hover:text-yellow-400"
            }`}
          >
            {foodItem.name}
          </h3>
          {!hasSizes && !isDeals && (
            <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500/50 flex-shrink-0" />
          )}
        </div>

        {/* Description - responsive text */}
        <p className="text-gray-400 text-[11px] sm:text-xs leading-relaxed line-clamp-2 flex-grow mb-2 sm:mb-3">
          {shortenDescription(foodItem.description)}
        </p>

        {/* Category badge - responsive */}
        <div className="mb-2 sm:mb-3">
          <span
            className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border ${
              isDeals
                ? "text-red-400 bg-red-900/30 border-red-700/60"
                : "text-yellow-400 bg-yellow-900/20 border-yellow-700/40"
            }`}
          >
            <Tag className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
            <span className="hidden xs:inline">{foodItem.category?.name || "Uncategorized"}</span>
            <span className="xs:hidden">{foodItem.category?.name?.slice(0, 8) || "Food"}</span>
          </span>
        </div>

        {/* Size selector - responsive grid */}
        {hasSizes && showSizeSelector && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-black/50 rounded-xl border border-yellow-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-medium text-gray-300">Choose size:</span>
              <button
                onClick={() => setShowSizeSelector(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors p-1"
              >
                <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {foodItem.variants?.map((variant) => {
                const isSelected = selectedSizeId === variant.id;
                const isHovered = hoveredSizeId === variant.id;
                const sizeColor = getVariantColor(variant.label);
                const sizeLabel = getSizeLabel(variant.label);
                
                return (
                  <button
                    key={variant.id}
                    onClick={() => handleSizeSelect(variant.id)}
                    disabled={!variant.isActive}
                    onMouseEnter={() => setHoveredSizeId(variant.id)}
                    onMouseLeave={() => setHoveredSizeId(null)}
                    className={`
                      relative group/size flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl
                      transition-all duration-200 overflow-hidden
                      ${!variant.isActive ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                      ${isSelected 
                        ? `bg-gradient-to-br ${sizeColor} text-white shadow-lg scale-105` 
                        : "bg-black/40 border border-white/10 hover:border-yellow-500/50"
                      }
                    `}
                  >
                    {!isSelected && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${sizeColor} opacity-0 group-hover/size:opacity-10 transition-opacity duration-300`} />
                    )}
                    
                    <span className={`text-sm sm:text-base font-bold ${isSelected ? "text-white" : "text-white"}`}>
                      {sizeLabel}
                    </span>
                    
                    <span className={`text-[8px] sm:text-[9px] ${isSelected ? "text-white/90" : "text-gray-400"} truncate max-w-full px-0.5`}>
                      {variant.label.length > 8 ? variant.label.slice(0,6)+".." : variant.label}
                    </span>
                    
                    <span className={`text-[9px] sm:text-[10px] font-semibold mt-0.5 sm:mt-1 ${isSelected ? "text-white" : "text-yellow-500"}`}>
                      ₨{variant.price}
                    </span>
                    
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected size display - pill style */}
        {hasSizes && !showSizeSelector && selectedSize && (
          <div className="mb-2 sm:mb-3">
            <button
              onClick={() => setShowSizeSelector(true)}
              className="flex items-center justify-between w-full p-2 sm:p-2.5 bg-black/40 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all group/size-btn"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br ${getVariantColor(selectedSize.label)} flex items-center justify-center`}>
                  <span className="text-white text-[9px] sm:text-[10px] font-bold">
                    {getSizeLabel(selectedSize.label)}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[10px] sm:text-xs text-gray-400 block">Size</span>
                  <span className="text-[11px] sm:text-xs text-white font-medium line-clamp-1">{selectedSize.label}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-[11px] sm:text-xs font-bold text-yellow-500">
                  ₨{selectedSize.price}
                </span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 group-hover/size-btn:text-yellow-500 transition-colors" />
              </div>
            </button>
          </div>
        )}

        {/* Add to cart button - responsive and no auto-add on size select */}
        <button
          onClick={handleAddToCart}
          disabled={!foodItem.isAvailable || isAdding || (hasSizes && !selectedSizeId)}
          className={[
            "mt-auto w-full flex items-center justify-center gap-2",
            "px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-bold",
            "transition-all duration-200 active:scale-95",
            "relative overflow-hidden group/btn",
            foodItem.isAvailable && (!hasSizes || selectedSizeId)
              ? isDeals
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:shadow-red-500/30"
                : "bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:shadow-lg hover:shadow-yellow-500/30"
              : "bg-gray-700 text-gray-500 cursor-not-allowed",
          ].join(" ")}
        >
          {foodItem.isAvailable && (!hasSizes || selectedSizeId) && (
            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          )}
          
          {isAdding ? (
            <>
              <span
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-t-transparent animate-spin ${
                  isDeals ? "border-white" : "border-black"
                }`}
              />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 transition-transform group-hover/btn:scale-110" />
              <span>
                {!foodItem.isAvailable
                  ? "Unavailable"
                  : hasSizes && !selectedSizeId
                  ? "Pick Size"
                  : "Cart"}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}