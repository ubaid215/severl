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
  FolderOpen,
  ArrowLeft
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  image: string;
  isActive: boolean;
  foodItems: Array<{ id: string }>;
  createdAt: Date;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchCategories();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also make all its food items unavailable.`)) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== id));
      } else {
        alert(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/categories/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setCategories(categories.map(cat =>
          cat.id === id ? { ...cat, isActive: !currentStatus } : cat
        ));
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && category.isActive) ||
                         (statusFilter === 'inactive' && !category.isActive);
    
    return matchesSearch && matchesStatus;
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center text-yellow-500 mr-4 hover:text-yellow-400"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-yellow-500">Categories</h1>
          </div>
          <button
            onClick={() => router.push('/admin/categories/add')}
            className="flex items-center bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Category
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(category => (
            <div 
              key={category.id} 
              className="bg-gray-900 border-2 rounded-lg overflow-hidden border-yellow-500 shadow-lg hover:shadow-yellow-50 transition-all"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-800">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen size={48} className="text-gray-600" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => toggleStatus(category.id, category.isActive)}
                    className={`p-2 rounded-full ${
                      category.isActive 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {category.isActive ? (
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
                  <h3 className="font-semibold text-lg text-white truncate">{category.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    category.isActive 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>{category.foodItems?.length || 0} food items</span>
                  <span>{new Date(category.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/admin/categories/edit/${category.id}`)}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors border border-blue-600 flex items-center justify-center"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors border border-red-600 flex items-center justify-center"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No categories found</p>
            <button
              onClick={() => router.push('/admin/categories/add')}
              className="mt-4 bg-yellow-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Add Your First Category
            </button>
          </div>
        )}
      </div>
    </div>
  );
}