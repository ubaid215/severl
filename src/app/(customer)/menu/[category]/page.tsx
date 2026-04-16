// app/menu/[category]/page.tsx
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'
import CategoryTab from '@/components/menu/CategoryTabs'
import FoodCard from '@/components/menu/FoodCard'
import { getCategories, getCategoryById, getFoodItems } from '@/lib/api'

interface PageProps {
  params: Promise<{
    category: string
  }>
}

// SAFEST OPTION: Disable static generation entirely
// Use dynamic rendering with ISR (2-minute revalidation)
export const dynamic = 'force-dynamic'
export const revalidate = 120

// Hero image mapping based on category
const getHeroImage = (categoryName: string): string => {
  const categoryKey = categoryName.toLowerCase()
  
  if (categoryKey.includes('deal') || categoryKey.includes('offer')) {
    return '/images/menu-hero.webp'
  }
  if (categoryKey.includes('premium') || categoryKey.includes('luxury')) {
    return '/images/hero/premium-hero.jpg'
  }
  if (categoryKey.includes('traditional') || categoryKey.includes('classic')) {
    return '/images/hero/traditional-hero.jpg'
  }
  if (categoryKey.includes('dessert') || categoryKey.includes('sweet')) {
    return '/images/hero/dessert-hero.jpg'
  }
  if (categoryKey.includes('beverage') || categoryKey.includes('drink')) {
    return '/images/hero/beverage-hero.jpg'
  }
  
  return '/images/hero/default-category-hero.jpg'
}

// Loading component
function CategorySkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] bg-gradient-to-r from-gray-900 to-black animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="h-8 bg-gray-800 rounded w-1/4 mb-6 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-64 bg-gray-900 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function CategoryMenuPage({ params }: PageProps) {
  // Await params before accessing properties
  const { category: categoryId } = await params
  
  try {
    // Parallel data fetching with caching from lib/api
    const [categories, currentCategory, categoryFoodItems] = await Promise.all([
      getCategories(),
      getCategoryById(categoryId),
      getFoodItems(categoryId)
    ])

    if (!currentCategory || !currentCategory.isActive) {
      notFound()
    }

    const availableItems = categoryFoodItems.filter(item => item.isAvailable)
    const heroImage = getHeroImage(currentCategory.name)

    return (
      <Suspense fallback={<CategorySkeleton />}>
        <div className="min-h-screen bg-black">
          {/* Premium Hero Section */}
          <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={heroImage}
                alt={currentCategory.name}
                fill
                className="object-cover"
                priority
                quality={90}
                sizes="100vw"
              />
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
            </div>

            {/* Decorative blurred accent */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl" />

            {/* Hero Content */}
            <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-4xl mx-auto">
                {/* Title with gradient */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6">
                  <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                    {currentCategory.name}
                  </span>
                </h1>
                
                {/* Description */}
                <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto px-4">
                  Explore our exquisite {currentCategory.name.toLowerCase()} selection, crafted with passion and precision
                </p>

                {/* Stats badges */}
                <div className="flex flex-wrap justify-center gap-3 mt-6 sm:mt-8">
                  <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm">
                    <span className="text-yellow-500 font-bold">{availableItems.length}</span>
                    <span className="text-gray-300 ml-1">Premium Items</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm">
                    <span className="text-yellow-500">✦</span>
                    <span className="text-gray-300 ml-1">Fresh Daily</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Tabs - Wrap in Suspense if it uses useSearchParams */}
          <Suspense fallback={<div className="h-16 bg-gray-900 animate-pulse" />}>
            <CategoryTab categories={categories} />
          </Suspense>

          {/* Category Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <section>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-3 border-b border-yellow-500/30">
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
                  <div className="w-1 h-6 sm:h-7 bg-yellow-500 rounded-full mr-3" />
                  {currentCategory.name} Selection
                </h2>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <span className="text-xs sm:text-sm text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    {availableItems.length} exquisite items
                  </span>
                </div>
              </div>
              
              {availableItems.length === 0 ? (
                <div className="text-center py-16 sm:py-24 bg-gradient-to-br from-gray-900/50 to-black rounded-2xl">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p className="text-gray-300 text-lg">
                    No {currentCategory.name.toLowerCase()} items available at the moment.
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Check back later for new additions to our collection.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {availableItems.map((item) => (
                    <FoodCard key={item.id} foodItem={item} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </Suspense>
    )
  } catch (error) {
    console.error('Error loading category page:', error)
    notFound()
  }
}


export async function generateMetadata({ params }: PageProps) {
  try {
    const { category: categoryId } = await params
    const category = await getCategoryById(categoryId)
    
    if (!category) {
      return {
        title: 'Category Not Found',
        description: 'Category not found',
      }
    }
    
    return {
      title: `${category.name} Menu | Premium Selection`,
      description: `Explore our exquisite ${category.name.toLowerCase()} selection, crafted with passion and precision. Fresh daily, premium quality.`,
      openGraph: {
        title: `${category.name} Menu`,
        description: `Discover our ${category.name.toLowerCase()} collection`,
        type: 'website',
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Menu | Premium Selection',
      description: 'Explore our exquisite menu selection',
    }
  }
}