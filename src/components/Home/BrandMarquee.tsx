// components/BrandMarquee.tsx
"use client";

import { motion } from "framer-motion";
import {
  Pizza,
  Beef,
  Flame,
  Sandwich,
  Drumstick,
  Package,
  Sparkles,
} from "lucide-react";

const menuHighlights = [
  { name: "Chicken Supreme Pizza", icon: Pizza },
  { name: "Malai Boti Pizza", icon: Pizza },
  { name: "Zinger Burger", icon: Beef },
  { name: "Chapli Kabab Burger", icon: Flame },
  { name: "Oven Baked Wings (6pc)", icon: Drumstick },
  { name: "Zinger Shawarma", icon: Sandwich },
  { name: "Special Platter", icon: Package },
  { name: "Deal 1 (Large Pizza + Drink)", icon: Sparkles },
];

export function BrandMarquee() {
  return (
    <section className="py-8 md:py-12 overflow-hidden border-y border-[#7f1a1a]/30 bg-[#0a0a0a]">
      <div className="relative flex overflow-x-hidden">
        <motion.div
          className="flex gap-8 md:gap-12 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {[...menuHighlights, ...menuHighlights].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-4 py-2 bg-[#3f0000]/20 rounded-full border border-[#7f1a1a]/40 backdrop-blur-sm"
            >
              <item.icon className="w-5 h-5 text-[#ffd700]" />
              <span className="text-white font-medium tracking-wide text-sm md:text-base">
                {item.name}
              </span>
              <span className="text-[#ef4444] text-lg mx-1">•</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}