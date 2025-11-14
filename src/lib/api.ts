// lib/api.ts
// Centralized API functions with caching

import { dataCache, CACHE_TIMES } from './data-cache'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

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

// Categories API
export async function getCategories(): Promise<Category[]> {
  const cacheKey = 'categories:all'
  
  // Check cache first
  const cached = dataCache.get<Category[]>(cacheKey)
  if (cached) {
    console.log('✅ Cache hit: categories')
    return cached
  }

  console.log('🔄 Fetching: categories')
  const response = await fetch(`${API_URL}/api/categories`, {
    next: { revalidate: 300 } // Revalidate every 5 minutes
  })
  
  if (!response.ok) throw new Error('Failed to fetch categories')
  
  const data = await response.json()
  const categories = data.data || []
  
  // Store in cache
  dataCache.set(cacheKey, categories, CACHE_TIMES.CATEGORIES)
  
  return categories
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const cacheKey = `category:${id}`
  
  // Check cache first
  const cached = dataCache.get<Category | null>(cacheKey)
  if (cached !== null && cached !== undefined) {
    console.log(`✅ Cache hit: category ${id}`)
    return cached
  }

  console.log(`🔄 Fetching: category ${id}`)
  const response = await fetch(`${API_URL}/api/categories/${id}`, {
    next: { revalidate: 300 }
  })
  
  if (!response.ok) return null
  
  const data = await response.json()
  const category = data.data || null
  
  // Store in cache
  dataCache.set(cacheKey, category, CACHE_TIMES.CATEGORIES)
  
  return category
}

// Food Items API
export async function getFoodItems(categoryId?: string): Promise<FoodItem[]> {
  const cacheKey = categoryId ? `food-items:category:${categoryId}` : 'food-items:all'
  
  // Check cache first
  const cached = dataCache.get<FoodItem[]>(cacheKey)
  if (cached) {
    console.log(`✅ Cache hit: food items${categoryId ? ` for category ${categoryId}` : ''}`)
    return cached
  }

  console.log(`🔄 Fetching: food items${categoryId ? ` for category ${categoryId}` : ''}`)
  const url = categoryId 
    ? `${API_URL}/api/food-items?categoryId=${categoryId}`
    : `${API_URL}/api/food-items`
    
  const response = await fetch(url, {
    next: { revalidate: 120 } // Revalidate every 2 minutes
  })
  
  if (!response.ok) throw new Error('Failed to fetch food items')
  
  const data = await response.json()
  const foodItems = data.data || []
  
  // Store in cache
  dataCache.set(cacheKey, foodItems, CACHE_TIMES.FOOD_ITEMS)
  
  return foodItems
}

export async function getFoodItemById(id: string): Promise<FoodItem | null> {
  const cacheKey = `food-item:${id}`
  
  // Check cache first
  const cached = dataCache.get<FoodItem | null>(cacheKey)
  if (cached !== null && cached !== undefined) {
    console.log(`✅ Cache hit: food item ${id}`)
    return cached
  }

  console.log(`🔄 Fetching: food item ${id}`)
  const response = await fetch(`${API_URL}/api/food-items/${id}`, {
    next: { revalidate: 120 }
  })
  
  if (!response.ok) return null
  
  const data = await response.json()
  const foodItem = data.data || null
  
  // Store in cache
  dataCache.set(cacheKey, foodItem, CACHE_TIMES.FOOD_ITEMS)
  
  return foodItem
}

// Cart API (less caching, more real-time)
export async function getCart(sessionId: string) {
  const cacheKey = `cart:${sessionId}`
  
  // Check cache first (shorter TTL for cart)
  const cached = dataCache.get(cacheKey)
  if (cached) {
    console.log(`✅ Cache hit: cart ${sessionId}`)
    return cached
  }

  console.log(`🔄 Fetching: cart ${sessionId}`)
  const response = await fetch(`${API_URL}/api/cart?sessionId=${sessionId}`, {
    cache: 'no-store' // Cart should be fresh
  })
  
  if (!response.ok) throw new Error('Failed to fetch cart')
  
  const data = await response.json()
  
  // Store in cache with shorter TTL
  dataCache.set(cacheKey, data, CACHE_TIMES.CART)
  
  return data
}

// Cache invalidation functions
export function invalidateCategoryCache() {
  dataCache.invalidatePattern('category')
  console.log('🗑 Invalidated category cache')
}

export function invalidateFoodItemCache() {
  dataCache.invalidatePattern('food-item')
  console.log('🗑 Invalidated food item cache')
}

export function invalidateCartCache(sessionId: string) {
  dataCache.delete(`cart:${sessionId}`)
  console.log(`🗑 Invalidated cart cache for ${sessionId}`)
}