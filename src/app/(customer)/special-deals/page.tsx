// app/special-deals/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Star, Tag, Clock, Calendar, Percent, DollarSign } from 'lucide-react'

interface SpecialDeal {
  id: string
  title: string
  description: string
  image?: string
  discount: number
  discountType: 'PERCENTAGE' | 'FIXED'
  minOrderAmount?: number
  validFrom: string
  validTo: string
  isActive: boolean
}

export default function SpecialDealsPage() {
  const [deals, setDeals] = useState<SpecialDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active'>('active')

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/special-deals?active=${filter === 'active'}`)
        const data = await response.json()
        setDeals(data.data || [])
      } catch (error) {
        console.error('Error fetching deals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [filter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isDealActive = (deal: SpecialDeal) => {
    const now = new Date()
    const validFrom = new Date(deal.validFrom)
    const validTo = new Date(deal.validTo)
    return deal.isActive && now >= validFrom && now <= validTo
  }

  const getTimeRemaining = (validTo: string) => {
    const now = new Date()
    const end = new Date(validTo)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-500 text-lg">Loading special deals...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-[#101828] border-b border-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Tag className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Special Deals & Offers
            </h1>
            <p className="text-lg text-gray-300">
              Don't miss out on our exclusive discounts and limited-time offers
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setFilter('active')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              filter === 'active'
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            Active Deals
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              filter === 'all'
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            All Deals
          </button>
        </div>

        {/* Deals Grid */}
        {deals.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No deals available</h3>
            <p className="text-gray-400">
              {filter === 'active' 
                ? 'There are no active deals at the moment. Check back later!'
                : 'No deals found.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {deals.map((deal) => {
              const isActive = isDealActive(deal)
              
              return (
                <div
                  key={deal.id}
                  className={`bg-gray-900 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    isActive ? 'border-yellow-500' : 'border-gray-700 opacity-60'
                  }`}
                >
                  {/* Deal Image */}
                  {deal.image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={deal.image}
                        alt={deal.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Deal Content */}
                  <div className="p-6">
                    {/* Deal Header */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-white">{deal.title}</h3>
                      <span
                        className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          isActive
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {isActive ? getTimeRemaining(deal.validTo) : 'Expired'}
                      </span>
                    </div>

                    {/* Discount Badge */}
                    <div className="flex items-center mb-3">
                      <span
                        className={`flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          deal.discountType === 'PERCENTAGE'
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        {deal.discountType === 'PERCENTAGE' ? (
                          <Percent className="w-3 h-3 mr-1" />
                        ) : (
                          <DollarSign className="w-3 h-3 mr-1" />
                        )}
                        {deal.discount}
                        {deal.discountType === 'PERCENTAGE' ? '% OFF' : ' OFF'}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 mb-4 line-clamp-2">{deal.description}</p>

                    {/* Minimum Order Amount */}
                    {deal.minOrderAmount && (
                      <div className="flex items-center text-sm text-gray-400 mb-3">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Min. order: ${deal.minOrderAmount}
                      </div>
                    )}

                    {/* Validity Period */}
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(deal.validFrom)} - {formatDate(deal.validTo)}
                      </div>
                    </div>

                    {/* Apply Deal Button */}
                    {isActive && (
                      <button
                        onClick={() => {
                          // Navigate to menu page or apply deal logic
                          window.location.href = '/menu'
                        }}
                        className="w-full mt-4 bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        Apply This Deal
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}