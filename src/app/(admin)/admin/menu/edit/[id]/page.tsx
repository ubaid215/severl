'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ChefHat, Upload, X } from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  isAvailable: boolean;
}

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

export default function EditFoodItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    categoryId: '',
    isAvailable: true,
  });

  useEffect(() => {
    if (id) {
      fetchFoodItem();
      fetchCategories();
    }
  }, [id]);

  const fetchFoodItem = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/food-items/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        const item = data.data;
        setFormData({
          name: item.name,
          description: item.description || '',
          price: item.price.toString(),
          image: item.image || '',
          categoryId: item.categoryId,
          isAvailable: item.isAvailable,
        });
        if (item.image) {
          setImagePreview(item.image);
        }
      }
    } catch (error) {
      console.error('Error fetching food item:', error);
      setError('Failed to load food item');
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
        setCategories(data.data.filter((cat: Category) => cat.isActive));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!formData.name || !formData.price || !formData.categoryId) {
        setError('Name, price, and category are required');
        setSaving(false);
        return;
      }

      if (parseFloat(formData.price) <= 0) {
        setError('Price must be greater than 0');
        setSaving(false);
        return;
      }

      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/food-items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/menu');
      } else {
        setError(data.error || 'Failed to update food item');
      }
    } catch (err) {
      setError('An error occurred while updating the food item');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-yellow-500 mr-4 hover:text-yellow-400"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-yellow-500">Edit Food Item</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg">
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Item Image</label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer bg-gray-800 hover:border-yellow-500 transition-colors">
                <Upload size={32} className="text-gray-400 mb-2" />
                <span className="text-gray-400">Click to upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Item Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                className="mr-2 rounded bg-gray-800 border-gray-700 text-yellow-500 focus:ring-yellow-500"
              />
              <span className="text-sm">Available for ordering</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/menu')}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Updating...' : 'Update Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}