"use client"
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
    <div className="bg-[#101828] rounded-xl shadow-yellow-100 overflow-hidden cursor-pointer border-2 hover:shadow-md transition-all duration-300 border-yellow-500/20 flex flex-col">
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

        {/* Price Tag */}
        <div className="absolute top-2 right-2 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          Rs {foodItem.price.toFixed(2)}
        </div>

        {!foodItem.isAvailable && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            Out of Stock
          </div>
        )}
      </div>

      {/* Food Details */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-white mb-3">
          {foodItem.name}
        </h3>

        <p className="text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
          {foodItem.description}
        </p>

        {/* Centered Add to Cart Button at Bottom */}
        <div className="flex justify-center mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={!foodItem.isAvailable || loading}
            className={`flex items-center justify-center
              px-4 py-2 sm:px-6 sm:py-2.5 
              rounded-lg text-sm sm:text-base font-semibold
              transition-all duration-200 min-w-[120px] sm:min-w-[140px]
              ${
                foodItem.isAvailable
                  ? "bg-yellow-500 text-black hover:bg-yellow-600 hover:scale-105"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {loading ? "Adding..." : foodItem.isAvailable ? "Add to Cart" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
}