// components/admin/CategoryDrawer.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, X, FolderOpen } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  image: string;
  isActive: boolean;
}

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: Category | null;
}

export default function CategoryDrawer({ isOpen, onClose, onSuccess, category }: CategoryDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
  });

  const isEditing = !!category;

  useEffect(() => {
    if (isOpen && category) {
      // Populate form when editing
      setFormData({
        name: category.name,
      });
      if (category.image) {
        setImagePreview(category.image);
        setHasExistingImage(true);
      }
    } else if (isOpen && !category) {
      // Reset form when adding new
      setFormData({ name: '' });
      setImagePreview('');
      setSelectedFile(null);
      setHasExistingImage(false);
    }
  }, [isOpen, category]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Only JPG, JPEG, webp and PNG files are allowed');
        return;
      }

      setSelectedFile(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setSelectedFile(null);
    setHasExistingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name.trim()) {
        setError('Category name is required');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('admin_token');
      
      // Use FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }
      
      // If image was removed (no preview and no new file selected)
      if (isEditing && hasExistingImage && !imagePreview && !selectedFile) {
        formDataToSend.append('removeImage', 'true');
      }

      let response;
      if (isEditing) {
        response = await fetch(`/api/categories/${category.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataToSend,
        });
      } else {
        response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataToSend,
        });
      }

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || `Failed to ${isEditing ? 'update' : 'create'} category`);
      }
    } catch (err) {
      setError(`An error occurred while ${isEditing ? 'updating' : 'creating'} the category`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-all duration-300 z-50 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/95 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-yellow-500">
            {isEditing ? 'Edit Category' : 'Add Category'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            <X size={20} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 overflow-y-auto h-full pb-32">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="category-form">
            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Category Image
              </label>
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-all duration-200 transform hover:scale-110 opacity-90 group-hover:opacity-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer bg-gray-800/50 hover:border-yellow-500 transition-all duration-200 hover:bg-gray-800 group"
                >
                  <Upload size={32} className="text-gray-500 group-hover:text-yellow-500 transition-colors mb-2" />
                  <span className="text-gray-400 group-hover:text-yellow-400 transition-colors">
                    Click to upload image
                  </span>
                  <span className="text-gray-600 text-sm mt-1">
                    PNG, JPG, JPEG up to 5MB
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
              {isEditing && hasExistingImage && imagePreview && (
                <p className="text-sm text-gray-500 mt-2">
                  Click the ✕ to remove the current image
                </p>
              )}
            </div>

            {/* Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Category Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                placeholder="e.g., Appetizers, Main Course, Desserts"
                autoFocus
              />
            </div>
          </form>
        </div>

        {/* Drawer Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-800">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="category-form"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                isEditing ? 'Update Category' : 'Create Category'
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
}