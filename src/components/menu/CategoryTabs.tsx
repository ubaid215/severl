'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { Utensils, Tag, Sparkles, Crown } from 'lucide-react'

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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeTab = searchParams.get('category') || 'all'

  const [indicatorStyle, setIndicatorStyle] = useState({})
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  // Update sliding indicator position
  useEffect(() => {
    const activeElement = tabRefs.current.get(activeTab)
    if (activeElement && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const activeRect = activeElement.getBoundingClientRect()
      setIndicatorStyle({
        width: activeRect.width,
        transform: `translateX(${activeRect.left - containerRect.left + containerRef.current.scrollLeft}px)`,
      })
    }
  }, [activeTab, categories])

  // Scroll active tab into view
  useEffect(() => {
    const activeElement = tabRefs.current.get(activeTab)
    activeElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeTab])

  const handleTabClick = useCallback((categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId === 'all') {
      params.delete('category')
    } else {
      params.set('category', categoryId)
    }
    // Shallow push — stays on /menu, no page reload
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const activeCategories = categories.filter(cat => cat.isActive)

  const isDealCategory = (categoryName: string): boolean => {
    const dealKeywords = ['top deals', 'special deals', 'deals', 'offer', 'discount', 'promo', 'sale']
    return dealKeywords.some(keyword =>
      categoryName.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  const getCategoryIcon = (categoryName: string, isDeals: boolean) => {
    if (isDeals) return <Tag className="w-4 h-4" />
    if (categoryName.toLowerCase().includes('premium')) return <Crown className="w-4 h-4" />
    if (categoryName.toLowerCase().includes('featured')) return <Sparkles className="w-4 h-4" />
    return <Utensils className="w-4 h-4" />
  }

  return (
    <div className="relative w-full bg-gradient-to-b from-black via-[#0a0a0a] to-black border-b border-yellow-500/20">
      {/* Top gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-1/2 h-full bg-yellow-500/5 blur-3xl" />
        </div>

        <div className="relative" ref={containerRef}>
          {/* Sliding indicator */}
          <div
            className="absolute bottom-3 h-0.5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)]"
            style={indicatorStyle}
          />

          <div className="flex space-x-1 overflow-x-auto py-5 scrollbar-hide">
            {/* All Menu tab */}
            <button
              ref={(el) => { if (el) tabRefs.current.set('all', el) }}
              onClick={() => handleTabClick('all')}
              onMouseEnter={() => setHoveredId('all')}
              onMouseLeave={() => setHoveredId(null)}
              className={`
                group relative flex items-center flex-shrink-0 px-5 py-2.5 rounded-xl font-medium text-sm
                transition-all duration-300 cursor-pointer
                ${activeTab === 'all'
                  ? 'text-yellow-400 bg-gradient-to-br from-yellow-500/10 to-transparent'
                  : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/5'
                }
              `}
            >
              <div className={`
                absolute inset-0 rounded-xl transition-opacity duration-300
                ${hoveredId === 'all' && activeTab !== 'all' ? 'bg-yellow-500/5 opacity-100' : 'opacity-0'}
              `} />

              <Sparkles className={`
                w-4 h-4 mr-2 transition-all duration-300
                ${activeTab === 'all' ? 'text-yellow-400 rotate-12' : 'text-gray-500 group-hover:text-yellow-400 group-hover:rotate-12'}
              `} />

              <span className="relative">All Menu</span>
            </button>

            {/* Category tabs */}
            {activeCategories.map((category) => {
              const isDeals = isDealCategory(category.name)
              const isActive = activeTab === category.id
              const isHovered = hoveredId === category.id

              return (
                <button
                  key={category.id}
                  ref={(el) => { if (el) tabRefs.current.set(category.id, el) }}
                  onClick={() => handleTabClick(category.id)}
                  onMouseEnter={() => setHoveredId(category.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`
                    group relative flex items-center flex-shrink-0 px-5 py-2.5 rounded-xl font-medium text-sm
                    transition-all duration-300 cursor-pointer
                    ${isActive
                      ? isDeals
                        ? 'text-red-400 bg-gradient-to-br from-red-500/10 to-transparent'
                        : 'text-yellow-400 bg-gradient-to-br from-yellow-500/10 to-transparent'
                      : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/5'
                    }
                  `}
                >
                  {/* Hover glow */}
                  <div className={`
                    absolute inset-0 rounded-xl transition-all duration-300
                    ${isHovered && !isActive ? 'bg-yellow-500/5 shadow-lg' : 'opacity-0'}
                  `} />

                  {/* Icon */}
                  <div className={`relative transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {getCategoryIcon(category.name, isDeals)}
                  </div>

                  <span className="ml-2 relative">
                    {category.name}

                    {/* Deals live indicator */}
                    {isDeals && isActive && (
                      <span className="absolute -top-4 -right-6 flex items-center gap-0.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                      </span>
                    )}
                  </span>

                  {/* Premium crown badge on hover */}
                  {category.name.toLowerCase().includes('premium') && !isActive && (
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Crown className="w-3 h-3 text-yellow-500" />
                    </div>
                  )}

                  {/* Active tab shine */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent -translate-x-full animate-shine" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Bottom gold line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }

        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shine { animation: shine 2s ease-in-out infinite; }

        .overflow-x-auto { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
      `}</style>
    </div>
  )
}