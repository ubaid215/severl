// app/menu/page.tsx (updated - with Drink category filtered out)
'use client'

import { useEffect, useState, Suspense, useTransition, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import CategoryTab from '@/components/menu/CategoryTabs'
import FoodCard from '@/components/menu/FoodCard'
import { Star, Utensils, ChevronRight, Sparkles } from 'lucide-react'

interface FoodItem {
  id: string
  name: string
  description: string
  price: number
  image?: string
  isAvailable: boolean
  category: {
    id: string
    name: string
    isActive: boolean
  }
}

interface Category {
  id: string
  name: string
  image?: string
  isActive: boolean
}

// Category names to exclude from display
const EXCLUDED_CATEGORIES = ['Drink', 'Drinks', 'Beverage', 'Beverages']

// ─── Skeleton loaders ──────────────────────────────────────────────────────────

const HeroSkeleton = () => (
  <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
    <div className="relative z-20 h-full flex items-center justify-center px-4">
      <div className="text-center max-w-3xl mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/10 animate-pulse" />
        <div className="h-12 w-64 mx-auto bg-gray-800 rounded-lg animate-pulse mb-4" />
        <div className="h-6 w-96 mx-auto bg-gray-800 rounded-lg animate-pulse" />
      </div>
    </div>
  </div>
)

const CategoryTabsSkeleton = () => (
  <div className="w-full bg-black border-b border-yellow-500/20 py-4">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex space-x-3 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-24 h-10 bg-gray-800 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

const FoodCardSkeleton = () => (
  <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#101828] border border-yellow-500/20">
    <div className="relative w-full aspect-square overflow-hidden bg-gray-800 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800" />
    </div>
    <div className="flex flex-col flex-grow p-3.5 sm:p-4">
      <div className="h-5 bg-gray-700 rounded-lg animate-pulse mb-2 w-3/4" />
      <div className="h-4 bg-gray-700 rounded-lg animate-pulse mb-3 w-full" />
      <div className="h-4 bg-gray-700 rounded-lg animate-pulse mb-4 w-1/2" />
      <div className="h-10 bg-gray-700 rounded-xl animate-pulse" />
    </div>
  </div>
)

const MenuGridSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <FoodCardSkeleton key={i} />
      ))}
    </div>
  </div>
)

// ─── Main menu content ─────────────────────────────────────────────────────────

function MenuContent() {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')

  const [categories, setCategories] = useState<Category[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [contentVisible, setContentVisible] = useState(true)
  const [heroImageLoaded, setHeroImageLoaded] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Filter out excluded categories
  const filteredCategories = useMemo(() => {
    return categories.filter(
      category => !EXCLUDED_CATEGORIES.some(
        excluded => category.name.toLowerCase() === excluded.toLowerCase()
      ) && category.isActive
    )
  }, [categories])

  // Initial data load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [categoriesRes, foodItemsRes] = await Promise.all([
          fetch('/api/categories', { next: { revalidate: 300 } }),
          fetch('/api/food-items', { next: { revalidate: 120 } }),
        ])
        const categoriesData = await categoriesRes.json()
        const foodItemsData = await foodItemsRes.json()
        setCategories(categoriesData.data || [])
        setFoodItems(foodItemsData.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Fade content out → in when active category changes
  useEffect(() => {
    setContentVisible(false)
    const t = setTimeout(() => setContentVisible(true), 200)
    return () => clearTimeout(t)
  }, [activeCategory])

  // ─── Derived data ────────────────────────────────────────────────────────────
  // Filter out food items that belong to excluded categories
  const availableItems = foodItems.filter(item => {
    const itemCategory = item.category
    const isExcludedCategory = EXCLUDED_CATEGORIES.some(
      excluded => itemCategory?.name?.toLowerCase() === excluded.toLowerCase()
    )
    return item.isAvailable && !isExcludedCategory
  })

  const filteredItems = activeCategory
    ? availableItems.filter(item => item.category.id === activeCategory)
    : availableItems

  const foodItemsByCategory = filteredCategories.reduce((acc, category) => {
    acc[category.id] = availableItems.filter(item => item.category.id === category.id)
    return acc
  }, {} as Record<string, FoodItem[]>)

  const activeCategoryName = activeCategory
    ? filteredCategories.find(cat => cat.id === activeCategory)?.name
    : null

  // Validate that the active category from URL is not excluded
  const isValidActiveCategory = activeCategory
    ? filteredCategories.some(cat => cat.id === activeCategory)
    : true

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <HeroSkeleton />
        <CategoryTabsSkeleton />
        <MenuGridSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero ----------------------------------------------------------------- */}
      <div className="relative w-full h-[40vh] sm:h-[50vh] overflow-hidden transition-all duration-500">
        <div className="absolute inset-0">
          <Image
            src="/images/menu-hero.webp"
            alt="Our Menu"
            fill
            className={`object-cover transition-opacity duration-700 ${heroImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoadingComplete={() => setHeroImageLoaded(true)}
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        </div>

        {/* Decorative glows */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 transition-all duration-300"
              key={activeCategoryName || 'all'}
            >
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                {activeCategoryName && isValidActiveCategory ? activeCategoryName : 'Our Menu'}
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto px-4 transition-all duration-300">
              {activeCategory && isValidActiveCategory
                ? `Explore our exquisite ${activeCategoryName?.toLowerCase()} selection, crafted with passion and precision`
                : 'Discover a culinary journey of premium flavors, carefully curated for your delight'
              }
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-6 sm:mt-8">
              <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm transition-all duration-300">
                <span className="text-yellow-500 font-bold">{filteredItems.length}</span>
                <span className="text-gray-300 ml-1">Premium Items</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm">
                <span className="text-yellow-500">✨</span>
                <span className="text-gray-300 ml-1">Fresh Daily</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs - Pass filtered categories */}
      <CategoryTab categories={filteredCategories} />

      {/* Menu Grid ------------------------------------------------------------ */}
      <div
        className={`transition-all duration-200 ease-out ${
          contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* ── Filtered category view ──────────────────────────────────────── */}
          {activeCategory && isValidActiveCategory && (
            <section className="mb-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-3 border-b border-yellow-500/30">
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center group">
                  <Utensils className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-500 group-hover:rotate-12 transition-transform" />
                  {activeCategoryName} Selection
                </h2>
                <span className="text-xs sm:text-sm text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full mt-2 sm:mt-0">
                  {filteredItems.length} exquisite items
                </span>
              </div>

              {filteredItems.length === 0 ? (
                <div className="text-center py-16 sm:py-24 bg-gradient-to-br from-gray-900/50 to-black rounded-2xl">
                  <Utensils className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-500/50 mx-auto mb-4" />
                  <p className="text-gray-300 text-lg">Coming soon to our premium collection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.04}s` }}
                    >
                      <FoodCard foodItem={item} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── All items view (only show if no category selected or invalid category) ── */}
          {(!activeCategory || !isValidActiveCategory) && (
            <>
              {/* Featured */}
              <section className="mb-12 sm:mb-16">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-yellow-500/30">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center group">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-500 group-hover:rotate-12 transition-transform" />
                    Featured Delights
                  </h2>
                  <span className="hidden sm:block text-sm text-yellow-500">
                    {filteredItems.length} premium selections
                  </span>
                </div>

                {filteredItems.length === 0 ? (
                  <div className="text-center py-16 sm:py-24">
                    <Utensils className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg">No menu items available at the moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredItems.slice(0, 8).map((item, index) => (
                      <div
                        key={item.id}
                        className="animate-fadeInUp"
                        style={{ animationDelay: `${index * 0.04}s` }}
                      >
                        <FoodCard foodItem={item} />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Per-category sections */}
              {filteredCategories
                .filter(cat => foodItemsByCategory[cat.id]?.length > 0)
                .map((category, sectionIndex) => (
                  <section
                    key={category.id}
                    className="mb-12 sm:mb-16"
                    style={{ animationDelay: `${sectionIndex * 0.08}s` }}
                  >
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-yellow-500/30 group cursor-pointer">
                      <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                        <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3 group-hover:h-8 transition-all" />
                        {category.name}
                      </h2>
                      <ChevronRight className="w-5 h-5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {foodItemsByCategory[category.id].map((item, index) => (
                        <div
                          key={item.id}
                          className="animate-fadeInUp"
                          style={{ animationDelay: `${index * 0.04}s` }}
                        >
                          <FoodCard foodItem={item} />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page wrapper with Suspense ────────────────────────────────────────────────

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black">
        <HeroSkeleton />
        <CategoryTabsSkeleton />
        <MenuGridSkeleton />
      </div>
    }>
      <MenuContent />
    </Suspense>
  )
}