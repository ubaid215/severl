"use client"
import Image from "next/image";
import { ShoppingCart, Clock, Tag, Flame } from "lucide-react";
import { getSessionId } from "@/utils/session";
import { useState } from "react";

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
  };
}

interface FoodCardProps {
  foodItem: FoodItem;
}

export default function FoodCard({ foodItem }: FoodCardProps) {
  const [loading, setLoading] = useState(false);

  // Function to check if this item is part of deals category
  const isDealItem = (): boolean => {
    const dealKeywords = ['top deals', 'special deals', 'deals', 'offer', 'discount', 'promo', 'sale',];
    const categoryName = foodItem.category?.name?.toLowerCase() || '';
    const itemName = foodItem.name?.toLowerCase() || '';
    const itemDescription = foodItem.description?.toLowerCase() || '';
    
    return dealKeywords.some(keyword => 
      categoryName.includes(keyword) || 
      itemName.includes(keyword) || 
      itemDescription.includes(keyword)
    );
  };

  const isDeals = isDealItem();

  const handleAddToCart = async () => {
    if (!foodItem.isAvailable) return;

    try {
      setLoading(true);
      const sessionId = getSessionId();

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          foodItemId: foodItem.id,
          quantity: 1,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log("✅ Added to cart:", data);
        // Optionally trigger a toast or update cart context here
      } else {
        console.error("❌ Failed to add to cart:", data.error);
      }
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden cursor-pointer border-2 hover:shadow-md transition-all duration-300 flex flex-col relative ${
      isDeals 
        ? 'bg-gray-900 border-red-700/50 hover:border-red-500 hover:scale-105' 
        : 'bg-[#101828] border-yellow-500/20 hover:border-yellow-500/40'
    }`}>
      
      {/* Deal Badge */}
      {isDeals && (
        <div className="absolute top-2 left-2 z-20 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse flex items-center space-x-1">
          <Flame className="w-3 h-3" />
          <span>DEAL</span>
        </div>
      )}

      {/* Food Image */}
      <div className="relative h-40 w-full">
        {foodItem.image ? (
          <Image
            src={foodItem.image}
            alt={foodItem.name}
            fill
            className="object-cover hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <Clock className={`w-12 h-12 ${isDeals ? 'text-red-500' : 'text-yellow-500'}`} />
          </div>
        )}

        {/* Price Tag */}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-bold shadow-lg ${
          isDeals 
            ? 'bg-red-500 text-white' 
            : 'bg-yellow-500 text-black'
        }`}>
          Rs {foodItem.price.toFixed(2)}
        </div>

        {!foodItem.isAvailable && (
          <div className="absolute bottom-2 left-2 bg-gray-800/90 text-white px-3 py-1 rounded-full text-xs font-bold">
            Out of Stock
          </div>
        )}
      </div>

      {/* Food Details */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className={`text-lg font-bold mb-3 transition-colors ${
          isDeals 
            ? 'text-white hover:text-red-400' 
            : 'text-white hover:text-yellow-400'
        }`}>
          {foodItem.name}
        </h3>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
          {foodItem.description}
        </p>

        {/* Category Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center text-xs px-2 py-1 rounded border ${
            isDeals 
              ? 'text-red-400 bg-red-900/30 border-red-700' 
              : 'text-yellow-400 bg-yellow-900/20 border-yellow-700/50'
          }`}>
            {isDeals && <Tag className="w-3 h-3 mr-1" />}
            {foodItem.category?.name || 'Uncategorized'}
          </span>
        </div>

        {/* Add to Cart Button - Small with "Cart" text on mobile, full button on desktop */}
        <div className="flex justify-center mt-auto">
          {/* Mobile - Small button with "Cart" text */}
          <button
            onClick={handleAddToCart}
            disabled={!foodItem.isAvailable || loading}
            className={`sm:hidden flex items-center justify-center
              px-3 py-2 rounded-lg text-xs font-semibold
              transition-all duration-200
              ${
                foodItem.isAvailable
                  ? isDeals
                    ? "bg-red-500 text-white hover:bg-red-600 hover:scale-105"
                    : "bg-yellow-500 text-black hover:bg-yellow-600 hover:scale-105"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            <span>{loading ? "Adding..." : foodItem.isAvailable ? "Cart" : "N/A"}</span>
          </button>

          {/* Desktop - Full Button with Text */}
          <button
            onClick={handleAddToCart}
            disabled={!foodItem.isAvailable || loading}
            className={`hidden sm:flex items-center justify-center
              px-6 py-2.5 
              rounded-lg text-base font-semibold
              transition-all duration-200 min-w-[140px]
              ${
                foodItem.isAvailable
                  ? isDeals
                    ? "bg-red-500 text-white hover:bg-red-600 hover:scale-105"
                    : "bg-yellow-500 text-black hover:bg-yellow-600 hover:scale-105"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {loading ? "Adding..." : foodItem.isAvailable ? "Add to Cart" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
}