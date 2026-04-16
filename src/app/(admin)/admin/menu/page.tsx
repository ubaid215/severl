"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  ChefHat,
  X,
  Upload,
  Loader2,
  Check,
  AlertCircle,
  Tag,
  Layers,
  Star,
  StarOff,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  GripVertical,
  Filter,
  ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Variant {
  id: string;
  label: string;
  price: number;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
}

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  categoryId: string;
  category: { id: string; name: string };
  variants: Variant[];
}

interface Category {
  id: string;
  name: string;
  image: string;
  isActive: boolean;
}

interface VariantDraft {
  id?: string; // present when editing existing
  label: string;
  price: string;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
  isNew?: boolean; // client-only flag
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const api = async (url: string, options: RequestInit = {}) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";
  const res = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.headers ?? {}) },
  });
  return res.json();
};

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
  placeholder?: string;
}

function CustomFilterDropdown({
  options,
  value,
  onChange,
  label,
  icon,
  placeholder,
}: CustomFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
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
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
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

function CategoryDropdown({
  value,
  onChange,
  categories,
}: {
  value: string;
  onChange: (value: string) => void;
  categories: Category[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedCategory = categories.find((c) => c.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-white/5 border border-white/10 hover:border-yellow-500/40 rounded-xl px-4 py-2.5 text-sm text-white transition-all"
      >
        <span>{selectedCategory?.name || "Select category"}</span>
        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                onChange(category.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                category.id === value
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function Drawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-[#0f0f0f] border-l border-yellow-500/20 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {children}
      </div>
    </>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({
  message,
  type,
  onDone,
}: {
  message: string;
  type: "success" | "error";
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all animate-[slideUp_0.3s_ease] ${type === "success" ? "bg-[#0f0f0f] border-yellow-500/40 text-yellow-400" : "bg-[#0f0f0f] border-red-500/40 text-red-400"}`}
    >
      {type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

// ─── Variant Editor ───────────────────────────────────────────────────────────

function VariantEditor({
  variants,
  onChange,
}: {
  variants: VariantDraft[];
  onChange: (v: VariantDraft[]) => void;
}) {
  const addVariant = () => {
    onChange([
      ...variants,
      {
        label: "",
        price: "",
        isDefault: variants.length === 0,
        sortOrder: variants.length,
        isActive: true,
        isNew: true,
      },
    ]);
  };

  const update = (i: number, patch: Partial<VariantDraft>) => {
    const next = variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v));
    // Only one default at a time
    if (patch.isDefault) {
      onChange(next.map((v, idx) => ({ ...v, isDefault: idx === i })));
    } else {
      onChange(next);
    }
  };

  const remove = (i: number) =>
    onChange(variants.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
          <Layers size={13} />
          Variants / Sizes
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 border border-yellow-500/30 hover:border-yellow-500/60 px-3 py-1.5 rounded-lg transition-all"
        >
          <Plus size={13} />
          Add Variant
        </button>
      </div>

      {variants.length === 0 && (
        <p className="text-xs text-gray-600 italic py-2">
          No variants — item uses a single base price. Add variants for
          size/portion options.
        </p>
      )}

      {variants.map((v, i) => (
        <div
          key={i}
          className={`rounded-xl border p-3 space-y-2 transition-all ${v.isDefault ? "border-yellow-500/50 bg-yellow-500/5" : "border-white/8 bg-white/3"}`}
        >
          <div className="flex items-center gap-2">
            <GripVertical size={14} className="text-gray-600 flex-shrink-0" />
            <input
              type="text"
              value={v.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="e.g. Small, Medium, Large"
              className="flex-1 bg-transparent border-b border-white/10 focus:border-yellow-500/60 pb-0.5 text-sm text-white placeholder-gray-600 outline-none transition-colors"
            />
            <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
              {/* Default star */}
              <button
                type="button"
                onClick={() => update(i, { isDefault: !v.isDefault })}
                title={v.isDefault ? "Default variant" : "Set as default"}
                className={`p-1 rounded transition-colors ${v.isDefault ? "text-yellow-400" : "text-gray-600 hover:text-gray-400"}`}
              >
                {v.isDefault ? (
                  <Star size={14} fill="currentColor" />
                ) : (
                  <StarOff size={14} />
                )}
              </button>
              {/* Active toggle */}
              <button
                type="button"
                onClick={() => update(i, { isActive: !v.isActive })}
                title={v.isActive ? "Active" : "Inactive"}
                className={`p-1 rounded transition-colors ${v.isActive ? "text-green-400" : "text-gray-600"}`}
              >
                {v.isActive ? (
                  <ToggleRight size={16} />
                ) : (
                  <ToggleLeft size={16} />
                )}
              </button>
              {/* Remove */}
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1 text-red-400/60 hover:text-red-400 rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pl-6">
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-gray-500 text-xs">Rs.</span>
              <input
                type="number"
                step="1"
                min="0"
                value={v.price}
                onChange={(e) => update(i, { price: e.target.value })}
                placeholder="Price"
                className="w-28 bg-transparent border-b border-white/10 focus:border-yellow-500/60 pb-0.5 text-sm text-white placeholder-gray-600 outline-none transition-colors"
              />
            </div>
            {v.isDefault && (
              <span className="text-[10px] text-yellow-500/70 font-medium uppercase tracking-widest">
                Default
              </span>
            )}
            {!v.isActive && (
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                Inactive
              </span>
            )}
          </div>
        </div>
      ))}

      {variants.length > 0 && (
        <p className="text-[10px] text-gray-600">
          ⭐ The default variant's price sets the item base price. Customers
          must select a variant when ordering.
        </p>
      )}
    </div>
  );
}

// ─── Food Item Form Drawer ────────────────────────────────────────────────────

function FoodItemDrawer({
  open,
  onClose,
  editItem,
  categories,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editItem: FoodItem | null;
  categories: Category[];
  onSaved: (item: FoodItem, isNew: boolean) => void;
}) {
  const isEditing = !!editItem;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    isAvailable: true,
  });
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Reset / populate form when drawer opens
  useEffect(() => {
    if (!open) return;
    setError("");
    setSaving(false);

    if (editItem) {
      setFormData({
        name: editItem.name,
        description: editItem.description || "",
        price: editItem.price.toString(),
        categoryId: editItem.categoryId,
        isAvailable: editItem.isAvailable,
      });
      setVariants(
        (editItem.variants || []).map((v) => ({
          id: v.id,
          label: v.label,
          price: v.price.toString(),
          isDefault: v.isDefault,
          sortOrder: v.sortOrder,
          isActive: v.isActive,
        })),
      );
      if (editItem.image) {
        setImagePreview(editItem.image);
        setHasExistingImage(true);
      } else {
        setImagePreview("");
        setHasExistingImage(false);
      }
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        isAvailable: true,
      });
      setVariants([]);
      setImagePreview("");
      setHasExistingImage(false);
    }
    setSelectedFile(null);
  }, [open, editItem]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    const valid = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!valid.includes(file.type)) {
      setError("Use JPEG, PNG, or WebP");
      return;
    }
    setSelectedFile(file);
    const r = new FileReader();
    r.onloadend = () => setImagePreview(r.result as string);
    r.readAsDataURL(file);
    setError("");
  };

  const removeImage = () => {
    setImagePreview("");
    setSelectedFile(null);
    setHasExistingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name.trim() || !formData.categoryId) {
      setError("Name and category are required");
      return;
    }
    const hasVariants = variants.length > 0;
    if (!hasVariants && (!formData.price || parseFloat(formData.price) <= 0)) {
      setError("Price is required when no variants are set");
      return;
    }
    for (const v of variants) {
      if (!v.label.trim()) {
        setError("All variant labels are required");
        return;
      }
      if (!v.price || parseFloat(v.price) <= 0) {
        setError(`Price required for variant "${v.label || "?"}"`);
        return;
      }
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name.trim());
      fd.append("description", formData.description.trim());
      fd.append("categoryId", formData.categoryId);
      fd.append("isAvailable", formData.isAvailable.toString());

      // Variants or price
      if (hasVariants) {
        const variantPayload = variants.map((v, i) => ({
          label: v.label.trim(),
          price: parseFloat(v.price),
          isDefault: v.isDefault,
          sortOrder: i,
          isActive: v.isActive,
        }));
        fd.append("variants", JSON.stringify(variantPayload));
        // base price taken from default variant on server side
        const def = variants.find((v) => v.isDefault) ?? variants[0];
        fd.append("price", def.price);
      } else {
        fd.append("price", formData.price);
      }

      if (selectedFile) fd.append("image", selectedFile);
      if (hasExistingImage && !imagePreview && !selectedFile)
        fd.append("removeImage", "true");

      const url = isEditing
        ? `/api/food-items/${editItem!.id}`
        : "/api/food-items";
      const method = isEditing ? "PUT" : "POST";
      const data = await api(url, { method, body: fd });

      if (data.success) {
        onSaved(data.data, !isEditing);
        onClose();
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    required = false,
    children: React.ReactNode,
  ) => (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
        {label}
        {required && <span className="text-yellow-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );

  const inputCls =
    "w-full bg-white/5 border border-white/10 focus:border-yellow-500/60 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none transition-colors";

  return (
    <Drawer open={open} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/8 flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white">
            {isEditing ? "Edit Food Item" : "New Food Item"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEditing
              ? `Editing "${editItem?.name}"`
              : "Add a new item to the menu"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-white hover:bg-white/8 rounded-lg transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {/* Image */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Image
          </label>
          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden h-44">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
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
              className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/10 hover:border-yellow-500/40 rounded-2xl bg-white/3 hover:bg-yellow-500/5 transition-all group"
            >
              <Upload
                size={24}
                className="text-gray-600 group-hover:text-yellow-500/60 mb-2 transition-colors"
              />
              <span className="text-sm text-gray-500 group-hover:text-gray-400">
                Click to upload
              </span>
              <span className="text-xs text-gray-600 mt-1">
                JPEG, PNG, WebP · max 5MB
              </span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Name */}
        {field(
          "Item Name",
          true,
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="e.g. Chicken Burger, Margherita Pizza"
            className={inputCls}
          />,
        )}

        {/* Description */}
        {field(
          "Description",
          false,
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Ingredients, special notes..."
            rows={3}
            className={`${inputCls} resize-none`}
          />,
        )}

        {/* Category + Base Price */}
        <div className="grid grid-cols-2 gap-4 ">
          {field(
            "Category",
            true,
            <CategoryDropdown
              value={formData.categoryId}
              onChange={(categoryId) =>
                setFormData((p) => ({ ...p, categoryId }))
              }
              categories={categories}
            />,
          )}
          {field(
            "Base Price",
            variants.length === 0,
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                Rs.
              </span>
              <input
                type="number"
                step="1"
                min="0"
                value={
                  variants.length > 0
                    ? (variants.find((v) => v.isDefault)?.price ??
                      variants[0]?.price ??
                      "")
                    : formData.price
                }
                onChange={(e) =>
                  setFormData((p) => ({ ...p, price: e.target.value }))
                }
                disabled={variants.length > 0}
                placeholder={variants.length > 0 ? "From variants" : "0"}
                className={`${inputCls} pl-10 disabled:opacity-40 disabled:cursor-not-allowed`}
              />
            </div>,
          )}
        </div>

        {/* Variants */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-4">
          <VariantEditor variants={variants} onChange={setVariants} />
        </div>

        {/* Availability */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() =>
              setFormData((p) => ({ ...p, isAvailable: !p.isAvailable }))
            }
            className={`relative w-10 h-5 rounded-full transition-colors ${formData.isAvailable ? "bg-yellow-500" : "bg-white/10"}`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${formData.isAvailable ? "left-5" : "left-0.5"}`}
            />
          </div>
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
            Available for ordering
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
          {saving ? "Saving..." : isEditing ? "Update Item" : "Create Item"}
        </button>
      </div>
    </Drawer>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <p className="text-white text-sm mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-white/8 hover:bg-white/12 text-gray-300 rounded-xl text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl text-sm font-bold transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Food Card ────────────────────────────────────────────────────────────────

function FoodCard({
  item,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: FoodItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const hasVariants = item.variants && item.variants.length > 0;

  return (
    <div className="group bg-[#0f0f0f] border border-white/8 hover:border-yellow-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.08)]">
      {/* Image */}
      <div className="relative h-40 bg-white/3 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat size={36} className="text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />

        {/* Availability badge */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${item.isAvailable ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
          >
            {item.isAvailable ? "Live" : "Hidden"}
          </span>
        </div>

        {/* Actions */}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onToggle}
            title={item.isAvailable ? "Hide item" : "Show item"}
            className="p-1.5 bg-black/70 backdrop-blur-sm text-white rounded-lg hover:bg-yellow-500 hover:text-black transition-all"
          >
            {item.isAvailable ? <EyeOff size={13} /> : <Eye size={13} />}
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
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-1">
            {item.name}
          </h3>
          <span className="text-yellow-400 font-bold text-sm whitespace-nowrap flex-shrink-0">
            Rs {item.price}
          </span>
        </div>

        {item.description && (
          <p className="text-gray-600 text-xs line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-full">
            <Tag size={9} />
            {item.category.name}
          </span>

          {hasVariants && (
            <span className="inline-flex items-center gap-1 text-[10px] text-yellow-500/70 bg-yellow-500/10 px-2 py-1 rounded-full">
              <Layers size={9} />
              {item.variants.length} sizes
            </span>
          )}
        </div>

        {/* Variant pills */}
        {hasVariants && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {item.variants.slice(0, 4).map((v) => (
              <span
                key={v.id}
                className={`text-[10px] px-2 py-0.5 rounded-full border ${v.isDefault ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" : "border-white/8 bg-white/5 text-gray-500"}`}
              >
                {v.label} · Rs{v.price}
              </span>
            ))}
            {item.variants.length > 4 && (
              <span className="text-[10px] text-gray-600 px-1 py-0.5">
                +{item.variants.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MenuPage() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<FoodItem | null>(null);

  // Confirm delete
  const [deleteTarget, setDeleteTarget] = useState<FoodItem | null>(null);

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
    },
    [],
  );

  useEffect(() => {
    Promise.all([
      api("/api/food-items").then((d) => d.success && setFoodItems(d.data)),
      api("/api/categories").then((d) => d.success && setCategories(d.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditItem(null);
    setDrawerOpen(true);
  };
  const openEdit = (item: FoodItem) => {
    setEditItem(item);
    setDrawerOpen(true);
  };

  const handleSaved = (item: FoodItem, isNew: boolean) => {
    if (isNew) {
      setFoodItems((prev) => [item, ...prev]);
      showToast(`"${item.name}" added to menu 🎉`);
    } else {
      setFoodItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
      showToast(`"${item.name}" updated`);
    }
  };

  const handleToggle = async (item: FoodItem) => {
    const data = await api(`/api/food-items/${item.id}/toggle`, {
      method: "PATCH",
    });
    if (data.success) {
      setFoodItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, isAvailable: data.data.isAvailable } : i,
        ),
      );
      showToast(
        data.data.isAvailable
          ? `"${item.name}" is now visible`
          : `"${item.name}" hidden from menu`,
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const data = await api(`/api/food-items/${deleteTarget.id}`, {
      method: "DELETE",
    });
    if (data.success) {
      setFoodItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      showToast(`"${deleteTarget.name}" deleted`, "error");
    }
    setDeleteTarget(null);
  };

  // Filter options for custom dropdowns
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories
      .filter((c) => c.isActive)
      .map((c) => ({ value: c.id, label: c.name })),
  ];

  const availabilityOptions = [
    { value: "all", label: "All Status" },
    { value: "available", label: "Live" },
    { value: "unavailable", label: "Hidden" },
  ];

  const sortOptions = [
    { value: "name", label: "Sort by Name" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
  ];

  // Filter and sort items
  const filtered = foodItems.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q);
    const matchCat =
      selectedCategory === "all" || item.category.id === selectedCategory;
    const matchAvail =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && item.isAvailable) ||
      (availabilityFilter === "unavailable" && !item.isAvailable);
    return matchSearch && matchCat && matchAvail;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "newest")
      return (b as any).createdAt
        ? new Date((b as any).createdAt).getTime() -
            new Date((a as any).createdAt).getTime()
        : 0;
    return 0;
  });

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
            <h1 className="text-2xl font-bold text-white">Menu Management</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {foodItems.length} items · {categories.length} categories
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-yellow-500/20"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        {/* Filters - Custom Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"
              size={15}
            />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/8 focus:border-yellow-500/40 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none transition-colors"
            />
          </div>

          <div className="w-44">
            <CustomFilterDropdown
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              icon={<Tag size={12} />}
            />
          </div>

          <div className="w-36">
            <CustomFilterDropdown
              options={availabilityOptions}
              value={availabilityFilter}
              onChange={setAvailabilityFilter}
              icon={<Filter size={12} />}
            />
          </div>

          <div className="w-40">
            <CustomFilterDropdown
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
            />
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 text-xs text-gray-600">
          <span>{sorted.length} items shown</span>
          <span>·</span>
          <span>{foodItems.filter((i) => i.isAvailable).length} live</span>
          <span>·</span>
          <span>
            {foodItems.filter((i) => i.variants?.length > 0).length} with
            variants
          </span>
        </div>

        {/* Grid */}
        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sorted.map((item) => (
              <FoodCard
                key={item.id}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => setDeleteTarget(item)}
                onToggle={() => handleToggle(item)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <ChefHat size={48} className="text-white/10 mx-auto mb-4" />
            <p className="text-gray-500">No items found</p>
            {!searchTerm && (
              <button
                onClick={openAdd}
                className="mt-4 text-yellow-500 hover:text-yellow-400 text-sm transition-colors"
              >
                + Add your first item
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Drawer */}
      <FoodItemDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editItem={editItem}
        categories={categories.filter((c) => c.isActive)}
        onSaved={handleSaved}
      />

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
