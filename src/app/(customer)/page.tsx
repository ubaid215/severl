"use client";

import HeroCarousel from '@/components/common/HeroCarousel'
import React, { useEffect, useState } from 'react'

// Type for Category
interface Category {
  id: string
  name: string
  image?: string
  isActive?: boolean
}

function Page() {
  const [categories, setCategories] = useState<Category[]>([])

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories') // your API route
        const data = await res.json()
        if (data.success) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  return (
    <div className="w-full min-h-screen bg-black text-white">
      {/* Hero Section */}
      <HeroCarousel />

      {/* Explore Our Menus Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-yellow-400">
          Explore our menus
        </h2>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-darkblue rounded-2xl shadow-lg overflow-hidden group hover:scale-105 transition-transform duration-300 cursor-pointer border border-yellow-500"
            >
              {/* Category Image */}
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover group-hover:opacity-90 transition"
                />
              ) : (
                <div className="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-300">
                  No Image
                </div>
              )}

              {/* Category Name */}
              <div className="p-4 flex flex-col items-center justify-center bg-black">
                <h3 className="text-lg font-semibold text-white group-hover:text-red-500">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Page
