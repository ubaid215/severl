// contexts/DataContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Category {
  id: string
  name: string
  image?: string
  isActive: boolean
}

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

interface DataContextType {
  categories: Category[]
  foodItems: FoodItem[]
  loading: boolean
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Client-side cache with timestamp
let cachedData: {
  categories: Category[]
  foodItems: FoodItem[]
  timestamp: number
} | null = null

const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

export function DataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async (force: boolean = false) => {
    // Use cache if available and fresh
    if (!force && cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      setCategories(cachedData.categories)
      setFoodItems(cachedData.foodItems)
      setLoading(false)
      console.log('✅ Using client-side cached data')
      return
    }

    try {
      setLoading(true)
      console.log('🔄 Fetching fresh data from API')
      
      const [categoriesRes, foodItemsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/food-items')
      ])

      const categoriesData = await categoriesRes.json()
      const foodItemsData = await foodItemsRes.json()

      const newCategories = categoriesData.data || []
      const newFoodItems = foodItemsData.data || []

      // Update state
      setCategories(newCategories)
      setFoodItems(newFoodItems)

      // Update cache
      cachedData = {
        categories: newCategories,
        foodItems: newFoodItems,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const refreshData = async () => {
    await fetchData(true)
  }

  return (
    <DataContext.Provider value={{ categories, foodItems, loading, refreshData }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}