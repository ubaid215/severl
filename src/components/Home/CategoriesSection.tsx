// components/CategoriesSection.tsx (filters out Drink category)
'use client'

import { useCategories } from '@/hooks/useCategories'
import { CategoryCard } from './CategoryCard'
import { SkeletonCard } from './SkeletonCard'

// Category names to exclude from display
const EXCLUDED_CATEGORIES = ['Drink', 'Drinks', 'Beverage', 'Beverages']

export function CategoriesSection() {
  const { categories, isLoading, error } = useCategories()

  // Filter out excluded categories
  const filteredCategories = categories.filter(
    category => !EXCLUDED_CATEGORIES.some(
      excluded => category.name.toLowerCase() === excluded.toLowerCase()
    )
  )

  if (error) {
    return (
      <section className="px-4 py-12 md:px-8 lg:px-16">
        <div className="text-center text-red-500">
          <p>Failed to load categories</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-yellow-500 text-midnight-black rounded-full font-medium"
          >
            Retry
          </button>
        </div>
      </section>
    )
  }

  if (!isLoading && filteredCategories.length === 0) {
    return (
      <section className="px-4 py-12 md:px-8 lg:px-16">
        <div className="text-center text-gray-400">
          <p>No categories available at the moment.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 py-12 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-semibold mb-3">
            Explore Our Menu
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Browse Categories
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover delicious meals from our carefully curated categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : filteredCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
        </div>
      </div>
    </section>
  )
}