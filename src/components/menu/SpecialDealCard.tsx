// components/menu/SpecialDealCard.tsx
'use client'

import { Tag, Clock, Calendar, Percent, DollarSign } from 'lucide-react'

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

interface SpecialDealCardProps {
  deal: SpecialDeal
}

export default function SpecialDealCard({ deal }: SpecialDealCardProps) {
  const isDealActive = () => {
    const now = new Date()
    const validFrom = new Date(deal.validFrom)
    const validTo = new Date(deal.validTo)
    return deal.isActive && now >= validFrom && now <= validTo
  }

  const getTimeRemaining = () => {
    const now = new Date()
    const end = new Date(deal.validTo)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-gradient-to-br from-yellow-500/10 to-red-500/10 border-2 border-yellow-500/30 rounded-lg p-4 hover:border-yellow-500 transition-all">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-yellow-500" />
          <h3 className="font-bold text-white text-lg">{deal.title}</h3>
        </div>
        <span className="flex items-center px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded">
          {deal.discountType === 'PERCENTAGE' ? (
            <Percent className="w-3 h-3 mr-1" />
          ) : (
            <DollarSign className="w-3 h-3 mr-1" />
          )}
          {deal.discount}
          {deal.discountType === 'PERCENTAGE' ? '%' : ''}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{deal.description}</p>

      {/* Minimum Order */}
      {deal.minOrderAmount && (
        <div className="flex items-center text-xs text-gray-400 mb-2">
          <DollarSign className="w-3 h-3 mr-1" />
          Min. order: ${deal.minOrderAmount}
        </div>
      )}

      {/* Validity */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(deal.validFrom)} - {formatDate(deal.validTo)}
        </div>
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {getTimeRemaining()}
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => {
          // Navigate to menu or apply deal
          window.location.href = '/menu'
        }}
        className="w-full mt-3 bg-yellow-500 text-black text-sm font-semibold py-2 rounded hover:bg-yellow-600 transition-colors"
      >
        Use This Deal
      </button>
    </div>
  )
}