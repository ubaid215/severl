'use client';

import React from 'react';
import { motion } from 'framer-motion';

const InfiniteSlider = () => {
  const words = "FEEL THE TASTE • LIVE THE MOMENT • ";
  
  // Create a repeated array to ensure the slider covers the screen width during the loop
  const repeatedText = Array(8).fill(words).join("");

  return (
    <div className="relative w-full overflow-hidden bg-[#0F1012] py-8 border-y border-white/5">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{
          x: [0, -1000], // Adjust distance based on text length
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <h2 className="text-[8rem] md:text-[12rem] font-serif italic uppercase leading-none tracking-tighter text-white/[0.03] select-none">
          {repeatedText}
        </h2>
        {/* Secondary block to prevent gaps in the infinite loop */}
        <h2 className="text-[8rem] md:text-[12rem] font-serif italic uppercase leading-none tracking-tighter text-white/[0.03] select-none">
          {repeatedText}
        </h2>
      </motion.div>
    </div>
  );
};

export default InfiniteSlider;