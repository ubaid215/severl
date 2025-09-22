'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Filter,
  ChefHat,
  ArrowLeft
} from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  image: string;
  isActive: boolean;
}

export default function MenuPage() {
  const router = useRouter();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  useEffect(() => {
    fetchFoodItems();
    fetchCategories();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/food-items', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setFoodItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/food-items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setFoodItems(foodItems.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting food item:', error);
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/food-items/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setFoodItems(foodItems.map(item =>
          item.id === id ? { ...item, isAvailable: !currentStatus } : item
        ));
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category.id === selectedCategory;
    const matchesAvailability = availabilityFilter === 'all' || 
                              (availabilityFilter === 'available' && item.isAvailable) ||
                              (availabilityFilter === 'unavailable' && !item.isAvailable);
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center text-yellow-500 mr-4 hover:text-yellow-400"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-yellow-500">Menu Management</h1>
          </div>
          <button
            onClick={() => router.push('/admin/menu/add')}
            className="flex items-center bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Food Item
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute cursor-pointer left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border-2 cursor-pointer border-yellow-500 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-800 border-2 cursor-pointer border-yellow-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="bg-gray-800 border-2 cursor-pointer border-yellow-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        {/* Food Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-gray-900 border-2 rounded-lg overflow-hidden border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20 transition-all">
              {/* Image */}
              <div className="relative h-48 bg-gray-800">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ChefHat size={48} className="text-gray-600" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => toggleAvailability(item.id, item.isAvailable)}
                    className={`p-2 rounded-full ${
                      item.isAvailable 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {item.isAvailable ? (
                      <Eye size={16} className="text-white" />
                    ) : (
                      <EyeOff size={16} className="text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-white truncate">{item.name}</h3>
                  <span className="text-yellow-500 font-bold">${item.price}</span>
                </div>
                
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                    {item.category.name}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/admin/menu/edit/${item.id}`)}
                      className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Edit size={16} className="text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <ChefHat size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No food items found</p>
            <button
              onClick={() => router.push('/admin/menu/add')}
              className="mt-4 bg-yellow-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Add Your First Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}