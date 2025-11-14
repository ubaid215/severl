// app/menu/[category]/page.tsx
import { notFound } from 'next/navigation'
import CategoryTab from '@/components/menu/CategoryTabs'
import FoodCard from '@/components/menu/FoodCard'
import { Star, Utensils } from 'lucide-react'
import { getCategories, getCategoryById, getFoodItems } from '@/lib/api'

interface PageProps {
  params: Promise<{
    category: string
  }>
}

// Enable ISR with 2-minute revalidation instead of force-dynamic
export const revalidate = 120

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

    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="bg-[#101828] border-b border-yellow-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Utensils className="w-8 h-8 text-yellow-500" />
              </div>
              <h1 className="text-4xl font-bold text-white">
                {currentCategory.name}
              </h1>
              <p className="text-lg text-gray-300 mt-2">
                Explore our {currentCategory.name.toLowerCase()} selection
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <CategoryTab categories={categories} />

        {/* Category Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-2 border-b-2 border-yellow-500">
              <h2 className="text-2xl font-bold text-white flex items-center mb-2 sm:mb-0">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                {currentCategory.name} Menu
              </h2>
              <span className="text-sm text-yellow-500 bg-black px-3 py-1 rounded-full">
                {availableItems.length} items available
              </span>
            </div>
            
            {availableItems.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-300 text-lg">
                  No {currentCategory.name.toLowerCase()} items available at the moment.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Check back later for new additions!
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
    )
  } catch (error) {
    console.error('Error loading category page:', error)
    notFound() // Show 404 if there's any error
  }
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories()
    return categories
      .filter(cat => cat.isActive)
      .map((category) => ({
        category: category.id,
      }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return [] // Return empty array if API fails
  }
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const { category: categoryId } = await params
    const category = await getCategoryById(categoryId)
    
    return {
      title: category ? `${category.name} Menu` : 'Category Not Found',
      description: category ? `Browse our ${category.name.toLowerCase()} menu items` : 'Category not found',
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Category Not Found',
      description: 'Category not found',
    }
  }
}