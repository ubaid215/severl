"use client";
import Image from "next/image";
import { ShoppingCart, Clock, Tag, Flame } from "lucide-react";
import { getSessionId } from "@/utils/session";
import { useState } from "react";

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

interface FoodCardProps {
  foodItem: FoodItem;
}

export default function FoodCard({ foodItem }: FoodCardProps) {
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Function to check if this item is part of deals category
  const isDealItem = (): boolean => {
    const dealKeywords = ["top deals", "special deals", "deals", "offer", "discount", "promo", "sale"];
    const categoryName = foodItem.category?.name?.toLowerCase() || "";
    const itemName = foodItem.name?.toLowerCase() || "";
    const itemDescription = foodItem.description?.toLowerCase() || "";

    return dealKeywords.some(
      (keyword) => categoryName.includes(keyword) || itemName.includes(keyword) || itemDescription.includes(keyword)
    );
  };

  // Function to shorten description
  const shortenDescription = (description: string | null, maxLength: number = 50): string => {
    // Handle null or undefined description
    if (!description) return 'No description available';
    
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
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
    <div
      className={`rounded-lg sm:rounded-xl shadow-lg overflow-hidden cursor-pointer border flex flex-col relative
        transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl h-full
        ${isDeals
          ? "bg-gray-900 border-red-600/30 hover:border-red-500"
          : "bg-[#101828] border-yellow-500/20 hover:border-yellow-500/40"
        }`}
    >
      {/* Deal Badge */}
      {isDeals && (
        <div className="absolute top-2 left-2 z-20 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse flex items-center space-x-1">
          <Flame className="w-3 h-3" />
          <span className="hidden xs:inline">DEAL</span>
        </div>
      )}

      {/* Food Image - Fixed 400x400px container */}
      <div className="relative w-full aspect-square overflow-hidden bg-black">
        {foodItem.image && !imageError ? (
          <Image
            src={foodItem.image}
            alt={foodItem.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 400px"
            className="object-cover transition-transform duration-300 ease-in-out hover:scale-110"
            onError={() => setImageError(true)}
            priority={false}
            quality={85}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            <Clock className={`w-16 h-16 sm:w-20 sm:h-20 ${isDeals ? "text-red-500" : "text-yellow-500"} mb-2`} />
            <span className="text-gray-400 text-xs text-center px-2">No image available</span>
          </div>
        )}

        {/* Price Tag */}
        <div
          className={`absolute top-2 right-2 px-3 py-2 rounded-full text-sm font-bold shadow-lg z-10 ${
            isDeals ? "bg-red-500 text-white" : "bg-yellow-500 text-black"
          }`}
        >
          Rs {foodItem.price.toFixed(2)}
        </div>

        {!foodItem.isAvailable && (
          <div className="absolute bottom-2 left-2 bg-gray-800/90 text-white px-3 py-2 rounded-full text-xs font-bold z-10">
            Out of Stock
          </div>
        )}

        {/* Image Overlay Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </div>

      {/* Food Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <h3
          className={`font-bold mb-2 sm:mb-3 transition-colors text-base sm:text-lg line-clamp-1 ${
            isDeals ? "text-white hover:text-red-400" : "text-white hover:text-yellow-400"
          }`}
        >
          {foodItem.name}
        </h3>

        {/* Shorter Description */}
        <p className="text-gray-400 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2 flex-grow leading-relaxed">
          {shortenDescription(foodItem.description)}
        </p>

        {/* Category Badge - Hidden on mobile */}
        <div className="mb-3 sm:mb-4 hidden sm:block">
          <span
            className={`inline-flex items-center text-xs px-3 py-1.5 rounded-full border ${
              isDeals
                ? "text-red-400 bg-red-900/30 border-red-700"
                : "text-yellow-400 bg-yellow-900/20 border-yellow-700/50"
            }`}
          >
            {isDeals && <Tag className="w-3 h-3 mr-1.5" />}
            {foodItem.category?.name || "Uncategorized"}
          </span>
        </div>

        {/* Add to Cart Buttons */}
        <div className="mt-auto">
          {/* Mobile - Full width button */}
          <button
            onClick={handleAddToCart}
            disabled={!foodItem.isAvailable || loading}
            className={`sm:hidden w-full flex items-center justify-center
              px-4 py-3 rounded-lg text-sm font-semibold
              transition-all duration-200 ease-in-out
              ${
                foodItem.isAvailable
                  ? isDeals
                    ? "bg-red-500 text-white hover:bg-red-600 active:scale-95"
                    : "bg-yellow-500 text-black hover:bg-yellow-600 active:scale-95"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            <span className="truncate">
              {loading ? "Adding..." : foodItem.isAvailable ? "Add to Cart" : "Unavailable"}
            </span>
          </button>

          {/* Desktop */}
          <button
            onClick={handleAddToCart}
            disabled={!foodItem.isAvailable || loading}
            className={`hidden sm:flex items-center justify-center
              w-full px-6 py-3.5 rounded-lg text-base font-semibold
              transition-all duration-300 ease-in-out
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