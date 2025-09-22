"use client";

import Image from "next/image";
import { ShoppingCart, Clock } from "lucide-react";
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
    <div className="bg-[#101828] rounded-xl shadow-yellow-100 overflow-hidden cursor-pointer border-2 hover:shadow-md transition-all duration-300 border-yellow-500/20">
      {/* Food Image */}
      <div className="relative h-40 w-full">
        {foodItem.image ? (
          <Image
            src={foodItem.image}
            alt={foodItem.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        )}

        {!foodItem.isAvailable && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            Out of Stock
          </div>
        )}
      </div>

      {/* Food Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-white truncate flex-1 mr-2">
            {foodItem.name}
          </h3>
          <span className="text-xl font-bold text-yellow-500 whitespace-nowrap">
            Rs {foodItem.price.toFixed(2)}
          </span>
        </div>

        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {foodItem.description}
        </p>

        <div className="flex justify-between items-center">
          <span className="inline-block bg-black text-yellow-500 px-3 py-1 rounded-full text-xs font-medium border border-yellow-500/30">
            {foodItem.category.name}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={!foodItem.isAvailable || loading}
            className={`flex items-center 
              px-3 py-1.5 sm:px-4 sm:py-2 
              rounded-md text-xs sm:text-sm font-semibold
              transition-all duration-200
              ${
                foodItem.isAvailable
                  ? "bg-yellow-500 text-black hover:bg-yellow-600 hover:scale-105"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {loading ? "Adding..." : foodItem.isAvailable ? "Add to Cart" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
}
