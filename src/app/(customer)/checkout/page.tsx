// app/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, User, CreditCard, Truck } from "lucide-react";
import Navigation from "@/components/layout/Navigation";

interface CartItem {
  id: string;
  foodItemId: string;
  quantity: number;
  foodItem: {
    id: string;
    name: string;
    price: number;
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
  const [sessionId, setSessionId] = useState<string>("");
  const [formData, setFormData] = useState<CheckoutForm>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    paymentMethod: "CASH_ON_DELIVERY",
    notes: ""
  });

  // Initialize session ID
  useEffect(() => {
    let existingSessionId = localStorage.getItem("sessionId");
    if (!existingSessionId) {
      existingSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("sessionId", existingSessionId);
    }
    setSessionId(existingSessionId);
  }, []);

  // Fetch cart data
  const fetchCart = async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/cart?sessionId=${sessionId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setCartData(data.data);
      } else {
        // Redirect to cart if no items
        window.location.href = "/cart";
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchCart();
    }
  }, [sessionId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartData || !sessionId) return;

    setSubmitting(true);

    try {
      const orderData = {
        sessionId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        deliveryAddress: formData.deliveryAddress,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || undefined,
        items: cartData.items.map(item => ({
          foodItemId: item.foodItemId,
          quantity: item.quantity
        }))
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok && result.order) {
        // Redirect to success page with order number
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#101828] to-gray-900">
        <Navigation />
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#101828] to-gray-900">
        <Navigation />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#101828] to-gray-900">
      <Navigation />
      
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
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    { value: "CASH_ON_DELIVERY", label: "Cash on Delivery", icon: "💵" },
                    { value: "CREDIT_CARD", label: "Credit Card", icon: "💳" },
                    { value: "DEBIT_CARD", label: "Debit Card", icon: "💳" },
                    { value: "PAYPAL", label: "PayPal", icon: "🅿️" },
                    { value: "STRIPE", label: "Stripe", icon: "💳" }
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

              {/* Items */}
              <div className="space-y-3 mb-4">
                {cartData.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      {item.quantity}x {item.foodItem.name}
                    </span>
                    <span className="text-white">
                      Rs {(item.foodItem.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-yellow-500/20 mb-4" />

              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span>Rs {cartData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Delivery:</span>
                  <span>Rs {cartData.deliveryCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white border-t border-yellow-500/20 pt-2">
                  <span>Total:</span>
                  <span className="text-yellow-500">Rs {cartData.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                form="checkout-form"
                disabled={submitting}
                onClick={handleSubmit}
                className="w-full bg-yellow-500 text-black py-3 rounded-lg font-bold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Placing Order..." : "Place Order"}
              </button>

              <div className="mt-4 text-xs text-gray-400 text-center">
                By placing this order, you agree to our terms and conditions.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}