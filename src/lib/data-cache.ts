// lib/data-cache.ts
// Server-side cache for API responses

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 60 * 1000 // 1 minute default

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Invalidate all keys matching a pattern
  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys())
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    })
  }
}

export const dataCache = new DataCache()

// Cache durations (in milliseconds)
export const CACHE_TIMES = {
  CATEGORIES: 5 * 60 * 1000,      // 5 minutes - categories don't change often
  FOOD_ITEMS: 2 * 60 * 1000,      // 2 minutes - food items change occasionally
  CART: 30 * 1000,                 // 30 seconds - cart needs fresher data
  MENU_PAGE: 3 * 60 * 1000,       // 3 minutes - full menu page
}