// components/CategoryCard.tsx 
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Category } from '@/types/food'

interface CategoryCardProps {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link href={`/menu?category=${category.id}`} className="block">
        <div className="relative bg-[#1A1C20] rounded-2xl overflow-hidden transition-all duration-300 group-hover:bg-yellow-500 shadow-lg group-hover:shadow-xl">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-800">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <svg
                  className="w-12 h-12 text-gray-600 group-hover:text-midnight-black/40 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 9h18M9 21V9m6 12V9M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
                  />
                </svg>
              </div>
            )}
            {/* Status Badge */}
            {!category.isActive && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                Coming Soon
              </div>
            )}
          </div>

          {/* Category Name */}
          <div className="p-3 md:p-4 text-center transition-colors duration-300 group-hover:text-midnight-black">
            <h3 className="font-semibold text-sm md:text-base text-white group-hover:text-midnight-black transition-colors line-clamp-1">
              {category.name}
            </h3>
            {/* Decorative underline on hover */}
            <div className="w-0 h-0.5 bg-midnight-black rounded-full mt-1 transition-all duration-300 group-hover:w-8 mx-auto" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}