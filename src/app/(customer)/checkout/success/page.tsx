// app/checkout/success/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle, Package, Clock, MapPin, Phone, Download, Share, Tag, Zap 
} from "lucide-react";

interface Variant {
  id: string;
  label: string;
  price: number;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  variantId?: string;
  variant?: Variant;
  foodItem: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  deliveryCharges: number;
  total: number;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState<string>("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderNum = urlParams.get("orderNumber");
    
    if (orderNum) {
      setOrderNumber(orderNum);
      fetchOrder(orderNum);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchOrder = async (orderNum: string) => {
    try {
      const response = await fetch(`/api/orders/number/${orderNum}`);
      const data = await response.json();
      
      if (response.ok && data.order) {
        console.log('📦 Order data:', data.order);
        setOrder(data.order);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  const getItemDisplayName = (item: OrderItem): string => {
    let name = item.foodItem.name;
    if (item.variant?.label) {
      name += ` (${item.variant.label})`;
    } else if (item.variantId) {
      name += ` (Selected Variant)`;
    }
    return name;
  };

  const getItemPrice = (item: OrderItem): number => {
    // Use the item's price (which should be the variant price) or fallback to foodItem price
    return item.price || item.foodItem?.price || 0;
  };

  const generateWhatsAppText = () => {
    if (!order) return "";
    
    const message = `🍕 *Order Confirmation*

Order #${order.orderNumber}
Status: ${order.status}

👤 *Customer Details*
Name: ${order.customerName}
Phone: ${order.customerPhone}
Address: ${order.deliveryAddress}

📦 *Items Ordered*
${order.items.map(item => {
  const itemName = getItemDisplayName(item);
  const itemPrice = getItemPrice(item);
  const itemTotal = itemPrice * item.quantity;
  return `• ${item.quantity}x ${itemName} - Rs ${itemTotal}`;
}).join('\n')}

💰 *Bill Summary*
Subtotal: Rs ${order.subtotal}
Delivery: Rs ${order.deliveryCharges}
*Total: Rs ${order.total}*

Payment: ${order.paymentMethod}
${order.notes ? `\nNotes: ${order.notes}` : ''}

Thank you for your order! 🎉`;

    return encodeURIComponent(message);
  };

  const shareOnWhatsApp = () => {
    const text = generateWhatsAppText();
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const downloadReceipt = async () => {
    if (!order) return;
    
    try {
      const response = await fetch(`/api/orders/${order.id}/slip?format=text`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${order.orderNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download receipt:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1C20] via-[#101828] to-[#1A1C20]">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1C20] via-[#101828] to-[#1A1C20]">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Order Not Found</h2>
          <p className="text-gray-400 mb-6">Unable to find order details.</p>
          <Link 
            href="/menu"
            className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-6 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-amber-600 transition-all duration-200 transform hover:scale-105"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1C20] via-[#101828] to-[#1A1C20]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed! 🎉</h1>
          <p className="text-gray-400">Thank you for your order. We'll have it ready soon!</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#101828] rounded-xl border-2 border-yellow-500/20 p-6 mb-6 shadow-xl">
          {/* Order Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-yellow-500/20">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-yellow-500" />
                Order #{order.orderNumber}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                order.status === 'PENDING' 
                  ? 'bg-yellow-500/20 text-yellow-500 animate-pulse' 
                  : order.status === 'CONFIRMED'
                  ? 'bg-blue-500/20 text-blue-500'
                  : order.status === 'PREPARING'
                  ? 'bg-orange-500/20 text-orange-500'
                  : 'bg-green-500/20 text-green-500'
              }`}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800/30 rounded-lg p-3">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-yellow-500" />
                Contact Details
              </h3>
              <p className="text-gray-300 font-medium">{order.customerName}</p>
              <p className="text-gray-400 text-sm">{order.customerPhone}</p>
              {order.customerEmail && (
                <p className="text-gray-400 text-sm">{order.customerEmail}</p>
              )}
            </div>
            <div className="bg-gray-800/30 rounded-lg p-3">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-yellow-500" />
                Delivery Address
              </h3>
              <p className="text-gray-300 text-sm">{order.deliveryAddress}</p>
            </div>
          </div>

          {/* Items Ordered */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-yellow-500" />
              Items Ordered
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => {
                const itemPrice = getItemPrice(item);
                const itemTotal = itemPrice * item.quantity;
                const displayName = getItemDisplayName(item);
                const hasVariant = item.variant || item.variantId;
                
                return (
                  <div 
                    key={item.id || index} 
                    className="bg-gray-800/20 rounded-lg p-3 border border-yellow-500/10 hover:border-yellow-500/30 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-yellow-500 font-bold">{item.quantity}x</span>
                          <span className="text-white font-medium">{displayName}</span>
                          {hasVariant && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">
                              <Zap className="w-2.5 h-2.5" />
                              Variant
                            </span>
                          )}
                        </div>
                        {item.variant && (
                          <div className="text-xs text-gray-400 ml-6">
                            Size: {item.variant.label} • ₨{item.variant.price} each
                          </div>
                        )}
                        {!item.variant && item.variantId && (
                          <div className="text-xs text-gray-400 ml-6">
                            Special selection • ₨{itemPrice} each
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold">₨ {itemTotal.toFixed(2)}</span>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-gray-400">
                            (₨ {itemPrice} each)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              Bill Summary
            </h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₨ {order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span>₨ {order.deliveryCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-white border-t border-yellow-500/20 pt-2 mt-2">
                <span className="text-lg">Total Amount</span>
                <span className="text-xl text-yellow-500">₨ {order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2">
                <span className="text-gray-400">Payment Method</span>
                <span className="text-gray-300">{order.paymentMethod.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Payment Status</span>
                <span className={`font-semibold ${
                  order.paymentStatus === 'PAID' ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-gray-800/40 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-2">📝 Order Notes</h3>
              <p className="text-gray-300 text-sm italic">"{order.notes}"</p>
            </div>
          )}

        </div>

        {/* Back to Menu */}
        <div className="text-center mt-6">
          <Link 
            href="/menu"
            className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-6 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-amber-600 transition-all duration-200 transform hover:scale-105"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Estimated Delivery Time */}
        <div className="text-center mt-6 text-sm text-gray-400">
          <p>Estimated delivery time: 30-45 minutes</p>
          <p className="text-xs mt-1">You will receive an SMS when your order is out for delivery</p>
        </div>
      </div>
    </div>
  );
}