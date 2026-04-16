'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Edit, Trash2, Eye, EyeOff, Search, ChefHat,
  X, Upload, Loader2, Check, AlertCircle, Tag,
  ToggleLeft, ToggleRight, Filter, ChevronDown
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  image: string;
  isActive: boolean;
  description?: string;
  sortOrder?: number;
  itemCount?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const api = async (url: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
  const res = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.headers ?? {}) },
  });
  return res.json();
};

// ─── Drawer ───────────────────────────────────────────────────────────────────

function Drawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-[#0f0f0f] border-l border-yellow-500/20 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {children}
      </div>
    </>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all animate-[slideUp_0.3s_ease] ${type === 'success' ? 'bg-[#0f0f0f] border-yellow-500/40 text-yellow-400' : 'bg-[#0f0f0f] border-red-500/40 text-red-400'}`}>
      {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

// ─── Custom Filter Dropdown ───────────────────────────────────────────────────

interface FilterOption {
  value: string;
  label: string;
}

interface CustomFilterDropdownProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  icon?: React.ReactNode;
}

function CustomFilterDropdown({ options, value, onChange, label, icon }: CustomFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full gap-2 bg-white/5 border border-white/10 hover:border-yellow-500/40 rounded-xl px-4 py-2.5 text-sm text-white transition-all"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-500">{icon}</span>}
          <span>{selectedOption.label}</span>
        </div>
        <ChevronDown size={14} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-10 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                option.value === value
                  ? 'bg-yellow-500/10 text-yellow-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {option.label}
              {option.value === value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Category Form Drawer ─────────────────────────────────────────────────────

function CategoryDrawer({
  open,
  onClose,
  editCategory,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editCategory: Category | null;
  onSaved: (category: Category, isNew: boolean) => void;
}) {
  const isEditing = !!editCategory;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setError('');
    setSaving(false);

    if (editCategory) {
      setName(editCategory.name);
      setDescription(editCategory.description || '');
      setIsActive(editCategory.isActive);
      if (editCategory.image) {
        setImagePreview(editCategory.image);
        setHasExistingImage(true);
      } else {
        setImagePreview('');
        setHasExistingImage(false);
      }
    } else {
      setName('');
      setDescription('');
      setIsActive(true);
      setImagePreview('');
      setHasExistingImage(false);
    }
    setSelectedFile(null);
  }, [open, editCategory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return; }
    const valid = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!valid.includes(file.type)) { setError('Use JPEG, PNG, or WebP'); return; }
    setSelectedFile(file);
    const r = new FileReader();
    r.onloadend = () => setImagePreview(r.result as string);
    r.readAsDataURL(file);
    setError('');
  };

  const removeImage = () => { setImagePreview(''); setSelectedFile(null); setHasExistingImage(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('description', description.trim());
      fd.append('isActive', isActive.toString());

      if (selectedFile) fd.append('image', selectedFile);
      if (hasExistingImage && !imagePreview && !selectedFile) fd.append('removeImage', 'true');

      const url = isEditing ? `/api/categories/${editCategory!.id}` : '/api/categories';
      const method = isEditing ? 'PUT' : 'POST';
      const data = await api(url, { method, body: fd });

      if (data.success) {
        onSaved(data.data, !isEditing);
        onClose();
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 focus:border-yellow-500/60 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none transition-colors';

  return (
    <Drawer open={open} onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/8 flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white">{isEditing ? 'Edit Category' : 'New Category'}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEditing ? `Editing "${editCategory?.name}"` : 'Add a new category to organize your menu'}
          </p>
        </div>
        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/8 rounded-lg transition-all">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {/* Image Upload */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Category Image</label>
          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden h-36">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-3 right-3 bg-black/70 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 hover:border-yellow-500/40 rounded-2xl bg-white/3 hover:bg-yellow-500/5 transition-all group"
            >
              <Upload size={24} className="text-gray-600 group-hover:text-yellow-500/60 mb-2 transition-colors" />
              <span className="text-sm text-gray-500 group-hover:text-gray-400">Click to upload</span>
              <span className="text-xs text-gray-600 mt-1">JPEG, PNG, WebP · max 5MB</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Category Name <span className="text-yellow-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Appetizers, Main Course, Desserts"
            className={inputCls}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this category..."
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Status Toggle */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setIsActive(!isActive)}
            className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-yellow-500' : 'bg-white/10'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isActive ? 'left-5' : 'left-0.5'}`} />
          </div>
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
            Category is active (visible in menu)
          </span>
        </label>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/8 flex items-center gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saving ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </Drawer>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <p className="text-white text-sm mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 bg-white/8 hover:bg-white/12 text-gray-300 rounded-xl text-sm font-medium transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl text-sm font-bold transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({
  category,
  onEdit,
  onDelete,
  onToggle,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="group bg-[#0f0f0f] border border-white/8 hover:border-yellow-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.08)]">
      {/* Image */}
      <div className="relative h-32 bg-white/3 overflow-hidden">
        {category.image ? (
          <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag size={32} className="text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${category.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {category.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Actions */}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onToggle}
            title={category.isActive ? 'Deactivate category' : 'Activate category'}
            className="p-1.5 bg-black/70 backdrop-blur-sm text-white rounded-lg hover:bg-yellow-500 hover:text-black transition-all"
          >
            {category.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 bg-black/70 backdrop-blur-sm text-white rounded-lg hover:bg-blue-500 transition-all"
          >
            <Edit size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 bg-black/70 backdrop-blur-sm text-white rounded-lg hover:bg-red-500 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-1">{category.name}</h3>
          {category.itemCount !== undefined && (
            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
              {category.itemCount} items
            </span>
          )}
        </div>

        {category.description && (
          <p className="text-gray-600 text-xs line-clamp-2">{category.description}</p>
        )}

        {!category.description && (
          <p className="text-gray-700 text-xs italic">No description</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  // Confirm delete
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  // Load categories with item counts
  useEffect(() => {
    Promise.all([
      api('/api/categories').then(d => d.success && setCategories(d.data)),
      api('/api/food-items').then(d => {
        if (d.success) {
          const items = d.data;
          const counts: Record<string, number> = {};
          items.forEach((item: any) => {
            counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
          });
          setCategories(prev => prev.map(cat => ({ ...cat, itemCount: counts[cat.id] || 0 })));
        }
      }),
    ]).finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setEditCategory(null); setDrawerOpen(true); };
  const openEdit = (category: Category) => { setEditCategory(category); setDrawerOpen(true); };

  const handleSaved = (category: Category, isNew: boolean) => {
    if (isNew) {
      setCategories(prev => [category, ...prev]);
      showToast(`Category "${category.name}" created 🎉`);
    } else {
      setCategories(prev => prev.map(c => c.id === category.id ? category : c));
      showToast(`Category "${category.name}" updated`);
    }
  };

  const handleToggle = async (category: Category) => {
    const data = await api(`/api/categories/${category.id}/toggle`, { method: 'PATCH' });
    if (data.success) {
      setCategories(prev => prev.map(c => c.id === category.id ? { ...c, isActive: data.data.isActive } : c));
      showToast(data.data.isActive ? `"${category.name}" is now active` : `"${category.name}" deactivated`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const data = await api(`/api/categories/${deleteTarget.id}`, { method: 'DELETE' });
    if (data.success) {
      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
      showToast(`Category "${deleteTarget.name}" deleted`, 'error');
    } else {
      showToast(data.error || 'Cannot delete category with existing items', 'error');
    }
    setDeleteTarget(null);
  };

  // Filter and sort
  const filtered = categories.filter(cat => {
    const matchesSearch = !searchTerm || cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && cat.isActive) || (statusFilter === 'inactive' && !cat.isActive);
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'itemCount') return (b.itemCount || 0) - (a.itemCount || 0);
    if (sortBy === 'newest') return (b.sortOrder || 0) - (a.sortOrder || 0);
    return 0;
  });

  // Filter options for custom dropdowns
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Sort by Name' },
    { value: 'itemCount', label: 'Sort by Item Count' },
    { value: 'newest', label: 'Sort by Newest' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="text-yellow-500 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Category Management</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {categories.length} categories · {categories.filter(c => c.isActive).length} active
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-yellow-500/20"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        {/* Filters - Custom Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={15} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/8 focus:border-yellow-500/40 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none transition-colors"
            />
          </div>

          <div className="w-40">
            <CustomFilterDropdown
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              icon={<Filter size={12} />}
            />
          </div>

          <div className="w-44">
            <CustomFilterDropdown
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
            />
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 text-xs text-gray-600">
          <span>{sorted.length} categories shown</span>
          <span>·</span>
          <span>{categories.filter(c => c.isActive).length} active</span>
          <span>·</span>
          <span>{categories.reduce((sum, c) => sum + (c.itemCount || 0), 0)} total items</span>
        </div>

        {/* Grid */}
        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sorted.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={() => openEdit(category)}
                onDelete={() => setDeleteTarget(category)}
                onToggle={() => handleToggle(category)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Tag size={48} className="text-white/10 mx-auto mb-4" />
            <p className="text-gray-500">No categories found</p>
            {!searchTerm && (
              <button onClick={openAdd} className="mt-4 text-yellow-500 hover:text-yellow-400 text-sm transition-colors">
                + Add your first category
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Drawer */}
      <CategoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editCategory={editCategory}
        onSaved={handleSaved}
      />

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.name}"? ${deleteTarget.itemCount && deleteTarget.itemCount > 0 ? `It contains ${deleteTarget.itemCount} items. ` : ''}This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}