// components/CategoryTab.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Utensils } from 'lucide-react'

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

  const activeCategories = categories.filter(cat => cat.isActive)

  return (
    <div className="w-full bg-black border-b border-yellow-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 overflow-x-auto py-4">
          {/* All Categories Tab */}
          <Link
            href="/menu"
            className={`flex items-center flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-yellow-500 text-black shadow-lg'
                : 'bg-[#101828] text-white hover:bg-blue-600'
            }`}
          >
            <Utensils className="w-4 h-4 mr-2" />
            All Menu
          </Link>

          {/* Category Tabs */}
          {activeCategories.map((category) => (
            <Link
              key={category.id}
              href={`/menu/${category.id}`}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === category.id
                  ? 'bg-yellow-500 text-black shadow-lg'
                  : 'bg-[#101828] text-white hover:bg-blue-600'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}