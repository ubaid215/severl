// components/SignatureBundles.tsx
"use client";

import { useState } from "react";
import { Crown, Sparkles, Plus, Minus } from "lucide-react";
import Image from "next/image";

const bundles = [
  {
    id: 1,
    name: "The Executive Box",
    price: 49.9,
    calories: 1250,
    image: "/bundles/executive.jpg", // Add your image
    icon: Crown,
    items: ["Wagyu Burger", "Truffle Fries", "Gold Leaf Shake"],
    tag: "Bestseller",
  },
  {
    id: 2,
    name: "The Midnight Set",
    price: 39.9,
    calories: 980,
    image: "/bundles/midnight.jpg",
    icon: Sparkles,
    items: ["Lobster Roll", "Saffron Arancini", "Matcha Tiramisu"],
    tag: "Limited",
  },
];

export function SignatureBundles() {
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const updateQuantity = (id: number, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  return (
    <section className="px-4 md:px-8 py-16 md:py-24 bg-gradient-to-b from-midnight-black to-red-950/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-serif mb-4">
            <span className="text-white">Signature</span>{" "}
            <span className="bg-gradient-to-r from-red-500 to-yellow-gold bg-clip-text text-transparent">
              Bundles
            </span>
          </h2>
          <p className="text-gray-400">Curated for one or two — elevate your moment</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="group relative bg-black/60 backdrop-blur-md rounded-3xl border border-red-900/40 overflow-hidden hover:border-red-600/70 transition-all duration-500"
            >
              {/* Tag */}
              <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-red-600 to-yellow-gold px-3 py-1 rounded-full text-black text-xs font-bold">
                {bundle.tag}
              </div>

              <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="md:w-2/5 h-48 md:h-auto relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10" />
                  <div className="w-full h-full bg-gradient-to-br from-red-900/30 to-black flex items-center justify-center">
                    <bundle.icon className="w-20 h-20 text-yellow-gold opacity-50" />
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 md:p-8">
                  <h3 className="text-2xl md:text-3xl font-serif text-white mb-2">
                    {bundle.name}
                  </h3>

                  {/* Items List */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {bundle.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-red-950/50 rounded-full text-gray-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Price & Calories */}
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-3xl font-bold text-yellow-gold">
                      ${bundle.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      {bundle.calories} cal
                    </span>
                  </div>

                  {/* Quantity & Customize */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 bg-red-950/50 rounded-full border border-red-900/50">
                      <button
                        onClick={() => updateQuantity(bundle.id, -1)}
                        className="w-10 h-10 flex items-center justify-center text-white hover:text-yellow-gold transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white font-medium min-w-[30px] text-center">
                        {quantities[bundle.id] || 0}
                      </span>
                      <button
                        onClick={() => updateQuantity(bundle.id, 1)}
                        className="w-10 h-10 flex items-center justify-center text-white hover:text-yellow-gold transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button className="px-6 py-2 rounded-full bg-gradient-to-r from-red-600 to-yellow-gold text-black font-semibold text-sm hover:opacity-90 transition-opacity">
                      Customize
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}