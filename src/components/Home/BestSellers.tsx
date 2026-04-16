// components/BestSellers.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';

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

const BESTSELLER_QUERIES = ['zinger', 'several', 'wings', 'fries'];

// ── Card ────────────────────────────────────────────────────────────────────
const BestSellerCard = ({ item, index }: { item: FoodItem; index: number }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(() => {
    if (item.variants && item.variants.length > 0) {
      return item.variants.find(v => v.isDefault) || item.variants[0] || null;
    }
    return null;
  });

  const isChefChoice = index === 0;
  const hasVariants = item.variants && item.variants.length > 0;
  const displayPrice = selectedVariant?.price ?? item.price;

  const handleAddToCart = async () => {
    if (!item.isAvailable || isAdding) return;

    // If item has variants but none selected yet, just open the picker — don't add
    if (hasVariants && !selectedVariant) {
      setShowVariants(true);
      return;
    }

    // If variant picker is open, close it first (user should pick then click cart)
    if (showVariants) {
      setShowVariants(false);
      return;
    }

    // All good — add to cart with the currently selected variant (or no variant)
    setIsAdding(true);
    try {
      await addToCart(item.id, 1, selectedVariant?.id);
    } catch (err) {
      console.error('Add to cart error:', err);
    } finally {
      setIsAdding(false);
    }
  };

  // Only updates selected variant state — does NOT add to cart
  const handleVariantSelect = (variant: Variant) => {
    setSelectedVariant(variant);
    setShowVariants(false);
    // User must now click the cart button to actually add
  };

  return (
    <div className="group relative flex flex-col bg-[#1A1C20] rounded-[2rem] p-5 transition-all duration-300 hover:bg-[#22252a] hover:shadow-2xl hover:shadow-orange-500/10 border border-transparent hover:border-white/5">
      {/* Chef's Choice Badge */}
      {isChefChoice && (
        <div className="absolute top-4 left-4 z-10 bg-[#E8C69F] text-[#1A1C20] text-[10px] font-bold px-3 py-1 rounded-full tracking-tighter">
          CHEF'S CHOICE
        </div>
      )}

      {/* Variants badge */}
      {hasVariants && (
        <div className="absolute top-4 right-4 z-10 bg-yellow-500/80 text-black text-[9px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
          🍕 OPTIONS
        </div>
      )}

      {/* Unavailable overlay */}
      {!item.isAvailable && (
        <div className="absolute inset-0 z-20 rounded-[2rem] bg-black/60 flex items-center justify-center">
          <span className="text-gray-400 text-xs font-semibold bg-gray-900/80 px-3 py-1.5 rounded-full">
            Out of Stock
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square w-full mb-6 overflow-hidden rounded-2xl bg-[#0F1012] flex items-center justify-center">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            <ShoppingCart className="w-10 h-10 text-gray-700" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-grow space-y-2 px-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-xl font-medium text-white tracking-tight line-clamp-1">{item.name}</h3>
          <div className="flex items-center gap-1 mt-1 flex-shrink-0">
            <Star size={14} className="fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-500/90">4.9</span>
          </div>
        </div>
        <p className="text-sm text-gray-400 font-light leading-relaxed line-clamp-2">
          {item.description ?? 'No description available.'}
        </p>

        {/* Selected variant display — click to change */}
        {hasVariants && !showVariants && selectedVariant && (
          <button
            onClick={() => setShowVariants(true)}
            className="flex items-center justify-between w-full mt-2 p-2 bg-black/30 rounded-lg border border-white/10 hover:border-yellow-500/30 transition-colors"
          >
            <span className="text-xs text-gray-400">Size:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-yellow-400 font-semibold">{selectedVariant.label}</span>
              <span className="text-xs text-gray-500">₨{selectedVariant.price}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
          </button>
        )}

        {/* Variant selector dropdown */}
        {hasVariants && showVariants && (
          <div className="mt-2 p-2 bg-black/40 rounded-lg border border-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">Select size:</span>
              <button
                onClick={() => setShowVariants(false)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1.5">
              {item.variants?.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => handleVariantSelect(variant)}
                  disabled={!variant.isActive}
                  className={`w-full flex justify-between items-center p-2 rounded-lg text-xs transition-all border ${
                    selectedVariant?.id === variant.id
                      ? 'bg-yellow-500/20 border-yellow-500/50'
                      : 'bg-black/30 border-transparent hover:border-yellow-500/30'
                  } ${!variant.isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="text-white font-medium">{variant.label}</span>
                  <span className="font-bold text-yellow-500">₨{variant.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
            {/* Hint text so user knows to click cart after selecting */}
            <p className="text-[10px] text-gray-600 text-center mt-2">
              Select a size, then tap 🛒 to add
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-between items-center px-1">
        <div className="flex flex-col">
          <span className="text-2xl font-serif italic text-orange-100/90">
            ₨{displayPrice.toLocaleString()}
          </span>
          {hasVariants && selectedVariant && (
            <span className="text-[10px] text-gray-500">{selectedVariant.label}</span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!item.isAvailable || isAdding}
          title={
            !item.isAvailable
              ? 'Out of stock'
              : hasVariants && showVariants
              ? 'Pick a size first'
              : 'Add to cart'
          }
          className="p-3 bg-[#2A2D32] hover:bg-yellow-500 hover:text-white transition-all duration-300 rounded-full text-gray-400 group-hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isAdding ? (
            <span className="w-[18px] h-[18px] block rounded-full border-2 border-t-transparent border-white animate-spin" />
          ) : (
            <ShoppingCart size={18} strokeWidth={2.5} />
          )}
        </button>
      </div>
    </div>
  );
};

// ── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex flex-col bg-[#1A1C20] rounded-[2rem] p-5 border border-transparent animate-pulse">
    <div className="aspect-square w-full mb-6 rounded-2xl bg-[#2A2D32]" />
    <div className="space-y-3 px-1">
      <div className="h-5 bg-[#2A2D32] rounded w-3/4" />
      <div className="h-3 bg-[#2A2D32] rounded w-full" />
      <div className="h-3 bg-[#2A2D32] rounded w-2/3" />
    </div>
    <div className="mt-8 flex justify-between items-center px-1">
      <div className="h-7 bg-[#2A2D32] rounded w-20" />
      <div className="w-11 h-11 bg-[#2A2D32] rounded-full" />
    </div>
  </div>
);

// ── Section ───────────────────────────────────────────────────────────────────
export default function BestSellers() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const results = await Promise.all(
          BESTSELLER_QUERIES.map((q) =>
            fetch(`/api/food-items?q=${encodeURIComponent(q)}`)
              .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
              })
              .then((json) => {
                const data: FoodItem[] = json?.data ?? [];
                return data.find((item) => item.isAvailable) ?? data[0] ?? null;
              })
              .catch(() => null)
          )
        );

        const seen = new Set<string>();
        const deduped = results.filter((item): item is FoodItem => {
          if (!item || seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });

        setItems(deduped);
      } catch (err) {
        console.error('BestSellers fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  return (
    <section className="bg-[#0F1012] min-h-screen py-20 px-6 sm:px-12 md:px-20">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-2">Most Wanted</h4>
            <h2 className="text-5xl md:text-6xl text-white font-serif italic font-light tracking-tight">
              The Best Sellers
            </h2>
          </div>
          <Link
            href="/menu"
            className="text-sm text-gray-400 border-b border-gray-700 pb-1 hover:text-white hover:border-white transition-all"
          >
            See Full Menu
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-500 text-lg mb-1">Couldn't load best sellers.</p>
            <p className="text-gray-600 text-sm">Please check your connection or try again later.</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex items-center justify-center py-24">
            <p className="text-gray-500 text-lg">No bestsellers found.</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <BestSellerCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}