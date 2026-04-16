// types/food.ts
export interface Category {
  id: string
  name: string
  image?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FoodItem {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  categoryId: string
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
  category?: Category
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}