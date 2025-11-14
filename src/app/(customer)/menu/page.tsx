// app/menu/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import CategoryTab from '@/components/menu/CategoryTabs'
import FoodCard from '@/components/menu/FoodCard'
import { Star, Utensils } from 'lucide-react'

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

function MenuContent() {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')
  
  const [categories, setCategories] = useState<Category[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Single fetch if category is selected, otherwise fetch all
        const endpoint = activeCategory 
          ? `/api/food-items?categoryId=${activeCategory}`
          : '/api/food-items'
        
        const [categoriesRes, foodItemsRes] = await Promise.all([
          fetch('/api/categories', {
            next: { revalidate: 300 }
          }),
          fetch(endpoint, {
            next: { revalidate: 120 }
          })
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
  }, [activeCategory]) // Only refetch when category changes

  const filteredItems = activeCategory 
    ? foodItems.filter(item => item.category.id === activeCategory && item.isAvailable)
    : foodItems.filter(item => item.isAvailable)

  const foodItemsByCategory = categories.reduce((acc, category) => {
    if (category.isActive) {
      acc[category.id] = foodItems.filter(item => 
        item.category.id === category.id && item.isAvailable
      )
    }
    return acc
  }, {} as Record<string, FoodItem[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-500 text-lg">Loading menu...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-[#101828] border-b border-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              {activeCategory ? categories.find(cat => cat.id === activeCategory)?.name : 'Our Menu'}
            </h1>
            <p className="text-lg text-gray-300 mt-2">
              {activeCategory 
                ? `Explore our ${categories.find(cat => cat.id === activeCategory)?.name.toLowerCase()} selection`
                : 'Discover our delicious offerings'
              }
            </p>
          </div>
        </div>
      </div>

      <CategoryTab categories={categories} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeCategory && (
          <section className="mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-2 border-b-2 border-yellow-500">
              <h2 className="text-2xl font-bold text-white flex items-center mb-2 sm:mb-0">
                <Utensils className="w-5 h-5 mr-2 text-yellow-500" />
                {categories.find(cat => cat.id === activeCategory)?.name} Menu
              </h2>
              <span className="text-sm text-yellow-500 bg-black px-3 py-1 rounded-full">
                {filteredItems.length} items available
              </span>
            </div>
            
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-300 text-lg">
                  No items available in this category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredItems.map((item) => (
                  <FoodCard key={item.id} foodItem={item} />
                ))}
              </div>
            )}
          </section>
        )}

        {!activeCategory && (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 pb-2 border-b-2 border-yellow-500 flex items-center">
                <Star className="w-6 h-6 mr-2 text-yellow-500" />
                All Menu Items
              </h2>
              
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <Utensils className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-300 text-lg">No menu items available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredItems.map((item) => (
                    <FoodCard key={item.id} foodItem={item} />
                  ))}
                </div>
              )}
            </section>

            {categories
              .filter(category => category.isActive && foodItemsByCategory[category.id]?.length > 0)
              .map((category) => (
                <section key={category.id} className="mb-12">
                  <h2 className="text-2xl font-bold text-white mb-6 pb-2 border-b-2 border-yellow-500">
                    {category.name}
                  </h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {foodItemsByCategory[category.id].map((item) => (
                      <FoodCard key={item.id} foodItem={item} />
                    ))}
                  </div>
                </section>
              ))}
          </>
        )}
      </div>
    </div>
  )
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-500 text-lg">Loading menu...</div>
      </div>
    }>
      <MenuContent />
    </Suspense>
  )
}