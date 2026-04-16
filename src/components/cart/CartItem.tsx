// components/cart/CartItem.tsx
"use client";

import Image from "next/image";
import { Plus, Minus, Trash2, Clock, Pizza, Coffee, Sandwich } from "lucide-react";

interface CartItemProps {
  item: {
    id: string;
    foodItemId: string;
    quantity: number;
    variantId?: string;
    variantLabel?: string;
    foodItem: {
      id: string;
      name: string;
      price: number;
      image?: string;
    };
  };
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
}

// Helper to get size badge color
const getSizeBadge = (label?: string): { bg: string; text: string; icon: React.ReactNode } => {
  if (!label) return { bg: "bg-gray-700", text: "text-gray-300", icon: <Pizza className="w-3 h-3" /> };
  
  const size = label.toLowerCase();
  if (size.includes("small") || size.includes("s")) {
    return { bg: "bg-blue-500/20", text: "text-blue-400", icon: <Pizza className="w-3 h-3" /> };
  }
  if (size.includes("medium") || size.includes("m")) {
    return { bg: "bg-green-500/20", text: "text-green-400", icon: <Sandwich className="w-3 h-3" /> };
  }
  if (size.includes("large") || size.includes("l")) {
    return { bg: "bg-orange-500/20", text: "text-orange-400", icon: <Coffee className="w-3 h-3" /> };
  }
  return { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: <Pizza className="w-3 h-3" /> };
};

export default function CartItem({ item, onUpdateQuantity, onRemove, isUpdating = false }: CartItemProps) {
  const itemTotal = item.foodItem.price * item.quantity;
  const sizeBadge = getSizeBadge(item.variantLabel);
  
  // Get first letter for avatar fallback
  const firstLetter = item.foodItem.name.charAt(0).toUpperCase();

  return (
    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-black/40 to-black/20 rounded-xl border border-yellow-500/20 relative group hover:border-yellow-500/40 transition-all duration-300">
      {/* Food Image with overlay */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
        {item.foodItem.image ? (
          <>
            <Image
              src={item.foodItem.image}
              alt={item.foodItem.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <Clock className="w-6 h-6 text-gray-600" />
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-semibold text-sm truncate">
            {item.foodItem.name}
          </h3>
        </div>
        
        {/* Size/Variant badge */}
        {item.variantLabel && (
          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${sizeBadge.bg} mb-2 mt-0.5`}>
            {sizeBadge.icon}
            <span className={`text-[10px] font-medium ${sizeBadge.text}`}>
              {item.variantLabel}
            </span>
          </div>
        )}
        
        <p className="text-gray-400 text-xs mb-2">
          ₨ {item.foodItem.price.toFixed(2)} each
        </p>
        
        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-black/50 rounded-lg border border-yellow-500/30 overflow-hidden">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="p-1.5 hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-3 h-3 text-yellow-500" />
            </button>
            
            <span className="px-3 py-1.5 text-white text-sm font-medium min-w-[2rem] text-center">
              {isUpdating ? "..." : item.quantity}
            </span>
            
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={isUpdating}
              className="p-1.5 hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3 h-3 text-yellow-500" />
            </button>
          </div>
          
          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
            className="p-1.5 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg opacity-70 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="text-right">
        <p className="text-yellow-500 font-bold text-sm">
          ₨ {itemTotal.toFixed(2)}
        </p>
        <p className="text-gray-500 text-[10px] mt-1">
          {item.quantity} × ₨{item.foodItem.price}
        </p>
      </div>

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
        </div>
      )}
    </div>
  );
}