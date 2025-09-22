// components/CartItem.tsx
"use client";

import Image from "next/image";
import { Plus, Minus, Trash2, Clock } from "lucide-react";

interface CartItemProps {
  item: {
    id: string;
    foodItemId: string;
    quantity: number;
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

export default function CartItem({ item, onUpdateQuantity, onRemove, isUpdating = false }: CartItemProps) {
  const itemTotal = item.foodItem.price * item.quantity;

  return (
    <div className="flex items-start gap-3 p-3 bg-black/30 rounded-lg border border-yellow-500/20">
      {/* Food Image */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
        {item.foodItem.image ? (
          <Image
            src={item.foodItem.image}
            alt={item.foodItem.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <Clock className="w-6 h-6 text-gray-600" />
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium text-sm truncate">
          {item.foodItem.name}
        </h3>
        <p className="text-gray-400 text-xs mb-2">
          Rs {item.foodItem.price.toFixed(2)} each
        </p>
        
        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-black/50 rounded-lg border border-yellow-500/30">
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
            className="p-1.5 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="text-right">
        <p className="text-yellow-500 font-bold text-sm">
          Rs {itemTotal.toFixed(2)}
        </p>
      </div>

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
        </div>
      )}
    </div>
  );
}