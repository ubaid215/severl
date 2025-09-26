// app/admin/orders/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Minus, 
  Search, 
  X, 
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Mail,
  ShoppingCart,
  Package,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: {
    name: string;
  };
}

interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  price: number;
  total: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function CreateOrderPage() {
  const router = useRouter();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'CREDIT_CARD' | 'DEBIT_CARD'>('CASH_ON_DELIVERY');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast functions
  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, message };
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Clear form function
  const clearForm = () => {
    setCart([]);
    setCustomerInfo({
      name: '',
      phone: '',
      email: '',
      address: ''
    });
    setNotes('');
    setPaymentMethod('CASH_ON_DELIVERY');
  };

  // Fetch food items and categories
  useEffect(() => {
    fetchFoodItems();
    fetchCategories();
  }, []);

  // Filter items based on search and category
  useEffect(() => {
    let filtered = foodItems;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category.name === selectedCategory);
    }
    
    setFilteredItems(filtered);
  }, [foodItems, searchTerm, selectedCategory]);

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
      showToast('error', 'Failed to fetch food items');
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
        setCategories(data.data.map((cat: any) => cat.name));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('error', 'Failed to fetch categories');
    }
  };

  const addToCart = (foodItem: FoodItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.foodItem.id === foodItem.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.foodItem.id === foodItem.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price
              }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            foodItem,
            quantity: 1,
            price: foodItem.price,
            total: foodItem.price
          }
        ];
      }
    });
  };

  const updateQuantity = (foodItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(foodItemId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.foodItem.id === foodItemId
          ? {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.price
            }
          : item
      )
    );
  };

  const removeFromCart = (foodItemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.foodItem.id !== foodItemId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('admin_token');
      
      // Generate a unique session ID for this order
      const sessionId = `admin-${Date.now()}`;

      const orderData = {
        sessionId,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email || undefined,
        deliveryAddress: customerInfo.address,
        latitude: customerInfo.latitude,
        longitude: customerInfo.longitude,
        items: cart.map(item => ({
          foodItemId: item.foodItem.id,
          quantity: item.quantity
        })),
        paymentMethod,
        notes: notes || undefined
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        showToast('success', `Order created successfully! Order ID: ${result.data?.id || 'N/A'}`);
        clearForm(); // Clear the form after successful submission
      } else {
        const error = await response.json();
        showToast('error', `Error creating order: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('error', 'Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      customerInfo.name.trim() !== '' &&
      customerInfo.phone.trim() !== '' &&
      customerInfo.address.trim() !== '' &&
      cart.length > 0
    );
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
      <div className="max-w-7xl mx-auto">
        {/* Toast Container */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center p-4 rounded-lg shadow-lg min-w-80 animate-slide-in-right ${
                toast.type === 'success' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-600 text-white'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              )}
              <span className="flex-grow">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 p-1 hover:bg-black/20 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/admin/orders')}
              className="flex items-center text-yellow-500 mr-4 hover:text-yellow-400"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-500">
              Create New Order
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-900 px-4 py-2 rounded-lg">
              <ShoppingCart size={20} className="text-yellow-500 mr-2" />
              <span className="text-white font-semibold">{getTotalItems()} items</span>
            </div>
            <div className="flex items-center bg-yellow-500 px-4 py-2 rounded-lg">
              <span className="text-black font-bold">Rs {getCartTotal().toLocaleString('en-PK')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Food Items */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">Menu Items</h2>
              
              {/* Search and Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Food Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-yellow-500 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <span className="text-yellow-400 font-bold">Rs {item.price}</span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                        {item.category.name}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-yellow-500 text-black px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center"
                      >
                        <Plus size={16} className="mr-1" />
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Package size={48} className="mx-auto mb-2" />
                  No items found
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary and Customer Info */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
                <User size={20} className="mr-2" />
                Customer Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="flex text-sm font-medium text-gray-300 mb-1 items-center">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({...prev, name: e.target.value}))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                
                <div>
                  <label className="flex text-sm font-medium text-gray-300 mb-1 items-center">
                    <Phone size={16} className="mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({...prev, phone: e.target.value}))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="0300-1234567"
                    required
                  />
                </div>
                
                <div>
                  <label className="flex text-sm font-medium text-gray-300 mb-1 items-center">
                    <Mail size={16} className="mr-1" />
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({...prev, email: e.target.value}))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="customer@example.com"
                  />
                </div>
                
                <div>
                  <label className="flex text-sm font-medium text-gray-300 mb-1 items-center">
                    <MapPin size={16} className="mr-1" />
                    Delivery Address *
                  </label>
                  <textarea
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({...prev, address: e.target.value}))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Enter complete delivery address"
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">Order Summary</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  <ShoppingCart size={32} className="mx-auto mb-2" />
                  No items added yet
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.foodItem.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{item.foodItem.name}</h4>
                        <p className="text-sm text-gray-400">Rs {item.price} each</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.foodItem.id, item.quantity - 1)}
                          className="bg-gray-700 text-white p-1 rounded hover:bg-gray-600"
                        >
                          <Minus size={16} />
                        </button>
                        
                        <span className="font-semibold text-white min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.foodItem.id, item.quantity + 1)}
                          className="bg-gray-700 text-white p-1 rounded hover:bg-gray-600"
                        >
                          <Plus size={16} />
                        </button>
                        
                        <span className="font-bold text-yellow-400 min-w-[60px] text-right">
                          Rs {item.total}
                        </span>
                        
                        <button
                          onClick={() => removeFromCart(item.foodItem.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-700 pt-3 mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Subtotal:</span>
                      <span className="text-white font-semibold">Rs {getCartTotal()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Delivery Charges:</span>
                      <span className="text-white font-semibold">
                        {getCartTotal() > 0 ? 'Calculated at checkout' : 'Rs 0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold border-t border-gray-600 pt-2">
                      <span className="text-yellow-400">Total:</span>
                      <span className="text-yellow-400">Rs {getCartTotal()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment and Notes */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="mb-4">
                <label className="flex text-sm font-medium text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                </select>
              </div>
              
              <div>
                <label className="flex text-sm font-medium text-gray-300 mb-2">
                  Order Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Special instructions, allergies, etc."
                  rows={3}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!isFormValid() || submitting}
              className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${
                isFormValid() && !submitting
                  ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Creating Order...' : `Create Order - Rs ${getCartTotal()}`}
            </button>
          </div>
        </div>
      </div>

      {/* Custom CSS for toast animation */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}