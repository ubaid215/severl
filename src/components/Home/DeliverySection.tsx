// components/DeliverySection.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, UtensilsCrossed } from 'lucide-react';

const DeliverySection = () => {
  return (
    <section className="bg-[#0F1012] py-16 px-6 sm:px-12 md:px-20 text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <div className="space-y-8">
          <header className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-serif italic font-light tracking-tight">
              Swift & Hot Delivery
            </h2>
            <p className="text-gray-400 max-w-md leading-relaxed font-light">
              We cover the entire metropolitan area. Our dedicated fleet ensures 
              your meal retains its cinematic heat from our kitchen to your hands.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stat Card 1 */}
            <div className="bg-[#1A1C20] p-8 rounded-[2rem] border border-white/5 space-y-2">
              <span className="text-3xl font-serif italic text-[#E8C69F]">30-40</span>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white">Minutes</p>
              <p className="text-xs text-gray-500">Average Delivery Time</p>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-[#1A1C20] p-8 rounded-[2rem] border border-white/5 space-y-2">
              <span className="text-3xl font-serif italic text-[#E8C69F]">Rs 0.00</span>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white">Delivery</p>
              <p className="text-xs text-gray-500">On orders over Rs 1050</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-300 pt-4">
            <div className="p-2 bg-orange-500/10 rounded-full">
              <MapPin size={18} className="text-orange-400" />
            </div>
            <span className="tracking-wide">P-562/A Opposite Govt. Nusrat Fateh Ali Khan Hospital</span>
          </div>
        </div>

        {/* Right Content - Map Illustration */}
        <div className="relative group">
          <div className="bg-[#141518] rounded-[3rem] p-8 md:p-12 border border-white/5 overflow-hidden">
            {/* World Map Background (Using a subtle SVG pattern or placeholder) */}
            <div className="relative w-full aspect-video opacity-40 grayscale contrast-125">
               <Image 
                src="/images/world-map.png" // Use a dotted world map PNG/SVG
                alt="Service Area Map"
                fill
                className="object-contain"
              />
            </div>

            {/* Animated Pin */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Pulse Ripples */}
                <div className="absolute inset-0 animate-ping rounded-full bg-orange-500/40" />
                <div className="absolute -inset-4 animate-pulse rounded-full bg-orange-500/10" />
                
                {/* Center Icon */}
                <div className="relative bg-[#E8C69F] p-4 rounded-full shadow-[0_0_30px_rgba(232,198,159,0.4)]">
                  <UtensilsCrossed size={24} className="text-[#1A1C20]" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Subtle Glow behind map */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-orange-500/5 blur-[120px] rounded-full" />
        </div>

      </div>
    </section>
  );
};

export default DeliverySection;