'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Utensils, Tag } from 'lucide-react'

interface Category {
  id: string
  name: string
  image?: string
  isActive: boolean
}

interface CategoryTabProps {
  categories: Category[]
}

export default function CategoryTab({ categories }: CategoryTabProps) {
  const [activeTab, setActiveTab] = useState<string>('all')
  const pathname = usePathname()

  useEffect(() => {
    if (pathname.startsWith('/menu/')) {
      const categorySlug = pathname.split('/menu/')[1]
      setActiveTab(categorySlug || 'all')
    } else {
      setActiveTab('all')
    }
  }, [pathname])

  // Filter active categories
  const activeCategories = categories.filter(cat => cat.isActive)

  // Function to check if a category is deals-related
  const isDealCategory = (categoryName: string): boolean => {
    const dealKeywords = ['top deals', 'special deals', 'deals', 'offer', 'discount', 'promo', 'sale']
    return dealKeywords.some(keyword => 
      categoryName.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  // Function to get tab styling based on category type
  const getTabStyling = (categoryId: string, categoryName?: string) => {
    const isActive = activeTab === categoryId
    const isDeals = categoryName ? isDealCategory(categoryName) : false

    if (isActive) {
      return isDeals 
        ? 'bg-red-500 text-white shadow-lg border-2 border-red-400' 
        : 'bg-yellow-500 text-black shadow-lg'
    } else {
      return isDeals 
        ? 'bg-gray-900 text-red-400 hover:bg-red-900/30 border border-red-700/50 hover:border-red-500' 
        : 'bg-[#101828] text-white hover:bg-yellow-700'
    }
  }

  return (
    <div className="w-full bg-black border-b border-yellow-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 overflow-x-auto py-4 scrollbar-hide">
          {/* All Categories Tab */}
          <Link
            href="/menu"
            className={`flex items-center flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${getTabStyling('all')}`}
          >
            <Utensils className="w-4 h-4 mr-2" />
            All Menu
          </Link>

          {/* Category Tabs */}
          {activeCategories.map((category) => {
            const isDeals = isDealCategory(category.name)
            
            return (
              <Link
                key={category.id}
                href={`/menu/${category.id}`}
                className={`flex items-center flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 relative ${getTabStyling(category.id, category.name)}`}
              >
                {/* Add icon for deals categories */}
                {isDeals && (
                  <>
                    <Tag className="w-4 h-4 mr-2" />
                    {activeTab !== category.id && (
                      <span className="absolute -top-1 -right-1 text-xs animate-pulse">🔥</span>
                    )}
                  </>
                )}
                {!isDeals && <Utensils className="w-4 h-4 mr-2" />}
                
                {category.name}
                
                {/* Deal badge for active deals tab */}
                {isDeals && activeTab === category.id && (
                  <span className="ml-2 px-1.5 py-0.5 bg-red-600 text-white text-xs rounded-full animate-pulse">
                    HOT
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

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