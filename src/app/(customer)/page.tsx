"use client";

import HeroCarousel from '@/components/common/HeroCarousel'
import React, { useEffect, useState } from 'react'
import { Utensils, Star, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, FreeMode, Autoplay } from 'swiper/modules'
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

  // Filter out deal items for featured section
  const getFeaturedItems = () => {
    if (!foodItems || !Array.isArray(foodItems)) return []
    
    const availableItems = foodItems.filter(item => item && item.isAvailable && !isDealItem(item))
    const shuffled = [...availableItems].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 12)
  }

  // Filter deal items only
  const getDealItems = () => {
    if (!foodItems || !Array.isArray(foodItems)) return []
    return foodItems.filter(item => item && item.isAvailable && isDealItem(item))
  }

  const featuredItems = getFeaturedItems()
  const dealItems = getDealItems()

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

          {/* Enhanced Swiper with Multiple Items */}
          <div className="relative">
            <Swiper
              modules={[Navigation, FreeMode, Autoplay]}
              spaceBetween={16}
              slidesPerView={1.2}
              centeredSlides={false}
              navigation={{
                nextEl: '.swiper-button-next-featured',
                prevEl: '.swiper-button-prev-featured',
              }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              freeMode={{
                enabled: true,
                momentum: true,
                momentumBounce: false,
                sticky: true,
                minimumVelocity: 0.01
              }}
              grabCursor={true}
              breakpoints={{
                480: {
                  slidesPerView: 1.8,
                  spaceBetween: 20,
                },
                640: {
                  slidesPerView: 2.2,
                  spaceBetween: 24,
                },
                768: {
                  slidesPerView: 2.5,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 28,
                  freeMode: false
                },
                1280: {
                  slidesPerView: 4,
                  spaceBetween: 32,
                  freeMode: false
                }
              }}
              className="featured-swiper pb-2"
            >
              {featuredItems.map((item) => (
                <SwiperSlide key={item?.id} className="py-2">
                  <div className="h-full transform transition-transform duration-300 hover:scale-[1.02]">
                    <FoodCard foodItem={item} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
            <div className="swiper-button-prev-featured absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-yellow-500 hover:text-yellow-400 p-2 sm:p-3 rounded-full shadow-2xl border border-yellow-500/20 transition-all duration-300 hover:scale-110 cursor-pointer hidden sm:flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="swiper-button-next-featured absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-yellow-500 hover:text-yellow-400 p-2 sm:p-3 rounded-full shadow-2xl border border-yellow-500/20 transition-all duration-300 hover:scale-110 cursor-pointer hidden sm:flex items-center justify-center">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
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

          {/* Enhanced Swiper for Deals */}
          <div className="relative">
            <Swiper
              modules={[Navigation, FreeMode, Autoplay]}
              spaceBetween={16}
              slidesPerView={1.3}
              centeredSlides={false}
              navigation={{
                nextEl: '.swiper-button-next-deals',
                prevEl: '.swiper-button-prev-deals',
              }}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              freeMode={{
                enabled: true,
                momentum: true,
                momentumBounce: false,
                sticky: true
              }}
              grabCursor={true}
              breakpoints={{
                480: {
                  slidesPerView: 1.6,
                  spaceBetween: 20,
                },
                640: {
                  slidesPerView: 2,
                  spaceBetween: 24,
                },
                768: {
                  slidesPerView: 2.3,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 28,
                  freeMode: false
                },
                1280: {
                  slidesPerView: 4,
                  spaceBetween: 32,
                  freeMode: false
                }
              }}
              className="deals-swiper pb-2"
            >
              {dealItems.map((item) => (
                <SwiperSlide key={item?.id} className="py-2">
                  <div className="h-full transform transition-transform duration-300 hover:scale-[1.02]">
                    <FoodCard foodItem={item} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
            <div className="swiper-button-prev-deals absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-red-500 hover:text-red-400 p-2 sm:p-3 rounded-full shadow-2xl border border-red-500/20 transition-all duration-300 hover:scale-110 cursor-pointer hidden sm:flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="swiper-button-next-deals absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-red-500 hover:text-red-400 p-2 sm:p-3 rounded-full shadow-2xl border border-red-500/20 transition-all duration-300 hover:scale-110 cursor-pointer hidden sm:flex items-center justify-center">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
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
        .featured-swiper,
        .deals-swiper {
          overflow: visible !important;
        }

        .featured-swiper .swiper-slide,
        .deals-swiper .swiper-slide {
          transition: transform 0.3s ease;
        }

        .featured-swiper .swiper-slide:hover,
        .deals-swiper .swiper-slide:hover {
          transform: translateY(-8px);
        }

        .swiper-button-prev-featured,
        .swiper-button-next-featured,
        .swiper-button-prev-deals,
        .swiper-button-next-deals {
          backdrop-filter: blur(10px);
        }

        @media (max-width: 640px) {
          .featured-swiper,
          .deals-swiper {
            padding: 0 4px;
          }
          
          .featured-swiper .swiper-slide,
          .deals-swiper .swiper-slide {
            opacity: 0.6;
            transition: opacity 0.3s ease;
          }
          
          .featured-swiper .swiper-slide-active,
          .deals-swiper .swiper-slide-active,
          .featured-swiper .swiper-slide-next,
          .deals-swiper .swiper-slide-next {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default Page