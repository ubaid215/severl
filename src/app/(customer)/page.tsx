"use client";

import HeroCarousel from '@/components/common/HeroCarousel'
import React, { useEffect, useState, useRef } from 'react'
import { Utensils, Star, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import FoodCard from '@/components/menu/FoodCard'

// Type for Category
interface Category {
  id: string
  name: string
  image?: string
  isActive?: boolean
}

// Type for Food Item
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
  }
}

function Page() {
  const [categories, setCategories] = useState<Category[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [featuredScrollPosition, setFeaturedScrollPosition] = useState(0)
  const [dealsScrollPosition, setDealsScrollPosition] = useState(0)
  
  const featuredContainerRef = useRef<HTMLDivElement>(null)
  const dealsContainerRef = useRef<HTMLDivElement>(null)

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [categoriesRes, foodItemsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/food-items')
        ])

        const categoriesData = await categoriesRes.json()
        const foodItemsData = await foodItemsRes.json()

        setCategories(categoriesData?.data || categoriesData || [])
        setFoodItems(foodItemsData?.data || foodItemsData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Function to check if item is a deal item
  const isDealItem = (item: FoodItem): boolean => {
    const dealKeywords = ["top deals", "special deals", "deals", "offer", "discount", "promo", "sale"];
    const categoryName = item.category?.name?.toLowerCase() || "";
    const itemName = item.name?.toLowerCase() || "";
    const itemDescription = item.description?.toLowerCase() || "";

    return dealKeywords.some(
      (keyword) => categoryName.includes(keyword) || itemName.includes(keyword) || itemDescription.includes(keyword)
    );
  };

  // Filter out deal items for featured section - MAX 6 ITEMS
  const getFeaturedItems = () => {
    if (!foodItems || !Array.isArray(foodItems)) return []
    
    const availableItems = foodItems.filter(item => item && item.isAvailable && !isDealItem(item))
    const shuffled = [...availableItems].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 6) // Limit to maximum 6 items
  }

  // Filter deal items only - MAX 6 ITEMS
  const getDealItems = () => {
    if (!foodItems || !Array.isArray(foodItems)) return []
    const deals = foodItems.filter(item => item && item.isAvailable && isDealItem(item))
    return deals.slice(0, 6) // Limit to maximum 6 items
  }

  const featuredItems = getFeaturedItems()
  const dealItems = getDealItems()

  // Scroll functions for featured items
  const scrollFeatured = (direction: 'left' | 'right') => {
    if (!featuredContainerRef.current) return
    
    const container = featuredContainerRef.current
    const scrollAmount = 400
    const newPosition = direction === 'left' 
      ? Math.max(0, featuredScrollPosition - scrollAmount)
      : featuredScrollPosition + scrollAmount
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    })
    setFeaturedScrollPosition(newPosition)
  }

  // Scroll functions for deal items
  const scrollDeals = (direction: 'left' | 'right') => {
    if (!dealsContainerRef.current) return
    
    const container = dealsContainerRef.current
    const scrollAmount = 400
    const newPosition = direction === 'left' 
      ? Math.max(0, dealsScrollPosition - scrollAmount)
      : dealsScrollPosition + scrollAmount
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    })
    setDealsScrollPosition(newPosition)
  }

  // Check if scroll buttons should be visible
  const canScrollFeaturedLeft = featuredScrollPosition > 0
  const canScrollFeaturedRight = featuredContainerRef.current && 
    featuredScrollPosition < featuredContainerRef.current.scrollWidth - featuredContainerRef.current.clientWidth

  const canScrollDealsLeft = dealsScrollPosition > 0
  const canScrollDealsRight = dealsContainerRef.current && 
    dealsScrollPosition < dealsContainerRef.current.scrollWidth - dealsContainerRef.current.clientWidth

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-500 text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <HeroCarousel />

      {/* Explore Our Menus Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-3 sm:mb-4">
            Explore Menus
          </h2>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            Discover our delicious selection of categories and find your perfect meal
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {categories.map((category) => (
            <div
              key={category?.id}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-800 hover:border-yellow-500 transition-colors h-full flex flex-col items-center text-center">
                {/* Category Image */}
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-2 sm:mb-3 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center overflow-hidden">
                  {category?.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-full" />
                </div>

                {/* Category Name */}
                <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors line-clamp-2">
                  {category?.name || 'Unnamed Category'}
                </h3>
                <div className="mt-1 sm:mt-2 w-6 sm:w-8 h-0.5 bg-yellow-500 transform scale-0 group-hover:scale-100 transition-transform duration-300" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Items Section - Excludes Deal Items */}
      {featuredItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-yellow-500/10 mb-3 sm:mb-4">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">
              Featured Items
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm md:text-lg max-w-2xl mx-auto px-4">
              Handpicked favorites that our customers love
            </p>
          </div>

          {/* Manual Scroll Container */}
          <div className="relative">
            {/* Scroll Container */}
            <div 
              ref={featuredContainerRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {featuredItems.map((item) => (
                <div 
                  key={item?.id} 
                  className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] transform transition-all duration-300 hover:scale-[1.02]"
                >
                  <FoodCard foodItem={item} />
                </div>
              ))}
            </div>

            {/* Custom Navigation Buttons */}
            {featuredItems.length > 1 && (
              <>
                <button
                  onClick={() => scrollFeatured('left')}
                  disabled={!canScrollFeaturedLeft}
                  className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-yellow-500 hover:text-yellow-400 p-3 sm:p-4 rounded-full shadow-2xl border border-yellow-500/20 transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center ${
                    !canScrollFeaturedLeft ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={() => scrollFeatured('right')}
                  disabled={!canScrollFeaturedRight}
                  className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-yellow-500 hover:text-yellow-400 p-3 sm:p-4 rounded-full shadow-2xl border border-yellow-500/20 transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center ${
                    !canScrollFeaturedRight ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}
          </div>

          {/* View All Button */}
          <div className="text-center mt-8 sm:mt-12">
            <button 
              onClick={() => window.location.href = '/menu'}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg sm:rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 font-semibold sm:font-bold text-sm sm:text-lg shadow-lg hover:shadow-yellow-500/25 hover:scale-105"
            >
              Explore Full Menu
            </button>
          </div>
        </section>
      )}

      {/* Special Deals Section */}
      {dealItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 bg-gradient-to-b from-gray-900/50 to-black rounded-2xl sm:rounded-3xl sm:mx-4 lg:mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-500/10 mb-3 sm:mb-4 relative">
              <Tag className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">!</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">
              Hot Deals
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm md:text-lg max-w-2xl mx-auto px-4">
              Limited time offers you don't want to miss
            </p>
          </div>

          {/* Manual Scroll Container for Deals */}
          <div className="relative">
            {/* Scroll Container */}
            <div 
              ref={dealsContainerRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {dealItems.map((item) => (
                <div 
                  key={item?.id} 
                  className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] transform transition-all duration-300 hover:scale-[1.02]"
                >
                  <FoodCard foodItem={item} />
                </div>
              ))}
            </div>

            {/* Custom Navigation Buttons */}
            {dealItems.length > 1 && (
              <>
                <button
                  onClick={() => scrollDeals('left')}
                  disabled={!canScrollDealsLeft}
                  className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-red-500 hover:text-red-400 p-3 sm:p-4 rounded-full shadow-2xl border border-red-500/20 transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center ${
                    !canScrollDealsLeft ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={() => scrollDeals('right')}
                  disabled={!canScrollDealsRight}
                  className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-red-500 hover:text-red-400 p-3 sm:p-4 rounded-full shadow-2xl border border-red-500/20 transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center ${
                    !canScrollDealsRight ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}
          </div>

          {/* View All Deals Button */}
          <div className="text-center mt-8 sm:mt-12">
            <button 
              onClick={() => window.location.href = '/menu'}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl hover:from-red-400 hover:to-red-500 transition-all duration-300 font-semibold sm:font-bold text-sm sm:text-lg shadow-lg hover:shadow-red-500/25 hover:scale-105 flex items-center justify-center mx-auto space-x-2 sm:space-x-3"
            >
              <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>View All Deals</span>
            </button>
          </div>
        </section>
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

export default Page