'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Percent, 
  DollarSign, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

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
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/special-deals')
      const data = await response.json()
      
      if (data.success) {
        setDeals(data.data)
      } else {
        setError('Failed to fetch deals')
      }
    } catch (err) {
      setError('Error fetching deals')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

 const token = localStorage.getItem("admin_token");

const handleDelete = async (id: string) => {
  try {
    const response = await fetch(`/api/special-deals/${id}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (response.ok) {
      setDeals(deals.filter(deal => deal.id !== id));
      setDeleteConfirm(null);
    } else {
      setError('Failed to delete deal');
    }
  } catch (err) {
    setError('Error deleting deal');
    console.error(err);
  }
};

const toggleStatus = async (id: string) => {
  try {
    const response = await fetch(`/api/special-deals/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (response.ok) {
      fetchDeals(); // Refresh the list
    } else {
      setError('Failed to update status');
    }
  } catch (err) {
    setError('Error updating status');
    console.error(err);
  }
};


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isExpired = (validTo: string) => {
    return new Date(validTo) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500">Special Deals</h1>
          <Link 
            href="/admin/special-deals/add"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add New Deal
          </Link>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        {deals.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No special deals found</p>
            <Link 
              href="/special-deals/add"
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg"
            >
              Create Your First Deal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <div 
                key={deal.id} 
                className={`bg-gray-900 rounded-lg overflow-hidden border-2 ${
                  deal.isActive ? 'border-yellow-500' : 'border-gray-700'
                }`}
              >
                {deal.image && (
                  <img 
                    src={deal.image} 
                    alt={deal.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-yellow-500">{deal.title}</h3>
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleStatus(deal.id)}
                        className={`p-1 rounded-full mr-2 ${
                          deal.isActive ? 'bg-green-500' : 'bg-gray-700'
                        }`}
                      >
                        {deal.isActive ? (
                          <CheckCircle size={16} className="text-white" />
                        ) : (
                          <XCircle size={16} className="text-white" />
                        )}
                      </button>
                      <Link
                        href={`/admin/special-deals/edit/${deal.id}`}
                        className="text-yellow-500 hover:text-yellow-400 p-1"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(deal.id)}
                        className="text-red-500 hover:text-red-400 p-1 ml-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{deal.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center text-sm">
                      {deal.discountType === 'PERCENTAGE' ? (
                        <Percent size={16} className="text-yellow-500 mr-1" />
                      ) : (
                        <DollarSign size={16} className="text-yellow-500 mr-1" />
                      )}
                      <span>{deal.discount}{deal.discountType === 'PERCENTAGE' ? '%' : ''} off</span>
                    </div>
                    
                    {deal.minOrderAmount && (
                      <div className="flex items-center text-sm">
                        <DollarSign size={16} className="text-yellow-500 mr-1" />
                        <span>Min: Rs {deal.minOrderAmount}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <Calendar size={16} className="mr-1" />
                    <span>{formatDate(deal.validFrom)} - {formatDate(deal.validTo)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className={`flex items-center text-sm ${
                      isExpired(deal.validTo) ? 'text-red-500' : 'text-green-500'
                    }`}>
                      <Clock size={16} className="mr-1" />
                      <span>{isExpired(deal.validTo) ? 'Expired' : 'Active'}</span>
                    </div>
                    
                    <span className={`px-2 py-1 rounded text-xs cursor-pointer ${
                      deal.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {deal.isActive ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                
                {deleteConfirm === deal.id && (
                  <div className="p-4 bg-gray-800 border-t border-gray-700">
                    <p className="text-sm mb-2">Are you sure you want to delete this deal?</p>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1 text-sm bg-gray-700 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(deal.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}