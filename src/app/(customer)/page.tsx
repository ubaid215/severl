"use client";

import HeroCarousel from '@/components/common/HeroCarousel'
import React, { useEffect, useState } from 'react'
import { Utensils, Star, Clock, Tag, ChevronLeft, ChevronRight } from 'lucide-react'

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

// Type for Special Deal
interface SpecialDeal {
  id: string
  title: string
  description: string
  image?: string
  discount: number
  discountType: 'PERCENTAGE' | 'FIXED'
  originalPrice?: number
  finalPrice?: number
  minOrderAmount?: number
  validFrom: string
  validTo: string
  isActive: boolean
}

function Page() {
  const [categories, setCategories] = useState<Category[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDealIndex, setCurrentDealIndex] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [categoriesRes, foodItemsRes, dealsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/food-items'),
          fetch('/api/special-deals?active=true')
        ])

        const categoriesData = await categoriesRes.json()
        const foodItemsData = await foodItemsRes.json()
        const dealsData = await dealsRes.json()

        console.log('Deals API Response:', dealsData) // Debug log

        // Safe data setting with fallbacks
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

  // Safe function to get random food items
  const getRandomFoodItems = () => {
    if (!foodItems || !Array.isArray(foodItems)) return []
    
    const availableItems = foodItems.filter(item => item && item.isAvailable)
    const shuffled = [...availableItems].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 8)
  }

  const randomFoodItems = getRandomFoodItems()

  // Slider functionality
  const itemsPerSlide = {
    mobile: 1,
    tablet: 2,
    desktop: 4
  }

  const getItemsPerSlide = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return itemsPerSlide.mobile
      if (window.innerWidth < 1024) return itemsPerSlide.tablet
      return itemsPerSlide.desktop
    }
    return itemsPerSlide.desktop
  }

  const [itemsToShow, setItemsToShow] = useState(getItemsPerSlide())

  useEffect(() => {
    const handleResize = () => {
      setItemsToShow(getItemsPerSlide())
      setCurrentSlide(0) // Reset slide on resize
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxSlides = Math.max(0, randomFoodItems.length - itemsToShow)

  const nextSlide = () => {
    setCurrentSlide(prev => (prev >= maxSlides ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev <= 0 ? maxSlides : prev - 1))
  }

  // Safe price formatting
  const formatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null || isNaN(price)) {
      return '0.00'
    }
    return price.toFixed(2)
  }

  // Safe date formatting
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Invalid date'
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  // Safe time remaining calculation
  const getTimeRemaining = (validTo: string | undefined): string => {
    if (!validTo) return 'Invalid date'
    
    try {
      const now = new Date()
      const end = new Date(validTo)
      const diff = end.getTime() - now.getTime()
      
      if (diff <= 0) return 'Expired'
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      if (days > 0) return `${days}d ${hours}h left`
      return `${hours}h left`
    } catch (error) {
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-500 text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-black text-white">
      {/* Hero Section */}
      <HeroCarousel />

      
      {/* Explore Our Menus Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 text-yellow-400">
          Explore our menus
        </h2>

        {/* Categories Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {categories.map((category) => (
            <div
              key={category?.id}
              className="bg-gray-900 rounded-lg sm:rounded-2xl shadow-lg overflow-hidden group hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-700 hover:border-yellow-500"
            >
              {/* Category Image */}
              {category?.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-24 sm:h-32 md:h-40 lg:h-48 object-cover group-hover:opacity-90 transition"
                />
              ) : (
                <div className="w-full h-24 sm:h-32 md:h-40 lg:h-48 bg-gray-800 flex items-center justify-center">
                  <Utensils className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-gray-600" />
                </div>
              )}

              {/* Category Name */}
              <div className="p-2 sm:p-3 md:p-4 flex flex-col items-center justify-center bg-gray-900">
                <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-white group-hover:text-yellow-500 transition-colors text-center line-clamp-2">
                  {category?.name || 'Unnamed Category'}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Top Menu Items Section - Now as Slider */}
      {randomFoodItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center space-x-3 mb-6 sm:mb-8">
            <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400">
              Our Top Items
            </h2>
          </div>

          {/* Slider Container */}
          <div className="relative">
            {/* Navigation Buttons */}
            {randomFoodItems.length > itemsToShow && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded-full shadow-lg transition-colors -ml-4 sm:-ml-6"
                  aria-label="Previous items"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded-full shadow-lg transition-colors -mr-4 sm:-mr-6"
                  aria-label="Next items"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            )}

            {/* Slider Content */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentSlide * (100 / itemsToShow)}%)`,
                  width: `${(randomFoodItems.length / itemsToShow) * 100}%`
                }}
              >
                {randomFoodItems.map((item) => (
                  <div
                    key={item?.id}
                    className="flex-shrink-0 px-2 sm:px-3"
                    style={{ width: `${100 / randomFoodItems.length}%` }}
                  >
                    <div className="bg-gray-900 rounded-lg sm:rounded-2xl overflow-hidden group hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-700 hover:border-yellow-500 h-full">
                      {/* Food Image */}
                      {item?.image ? (
                        <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs sm:text-sm font-bold">
                            Rs {formatPrice(item?.price)}
                          </div>
                        </div>
                      ) : (
                        <div className="h-32 sm:h-40 md:h-48 bg-gray-800 flex items-center justify-center">
                          <Utensils className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-600" />
                        </div>
                      )}

                      {/* Food Content */}
                      <div className="p-3 sm:p-4 flex flex-col flex-grow">
                        <h3 className="font-semibold text-white mb-2 text-sm sm:text-base line-clamp-1 group-hover:text-yellow-500">
                          {item?.name || 'Unnamed Item'}
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2 flex-grow">
                          {item?.description || 'No description available'}
                        </p>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                            {item?.category?.name || 'Uncategorized'}
                          </span>
                          <button 
                            onClick={() => window.location.href = '/menu'}
                            className="text-yellow-500 hover:text-yellow-400 text-xs sm:text-sm font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            {randomFoodItems.length > itemsToShow && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: maxSlides + 1 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                      currentSlide === index ? 'bg-yellow-500' : 'bg-gray-600'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* View All Button */}
          <div className="text-center mt-6 sm:mt-8">
            <button 
              onClick={() => window.location.href = '/menu'}
              className="px-6 sm:px-8 py-2 sm:py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-semibold text-sm sm:text-base"
            >
              View Full Menu
            </button>
          </div>
        </section>
      )}

    </div>
  )
}

export default Page