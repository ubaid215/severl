'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, X, FolderOpen } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  image: string;
  isActive: boolean;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    image: '',
  });

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/categories/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        const category = data.data;
        setFormData({
          name: category.name,
          image: category.image || '',
        });
        if (category.image) {
          setImagePreview(category.image);
        }
      } else {
        setError('Failed to load category');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      setError('Failed to load category');
    } finally {
      setLoading(false);
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
      if (!formData.name) {
        setError('Category name is required');
        setSaving(false);
        return;
      }

      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/categories');
      } else {
        setError(data.error || 'Failed to update category');
      }
    } catch (err) {
      setError('An error occurred while updating the category');
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
          <h1 className="text-3xl font-bold text-yellow-500">Edit Category</h1>
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
            <label className="block text-sm font-medium mb-2">Category Image</label>
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
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Category Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/categories')}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Updating...' : 'Update Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}