'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  Share2
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  deliveryCharges: number;
  distance?: number;
  notes?: string;
  createdAt: string;
  items: Array<{
    quantity: number;
    price: number;
    total: number;
    foodItem: {
      name: string;
      image?: string;
    };
  }>;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.order) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/orders/${id}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });

      if (response.ok) {
        setOrder(prev => prev ? { ...prev, paymentStatus: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const shareOrderWithRider = async () => {
    if (!order) return;

    // Create detailed order message for rider
    const orderDetails = `
🛵 NEW DELIVERY ORDER

📦 Order #${order.orderNumber}
📅 ${new Date(order.createdAt).toLocaleDateString('en-IN')} ${new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}

👤 CUSTOMER INFO:
Name: ${order.customerName}
Phone: ${order.customerPhone}
📍 Address: ${order.deliveryAddress}
${order.distance ? `📏 Distance: ${order.distance} km` : ''}

🍽️ ORDER ITEMS:
${order.items.map(item => `• ${item.quantity}x ${item.foodItem.name}`).join('\n')}

💰 PAYMENT:
Method: ${order.paymentMethod.replace(/_/g, ' ')}
Status: ${order.paymentStatus}
Total: Rs ${order.total} ${order.paymentStatus === 'PENDING' ? '(COLLECT CASH)' : '(PAID ONLINE)'}

${order.notes ? `📝 SPECIAL NOTES:\n${order.notes}` : ''}

⏰ Status: ${order.status.replace(/_/g, ' ')}
`.trim();

    const encodedMessage = encodeURIComponent(orderDetails);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    // Open WhatsApp with the message
    window.open(whatsappUrl, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="text-yellow-500" size={20} />;
      case 'CONFIRMED': return <CheckCircle className="text-blue-500" size={20} />;
      case 'PREPARING': return <Package className="text-orange-500" size={20} />;
      case 'READY': return <CheckCircle className="text-green-500" size={20} />;
      case 'OUT_FOR_DELIVERY': return <Truck className="text-purple-500" size={20} />;
      case 'DELIVERED': return <CheckCircle className="text-green-600" size={20} />;
      case 'CANCELLED': return <XCircle className="text-red-500" size={20} />;
      default: return <Package className="text-gray-500" size={20} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
          <button
            onClick={() => router.push('/admin/orders')}
            className="bg-yellow-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/admin/orders')}
            className="flex items-center text-yellow-500 hover:text-yellow-400"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Orders
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => window.open(`/api/orders/${id}/slip?format=thermal`, '_blank')}
              className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Printer size={16} className="mr-2" />
              Print
            </button>
            <button
              onClick={() => window.open(`/api/orders/${id}/slip?format=text`, '_blank')}
              className="flex items-center bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Download size={16} className="mr-2" />
              Download
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-yellow-500 mb-4">Order #{order.orderNumber}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">Date:</span> {formatDate(order.createdAt)}</p>
                    <p><span className="text-gray-400">Status:</span> 
                      <span className="ml-2 capitalize">{order.status.toLowerCase().replace(/_/g, ' ')}</span>
                    </p>
                    <p><span className="text-gray-400">Payment:</span> 
                      <span className="ml-2 capitalize">{order.paymentStatus.toLowerCase()} ({order.paymentMethod.toLowerCase().replace(/_/g, ' ')})</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">Name:</span> {order.customerName}</p>
                    <p><span className="text-gray-400">Phone:</span> {order.customerPhone}</p>
                    {order.customerEmail && (
                      <p><span className="text-gray-400">Email:</span> {order.customerEmail}</p>
                    )}
                    <p><span className="text-gray-400">Address:</span> {order.deliveryAddress}</p>
                    {order.distance && (
                      <p><span className="text-gray-400">Distance:</span> {order.distance} km</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{item.foodItem.name}</p>
                      <p className="text-sm text-gray-400">Rs {item.price} × {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-white">Rs {item.total}</p>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal:</span>
                    <span className="text-white">Rs {order.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Delivery Charges:</span>
                    <span className="text-white">Rs {order.deliveryCharges}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-600">
                    <span className="text-yellow-400">Total:</span>
                    <span className="text-yellow-400">Rs {order.total}</span>
                  </div>
                </div>
              </div>

              {order.notes && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-white mb-2">Notes:</h4>
                  <p className="text-sm text-gray-400 bg-gray-800 p-3 rounded-lg">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4">Order Actions</h3>

              {/* Status Update */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Update Status</h4>
                <div className="space-y-2">
                  {['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(status)}
                      disabled={updating || order.status === status}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                        order.status === status
                          ? 'bg-yellow-500 text-black font-semibold'
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center">
                        {getStatusIcon(status)}
                        <span className="ml-2 capitalize">{status.toLowerCase().replace(/_/g, ' ')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Status Update */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Payment Status</h4>
                <div className="space-y-2">
                  {['PENDING', 'PAID', 'FAILED', 'REFUNDED'].map(status => (
                    <button
                      key={status}
                      onClick={() => updatePaymentStatus(status)}
                      disabled={updating || order.paymentStatus === status}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                        order.paymentStatus === status
                          ? 'bg-green-500 text-black font-semibold'
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center">
                        <CheckCircle size={16} className={status === 'PAID' ? 'text-green-400' : 'text-gray-400'} />
                        <span className="ml-2 capitalize">{status.toLowerCase()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => window.open(`https://wa.me/${order.customerPhone}?text=Hello ${order.customerName}, regarding your order #${order.orderNumber}`, '_blank')}
                    className="w-full flex items-center bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    WhatsApp Customer
                  </button>
                  <button
                    onClick={shareOrderWithRider}
                    className="w-full flex items-center bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Share2 size={16} className="mr-2" />
                    Share with Rider
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}