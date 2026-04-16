// app/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, User, CreditCard, Truck } from "lucide-react";

interface Variant {
  id: string;
  label: string;
  price: number;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
}

interface CartItem {
  id: string;
  foodItemId: string;
  variantId?: string;
  quantity: number;
  price: number;
  variant?: Variant;
  foodItem: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
}

interface CartSummary {
  items: CartItem[];
  subtotal: number;
  deliveryCharges: number;
  total: number;
  itemCount: number;
}

interface CheckoutForm {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  paymentMethod: "CASH_ON_DELIVERY" | "CREDIT_CARD" | "DEBIT_CARD" | "PAYPAL" | "STRIPE";
  notes: string;
}

export default function CheckoutPage() {
  const [cartData, setCartData] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false); 
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CheckoutForm>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    paymentMethod: "CASH_ON_DELIVERY",
    notes: ""
  });

  // Set mounted state on client only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize session ID - client only
  useEffect(() => {
    if (!mounted) return;
    
    let existingSessionId = localStorage.getItem("sessionId");
    if (!existingSessionId) {
      existingSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("sessionId", existingSessionId);
    }
    setSessionId(existingSessionId);
  }, [mounted]);

  // Fetch cart data - client only
  const fetchCart = async () => {
    if (!sessionId || !mounted) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/cart?sessionId=${sessionId}`);
      const data = await response.json();
      
      console.log('🔍 Full API Response:', data);
      
      if (data.success && data.data) {
        // Ensure items array exists
        const items = data.data.items || [];
        
        // Transform items to ensure each has correct price
        const transformedItems: CartItem[] = items.map((item: any) => {
          // Get the correct price: variant price is already in the item.price
          let itemPrice = item.price || item.variant?.price || item.foodItem?.price || 0;
          
          return {
            ...item,
            price: itemPrice
          };
        });
        
        // Calculate totals
        const subtotal = data.data.subtotal || transformedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryCharges = 0; 
        const total = subtotal + deliveryCharges;
        const itemCount = data.data.itemCount || transformedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartSummary: CartSummary = {
          items: transformedItems,
          subtotal: subtotal,
          deliveryCharges: deliveryCharges,
          total: total,
          itemCount: itemCount
        };
        
        console.log('📊 Final Cart Summary:', cartSummary);
        
        setCartData(cartSummary);
      } else {
        console.error('API returned success=false:', data);
        window.location.href = "/cart";
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCartData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId && mounted) {
      fetchCart();
    }
  }, [sessionId, mounted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!cartData || !sessionId) return;

  setSubmitting(true);

  try {
    // IMPORTANT: Ensure each item has the correct variant price
    const orderItems = cartData.items.map(item => {
      // Get the correct price from the variant or item
      const itemPrice = item.variant?.price || item.price || item.foodItem?.price || 0;
      
      return {
        foodItemId: item.foodItemId,
        variantId: item.variantId || undefined, // Include variant ID
        quantity: item.quantity,
        price: itemPrice, // Use the actual variant price
        total: itemPrice * item.quantity
      };
    });

    const orderData = {
      sessionId,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail || undefined,
      deliveryAddress: formData.deliveryAddress,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes || undefined,
      items: orderItems
    };

    console.log('📤 Submitting order with items:', orderItems); // Debug log

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (response.ok && result.order) {
      // Clear cart after successful order
      localStorage.removeItem("sessionId");
      window.location.href = `/checkout/success?orderNumber=${result.order.orderNumber}`;
    } else {
      throw new Error(result.error || "Failed to create order");
    }
  } catch (error) {
    console.error("Checkout error:", error);
    alert("Failed to place order. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  // Get display values with fallbacks
  const getSubtotal = () => cartData?.subtotal || 0;
  const getDeliveryCharges = () => cartData?.deliveryCharges || 0;
  const getTotal = () => cartData?.total || 0;
  const getItemCount = () => cartData?.itemCount || 0;

  const getItemDisplayName = (item: CartItem): string => {
    let name = item.foodItem?.name || "Unknown Item";
    if (item.variant?.label) {
      name += ` (${item.variant.label})`;
    } else if (item.variantId) {
      name += ` (Variant)`;
    }
    return name;
  };

  const getItemPrice = (item: CartItem): number => {
    return item.price || item.variant?.price || item.foodItem?.price || 0;
  };

  // Show loading state
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1C20] via-[#101828] to-[#1A1C20]">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#1A1C20]">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">No items in cart</h2>
          <Link href="/menu" className="text-yellow-500 hover:underline">
            Go back to menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1C20] via-[#090d15] to-[#1A1C20]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/cart"
            className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-yellow-500" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Checkout</h1>
            <p className="text-gray-400">Complete your order details</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6" id="checkout-form">
              {/* Customer Information */}
              <div className="bg-[#101828] rounded-xl border-2 border-yellow-500/20 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-yellow-500" />
                  Customer Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-black/30 border border-yellow-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-black/30 border border-yellow-500/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Email (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        className="w-full bg-black/30 border border-yellow-500/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-[#101828] rounded-xl border-2 border-yellow-500/20 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-yellow-500" />
                  Delivery Address
                </h2>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Complete Address *
                  </label>
                  <textarea
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full bg-black/30 border border-yellow-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none"
                    placeholder="House/Flat number, Street, Area, City"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-[#101828] rounded-xl border-2 border-yellow-500/20 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-yellow-500" />
                  Payment Method
                </h2>
                
                <div className="space-y-3">
                  {[
                    { value: "CASH_ON_DELIVERY", label: "Cash on Delivery", icon: "💵" }
                  ].map((method) => (
                    <label key={method.value} className="flex items-center p-3 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/5 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={formData.paymentMethod === method.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border-2 rounded-full mr-3 ${
                        formData.paymentMethod === method.value 
                          ? 'border-yellow-500 bg-yellow-500' 
                          : 'border-gray-500'
                      }`}>
                        {formData.paymentMethod === method.value && (
                          <div className="w-full h-full bg-yellow-500 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-lg mr-2">{method.icon}</span>
                      <span className="text-white">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-[#101828] rounded-xl border-2 border-yellow-500/20 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Order Notes (Optional)</h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-black/30 border border-yellow-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none"
                  placeholder="Any special instructions for your order..."
                />
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#101828] rounded-xl border-2 border-yellow-500/20 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-yellow-500" />
                Order Summary
              </h2>

              {/* Items with variant details */}
              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto custom-scrollbar">
                {cartData.items.map((item) => {
                  const itemPrice = getItemPrice(item);
                  const itemTotal = itemPrice * item.quantity;
                  const displayName = getItemDisplayName(item);
                  
                  return (
                    <div key={item.id} className="flex justify-between text-sm border-b border-yellow-500/10 pb-2">
                      <div className="flex-1">
                        <span className="text-gray-300">
                          {item.quantity}x
                        </span>
                        <span className="text-gray-300 ml-1">
                          {displayName}
                        </span>
                        {item.variant && (
                          <div className="text-[10px] text-yellow-500/70 mt-0.5">
                            Size: {item.variant.label} - ₨{item.variant.price}
                          </div>
                        )}
                      </div>
                      <span className="text-white font-medium ml-2">
                        ₨ {itemTotal.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {cartData.items.length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  No items in cart
                </div>
              )}

              <hr className="border-yellow-500/20 my-4" />

              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal ({getItemCount()} {getItemCount() === 1 ? 'item' : 'items'}):</span>
                  <span>₨ {getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Delivery Charges:</span>
                  <span>₨ {getDeliveryCharges().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white border-t border-yellow-500/20 pt-3 mt-2">
                  <span>Total:</span>
                  <span className="text-yellow-500 text-xl">₨ {getTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                form="checkout-form"
                disabled={submitting || !cartData}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black py-3 rounded-lg font-bold hover:from-yellow-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-95"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </span>
                ) : (
                  "Place Order"
                )}
              </button>

              <div className="mt-4 text-xs text-gray-400 text-center">
                By placing this order, you agree to our terms and conditions.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(234, 179, 8, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(234, 179, 8, 0.8);
        }
      `}</style>
    </div>
  );
}