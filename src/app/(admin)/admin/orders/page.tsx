'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Printer, 
  Share2,
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  MapPin,
  ChevronDown
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
    };
  }>;
}

interface StatusCount {
  status: string;
  _count: { id: number };
}

const statusOptions = [
  'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen) {
        const ref = dropdownRefs.current[dropdownOpen];
        if (ref && !ref.contains(event.target as Node)) {
          setDropdownOpen(null);
        }
      }
    };

    // Use 'click' instead of 'mousedown' for better compatibility
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    fetchOrders();
    fetchStatusCounts();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/orders/status-counts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.statusCounts) {
        setStatusCounts(data.statusCounts);
      }
    } catch (error) {
      console.error('Error fetching status counts:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    console.log('🚀 updateOrderStatus called:', { orderId, newStatus });
    
    // Close dropdown immediately
    setDropdownOpen(null);
    setUpdatingOrderId(orderId);
    
    try {
      const token = localStorage.getItem('admin_token');
      console.log('📝 Token exists:', !!token);
      
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (response.ok) {
        const updatedOrder = await response.json();
        console.log('✅ Update successful:', updatedOrder);
        
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        // Refresh status counts
        fetchStatusCounts();
      } else {
        const errorData = await response.json();
        console.error('❌ Update failed:', errorData);
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const shareOrderWithRider = (order: Order) => {
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
    
    window.open(whatsappUrl, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="text-yellow-500" size={16} />;
      case 'CONFIRMED': return <CheckCircle className="text-blue-500" size={16} />;
      case 'PREPARING': return <Package className="text-orange-500" size={16} />;
      case 'READY': return <CheckCircle className="text-green-500" size={16} />;
      case 'OUT_FOR_DELIVERY': return <Truck className="text-purple-500" size={16} />;
      case 'DELIVERED': return <CheckCircle className="text-green-600" size={16} />;
      case 'CANCELLED': return <XCircle className="text-red-500" size={16} />;
      default: return <Package className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'CONFIRMED': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'PREPARING': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'READY': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'OUT_FOR_DELIVERY': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'DELIVERED': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'CANCELLED': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

 const StatusDropdown = ({ order }: { order: Order }) => {
  const isOpen = dropdownOpen === order.id;
  
  const allStatusOptions = [
    'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
  ];

  const handleStatusClick = (e: React.MouseEvent, status: string) => {
    e.preventDefault();
    e.stopPropagation();
    updateOrderStatus(order.id, status);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(isOpen ? null : order.id);
  };

  return (
    <div className="relative" ref={el => { dropdownRefs.current[order.id] = el; }} style={{ zIndex: isOpen ? 1000 : 'auto' }}>
      <button
        onClick={handleToggleClick}
        disabled={updatingOrderId === order.id}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(order.status)} ${
          updatingOrderId === order.id ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {updatingOrderId === order.id ? (
          <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent mr-1" />
        ) : (
          getStatusIcon(order.status)
        )}
        <span className="ml-1 capitalize">
          {order.status.toLowerCase().replace(/_/g, ' ')}
        </span>
        <ChevronDown size={12} className="ml-1" />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl min-w-[180px]"
          style={{ 
            zIndex: 1000,
            backgroundColor: 'rgb(31 41 55)'
          }}
        >
          {allStatusOptions.map((status) => (
            <button
              key={status}
              onClick={(e) => handleStatusClick(e, status)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors flex items-center ${
                order.status === status ? 'bg-gray-700 text-yellow-400' : 'text-white'
              }`}
              style={{ backgroundColor: 'transparent' }}
            >
              {getStatusIcon(status)}
              <span className="ml-2 capitalize">
                {status.toLowerCase().replace(/_/g, ' ')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

  // Fix date filtering logic
  const filterByDate = (order: Order, filter: string) => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    
    switch (filter) {
      case 'today':
        return orderDate.toDateString() === today.toDateString();
      case 'week':
        const weekAgo = new Date(today.setDate(today.getDate() - 7));
        return orderDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
        return orderDate >= monthAgo;
      default:
        return true;
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || filterByDate(order, dateFilter);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalItems = (order: Order) => {
    return order.items.reduce((total, item) => total + item.quantity, 0);
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center text-yellow-500 mr-4 hover:text-yellow-400"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-500">Orders Management</h1>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 md:gap-4 mb-6">
          {statusOptions.map((status) => {
            const statusCount = statusCounts.find(s => s.status === status);
            const count = statusCount ? statusCount._count.id : 0;
            
            return (
              <div key={status} className="bg-gray-900 p-3 md:p-4 rounded-lg text-center">
                <div className="flex justify-center mb-1 md:mb-2">
                  {getStatusIcon(status)}
                </div>
                <div className="text-lg md:text-2xl font-bold text-white">{count}</div>
                <div className="text-xs md:text-sm text-gray-400 capitalize">{status.toLowerCase().replace(/_/g, ' ')}</div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-gray-900 p-4 md:p-6 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
       <div className="hidden md:block bg-gray-900 rounded-lg relative" style={{ isolation: 'isolate' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-yellow-400">
                        {order.orderNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {order.customerName}
                      </div>
                      <div className="text-sm text-gray-400">
                        {order.customerPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {getTotalItems(order)} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        Rs {order.total}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap relative">
                      <StatusDropdown order={order} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/admin/orders/${order.id}`)}
                          className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors border border-blue-600"
                          title="View Details"
                        >
                          <Eye size={16} className="text-white" />
                        </button>
                        <button
                          onClick={() => window.open(`/api/orders/${order.id}/slip?format=thermal`, '_blank')}
                          className="p-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors border border-green-600"
                          title="Print Slip"
                        >
                          <Printer size={16} className="text-white" />
                        </button>
                        <button
                          onClick={() => shareOrderWithRider(order)}
                          className="p-2 bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors border border-orange-600"
                          title="Share with Rider"
                        >
                          <Share2 size={16} className="text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              {/* Header with Order Number and Status */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-yellow-400 font-semibold text-lg">{order.orderNumber}</h3>
                  <p className="text-gray-400 text-xs">{formatDate(order.createdAt)}</p>
                </div>
                <StatusDropdown order={order} />
              </div>

              {/* Customer Info */}
              <div className="mb-3">
                <div className="flex items-center mb-1">
                  <div className="text-white font-medium">{order.customerName}</div>
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Phone size={12} className="mr-1" />
                  {order.customerPhone}
                </div>
                {order.deliveryAddress && (
                  <div className="flex items-start text-gray-400 text-sm mt-1">
                    <MapPin size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{order.deliveryAddress}</span>
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-400">Items</p>
                  <p className="text-white font-medium">{getTotalItems(order)} items</p>
                </div>
                <div>
                  <p className="text-gray-400">Total</p>
                  <p className="text-white font-medium">Rs {order.total.toLocaleString('en-PK')}</p>
                </div>
                <div>
                  <p className="text-gray-400">Payment</p>
                  <p className="text-white text-xs capitalize">{order.paymentMethod.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-400">Payment Status</p>
                  <p className={`text-xs font-medium ${order.paymentStatus === 'PAID' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {order.paymentStatus}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                  className="flex-1 flex items-center justify-center bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  <Eye size={14} className="mr-1" />
                  View
                </button>
                <button
                  onClick={() => window.open(`/api/orders/${order.id}/slip?format=thermal`, '_blank')}
                  className="flex items-center justify-center bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  title="Print"
                >
                  <Printer size={14} />
                </button>
                <button
                  onClick={() => shareOrderWithRider(order)}
                  className="flex items-center justify-center bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  title="Share with Rider"
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}