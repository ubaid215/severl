"use client";

import HeroCarousel from '@/components/common/HeroCarousel'
import React, { useEffect, useState } from 'react'
import { Utensils, Star, Clock, Tag, ChevronLeft, ChevronRight, Plus, ShoppingCart, ShoppingCartIcon } from 'lucide-react'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, FreeMode, Autoplay } from 'swiper/modules'

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

// Cart Item Type
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

function Page() {
  const [categories, setCategories] = useState<Category[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])

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
    return shuffled.slice(0, 12) // Increased to 12 for better variety
  }

  const randomFoodItems = getRandomFoodItems()

  // Cart functions
  const addToCart = (item: FoodItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      } else {
        return [...prevCart, {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image
        }]
      }
    })
  }

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
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
      {/* Fixed Cart Icon for Mobile */}
      {getTotalCartItems() > 0 && (
        <div className="fixed top-4 right-4 z-50 md:hidden">
          <button className="bg-yellow-500 text-black p-3 rounded-full shadow-lg flex items-center justify-center relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {getTotalCartItems()}
            </span>
          </button>
        </div>
      )}

      {/* Hero Section */}
      <HeroCarousel />

      {/* Explore Our Menus Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 text-yellow-400">
          Explore Menus
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

      {/* Top Menu Items Section - Swiper Slider */}
      {randomFoodItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center space-x-3">
              <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400">
                Our Top Items
              </h2>
            </div>
            
            {/* Desktop Cart Button */}
            {getTotalCartItems() > 0 && (
              <div className="hidden md:flex">
                <button className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart ({getTotalCartItems()})</span>
                </button>
              </div>
            )}
          </div>

          {/* Swiper Container */}
          <div className="relative">
            <Swiper
              modules={[Navigation, Pagination, FreeMode, Autoplay]}
              spaceBetween={16}
              slidesPerView={1}
              navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
              }}
              pagination={{ 
                clickable: true,
                bulletClass: 'swiper-pagination-bullet custom-bullet',
                bulletActiveClass: 'swiper-pagination-bullet-active custom-bullet-active',
              }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              freeMode={true}
              grabCursor={true}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
                1280: {
                  slidesPerView: 4,
                  spaceBetween: 30,
                }
              }}
              className="food-items-swiper"
            >
              {randomFoodItems.map((item) => (
                <SwiperSlide key={item?.id}>
                  <div className="bg-gray-900 rounded-lg sm:rounded-2xl overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-700 hover:border-yellow-500 h-full">
                    {/* Food Image */}
                    {item?.image ? (
                      <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden bg-gray-800">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full bg-gray-800 flex items-center justify-center">
                                  <svg class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.5 11.5L11 14l4.5-4.5L18 12v6H6v-6l2.5-2.5z"/>
                                    <circle cx="15.5" cy="9.5" r="1.5"/>
                                    <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
                                  </svg>
                                </div>
                              `;
                            }
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs sm:text-sm font-bold">
                          Rs {formatPrice(item?.price)}
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-32 sm:h-40 md:h-48 bg-gray-800 flex items-center justify-center">
                        <Utensils className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-600" />
                        <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs sm:text-sm font-bold">
                          Rs {formatPrice(item?.price)}
                        </div>
                      </div>
                    )}

                    {/* Food Content */}
                    <div className="p-3 sm:p-4 flex flex-col flex-grow bg-gray-900">
                      <h3 className="font-semibold text-white mb-2 text-sm sm:text-base line-clamp-1 group-hover:text-yellow-500">
                        {item?.name || 'Unnamed Item'}
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2 flex-grow">
                        {item?.description || 'No description available'}
                      </p>
                      
                      {/* Category and Add to Cart */}
                      <div className="flex justify-between items-center mt-auto">
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                          {item?.category?.name || 'Uncategorized'}
                        </span>
                        
                        {/* Mobile Add to Cart (Icon Only) */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                          className="sm:hidden bg-yellow-500 text-black p-2 rounded-full hover:bg-yellow-600 transition-colors flex items-center justify-center"
                          aria-label="Add to cart"
                        >
                          <ShoppingCartIcon className="w-4 h-4" />
                        </button>
                        
                        {/* Desktop Add to Cart (With Text) */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                          className="hidden sm:flex bg-yellow-500 text-black px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors items-center space-x-1 text-xs sm:text-sm font-medium"
                        >
                          <ShoppingCartIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
            <div className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-yellow-500 hover:bg-yellow-600 text-black p-2 sm:p-3 rounded-full shadow-lg transition-colors -ml-4 sm:-ml-6 cursor-pointer">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-yellow-500 hover:bg-yellow-600 text-black p-2 sm:p-3 rounded-full shadow-lg transition-colors -mr-4 sm:-mr-6 cursor-pointer">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
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

      {/* Special Deals Section */}
      {(() => {
        // Filter items that match deal-related keywords
        const dealKeywords = ['top deals', 'special deals', 'deals', 'offer', 'discount', 'promo', 'sale'];
        const dealItems = foodItems.filter(item => {
          if (!item || !item.isAvailable) return false;
          
          const categoryName = item.category?.name?.toLowerCase() || '';
          const itemName = item.name?.toLowerCase() || '';
          const itemDescription = item.description?.toLowerCase() || '';
          
          return dealKeywords.some(keyword => 
            categoryName.includes(keyword) || 
            itemName.includes(keyword) || 
            itemDescription.includes(keyword)
          );
        });

        if (dealItems.length === 0) return null;

        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center space-x-3">
                <Tag className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-400">
                  Special Deals
                </h2>
              </div>
              
              {/* Deal Badge */}
              <div className="hidden sm:flex items-center bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                🔥 Limited Time
              </div>
            </div>

            {/* Swiper Container for Deals */}
            <div className="relative">
              <Swiper
                modules={[Navigation, Pagination, FreeMode, Autoplay]}
                spaceBetween={16}
                slidesPerView={1}
                navigation={{
                  nextEl: '.swiper-button-next-deals',
                  prevEl: '.swiper-button-prev-deals',
                }}
                pagination={{ 
                  clickable: true,
                  bulletClass: 'swiper-pagination-bullet custom-bullet-deals',
                  bulletActiveClass: 'swiper-pagination-bullet-active custom-bullet-deals-active',
                }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                freeMode={true}
                grabCursor={true}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 24,
                  },
                  1280: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                  }
                }}
                className="deals-swiper"
              >
                {dealItems.map((item) => (
                  <SwiperSlide key={item?.id}>
                    <div className="bg-gray-900 rounded-lg sm:rounded-2xl overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer border border-red-700 hover:border-red-500 h-full relative">
                      {/* Deal Badge */}
                      <div className="absolute top-2 left-2 z-20 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                        🔥 DEAL
                      </div>

                      {/* Food Image */}
                      {item?.image ? (
                        <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden bg-gray-800">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <svg class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8.5 11.5L11 14l4.5-4.5L18 12v6H6v-6l2.5-2.5z"/>
                                      <circle cx="15.5" cy="9.5" r="1.5"/>
                                      <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
                                    </svg>
                                  </div>
                                `;
                              }
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-bold">
                            Rs {formatPrice(item?.price)}
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-32 sm:h-40 md:h-48 bg-gray-800 flex items-center justify-center">
                          <Utensils className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-600" />
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-bold">
                            Rs {formatPrice(item?.price)}
                          </div>
                        </div>
                      )}

                      {/* Food Content */}
                      <div className="p-3 sm:p-4 flex flex-col flex-grow bg-gray-900">
                        <h3 className="font-semibold text-white mb-2 text-sm sm:text-base line-clamp-1 group-hover:text-red-400">
                          {item?.name || 'Unnamed Item'}
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2 flex-grow">
                          {item?.description || 'No description available'}
                        </p>
                        
                        {/* Category and Add to Cart */}
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded border border-red-700">
                            {item?.category?.name || 'Uncategorized'}
                          </span>
                          
                          {/* Mobile Add to Cart (Icon Only) */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="sm:hidden bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                            aria-label="Add to cart"
                          >
                            <ShoppingCartIcon className="w-4 h-4" />
                          </button>
                          
                          {/* Desktop Add to Cart (With Text) */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="hidden sm:flex bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors items-center space-x-1 text-xs sm:text-sm font-medium"
                          >
                            <ShoppingCartIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Custom Navigation Buttons for Deals */}
              <div className="swiper-button-prev-deals absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-red-500 hover:bg-red-600 text-white p-2 sm:p-3 rounded-full shadow-lg transition-colors -ml-4 sm:-ml-6 cursor-pointer">
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="swiper-button-next-deals absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-red-500 hover:bg-red-600 text-white p-2 sm:p-3 rounded-full shadow-lg transition-colors -mr-4 sm:-mr-6 cursor-pointer">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            {/* View All Deals Button */}
            <div className="text-center mt-6 sm:mt-8">
              <button 
                onClick={() => window.location.href = '/deals'}
                className="px-6 sm:px-8 py-2 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold text-sm sm:text-base flex items-center justify-center mx-auto space-x-2"
              >
                <Tag className="w-4 h-4" />
                <span>View All Deals</span>
              </button>
            </div>
          </section>
        );
      })()}

      {/* Custom Styles */}
      <style jsx global>{`
        .food-items-swiper,
        .deals-swiper {
          padding-bottom: 40px !important;
        }

        .food-items-swiper .swiper-pagination,
        .deals-swiper .swiper-pagination {
          bottom: 0 !important;
        }

        .custom-bullet {
          width: 12px !important;
          height: 12px !important;
          background: #6b7280 !important;
          opacity: 1 !important;
          margin: 0 4px !important;
          border-radius: 50% !important;
          transition: all 0.3s ease !important;
        }

        .custom-bullet-active {
          background: #eab308 !important;
          transform: scale(1.2) !important;
        }

        /* Deals Section Bullets */
        .custom-bullet-deals {
          width: 12px !important;
          height: 12px !important;
          background: #6b7280 !important;
          opacity: 1 !important;
          margin: 0 4px !important;
          border-radius: 50% !important;
          transition: all 0.3s ease !important;
        }

        .custom-bullet-deals-active {
          background: #ef4444 !important;
          transform: scale(1.2) !important;
        }

        .swiper-button-prev-custom:hover,
        .swiper-button-next-custom:hover,
        .swiper-button-prev-deals:hover,
        .swiper-button-next-deals:hover {
          transform: translateY(-50%) scale(1.1);
        }

        @media (max-width: 640px) {
          .custom-bullet,
          .custom-bullet-deals {
            width: 8px !important;
            height: 8px !important;
            margin: 0 3px !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Page