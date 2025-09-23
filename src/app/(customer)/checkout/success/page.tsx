// app/checkout/success/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle, Package, Clock, MapPin, Phone, Download, Share 
} from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  foodItem: {
    id: string;
    name: string;
    price: number;
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
        setOrder(data.order);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
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
${order.items.map(item => `• ${item.quantity}x ${item.foodItem.name} - Rs ${item.total}`).join('\n')}

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#101828] to-gray-900">

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#101828] to-gray-900">

        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Order Not Found</h2>
          <p className="text-gray-400 mb-6">Unable to find order details.</p>
          <Link 
            href="/menu"
            className="inline-flex items-center bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#101828] to-gray-900">
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
          <p className="text-gray-400">Thank you for your order. We'll have it ready soon!</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#101828] rounded-xl border-2 border-yellow-500/20 p-6 mb-6">
          {/* Order Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-yellow-500/20">
            <div>
              <h2 className="text-xl font-bold text-white">Order #{order.orderNumber}</h2>
              <p className="text-gray-400 text-sm">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
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
                  ? 'bg-yellow-500/20 text-yellow-500' 
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
            <div>
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-yellow-500" />
                Contact Details
              </h3>
              <p className="text-gray-300">{order.customerName}</p>
              <p className="text-gray-400 text-sm">{order.customerPhone}</p>
              {order.customerEmail && (
                <p className="text-gray-400 text-sm">{order.customerEmail}</p>
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-yellow-500" />
                Delivery Address
              </h3>
              <p className="text-gray-300">{order.deliveryAddress}</p>
            </div>
          </div>

          {/* Items Ordered */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-yellow-500" />
              Items Ordered
            </h3>
            <ul className="space-y-3">
              {order.items.map(item => (
                <li key={item.id} className="flex justify-between text-gray-300">
                  <span>{item.quantity}x {item.foodItem.name}</span>
                  <span>Rs {item.total}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bill Summary */}
          <div className="bg-gray-800/40 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              Bill Summary
            </h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs {order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>Rs {order.deliveryCharges}</span>
              </div>
              <div className="flex justify-between font-bold text-white border-t border-yellow-500/20 pt-2">
                <span>Total</span>
                <span>Rs {order.total}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Payment</span>
                <span>{order.paymentMethod} ({order.paymentStatus})</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-gray-800/40 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-2">Notes</h3>
              <p className="text-gray-300 text-sm">{order.notes}</p>
            </div>
          )}

          {/* Actions */}
          {/* <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={downloadReceipt}
              className="flex items-center justify-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
            >
              <Download className="w-4 h-4" /> Download Receipt
            </button>
            <button 
              onClick={shareOnWhatsApp}
              className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              <Share className="w-4 h-4" /> Share on WhatsApp
            </button>
          </div> */}
        </div>

        {/* Back to Menu */}
        <div className="text-center mt-6">
          <Link 
            href="/menu"
            className="inline-flex items-center bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
