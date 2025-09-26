'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  AlertTriangle,
  Eye,
  MoreHorizontal,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  averageOrderValue: number;
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    quantity: number;
    foodItem: {
      name: string;
    };
  }>;
}

interface ChartData {
  name: string;
  orders: number;
  revenue: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('admin_token');
      
      // Fetch dashboard statistics
      const [statsResponse, ordersResponse, analyticsResponse] = await Promise.all([
        fetch('/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/orders?limit=5', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/orders/analytics/reveneu?startDate=' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.orders || []);
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        const formattedChartData = analyticsData.report?.slice(-7).map((item: any) => ({
          name: new Date(item.date).toLocaleDateString('en-PK', { weekday: 'short' }),
          orders: item.orders,
          revenue: item.revenue
        })) || [];
        setChartData(formattedChartData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
      case 'PENDING': return 'text-yellow-500 bg-yellow-100';
      case 'CONFIRMED': return 'text-blue-500 bg-blue-100';
      case 'PREPARING': return 'text-orange-500 bg-orange-100';
      case 'READY': return 'text-green-500 bg-green-100';
      case 'OUT_FOR_DELIVERY': return 'text-purple-500 bg-purple-100';
      case 'DELIVERED': return 'text-green-600 bg-green-100';
      case 'CANCELLED': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    });
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-500 mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back! Here's what's happening at your restaurant.</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="flex items-center text-sm text-gray-400">
              <Calendar size={16} className="mr-2" />
              {new Date().toLocaleDateString('en-PK', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Orders */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Today's Orders</p>
                <p className="text-2xl font-bold text-white mt-1">{stats?.todayOrders || 0}</p>
                <div className="flex items-center mt-2 text-sm text-green-400">
                  <TrendingUp size={16} className="mr-1" />
                  <span>Active today</span>
                </div>
              </div>
              <div className="text-yellow-500">
                <ShoppingCart size={32} />
              </div>
            </div>
          </div>

          {/* Today's Revenue */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Today's Revenue</p>
                <p className="text-2xl font-bold text-white mt-1">Rs {(stats?.todayRevenue || 0).toLocaleString('en-PK')}</p>
                <div className="flex items-center mt-2 text-sm text-green-400">
                  <TrendingUp size={16} className="mr-1" />
                  <span>Daily earnings</span>
                </div>
              </div>
              <div className="text-yellow-500">
                <DollarSign size={32} />
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Pending Orders</p>
                <p className="text-2xl font-bold text-white mt-1">{stats?.pendingOrders || 0}</p>
                <div className="flex items-center mt-2 text-sm text-yellow-400">
                  <AlertTriangle size={16} className="mr-1" />
                  <span>Need attention</span>
                </div>
              </div>
              <div className="text-yellow-500">
                <Clock size={32} />
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Avg Order Value</p>
                <p className="text-2xl font-bold text-white mt-1">Rs {Math.round(stats?.averageOrderValue || 0)}</p>
                <div className="flex items-center mt-2 text-sm text-blue-400">
                  <TrendingUp size={16} className="mr-1" />
                  <span>Per order</span>
                </div>
              </div>
              <div className="text-yellow-500">
                <Users size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Revenue Chart */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Weekly Overview</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }}
                    formatter={(value, name) => [
                      name === 'revenue' ? `Rs ${value}` : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#EAB308" 
                    strokeWidth={3}
                    dot={{ fill: '#EAB308', strokeWidth: 2 }}
                    name="Orders"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', strokeWidth: 2 }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={20} />
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-medium">Completed Orders</p>
                    <p className="text-gray-400 text-sm">Successfully delivered</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{stats?.completedOrders || 0}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="text-blue-600" size={20} />
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-medium">Total Customers</p>
                    <p className="text-gray-400 text-sm">Unique customers served</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{stats?.totalCustomers || 0}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <DollarSign className="text-purple-600" size={20} />
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-medium">Total Revenue</p>
                    <p className="text-gray-400 text-sm">All time earnings</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">Rs {(stats?.totalRevenue || 0).toLocaleString('en-PK')}</div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => router.push('/admin/analytics')}
                  className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  View Detailed Analytics
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Recent Orders</h3>
            <button
              onClick={() => router.push('/admin/orders')}
              className="text-yellow-500 hover:text-yellow-400 font-medium"
            >
              View All Orders
            </button>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 font-medium py-3">Order #</th>
                  <th className="text-left text-gray-400 font-medium py-3">Customer</th>
                  <th className="text-left text-gray-400 font-medium py-3">Items</th>
                  <th className="text-left text-gray-400 font-medium py-3">Status</th>
                  <th className="text-left text-gray-400 font-medium py-3">Total</th>
                  <th className="text-left text-gray-400 font-medium py-3">Time</th>
                  <th className="text-left text-gray-400 font-medium py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="py-4 text-yellow-500 font-medium">{order.orderNumber}</td>
                    <td className="py-4 text-white">{order.customerName}</td>
                    <td className="py-4 text-gray-300">
                      {order.items.reduce((total, item) => total + item.quantity, 0)} items
                    </td>
                    <td className="py-4">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className="ml-2 text-sm capitalize">
                          {order.status.toLowerCase().replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-white font-medium">Rs {order.total.toLocaleString('en-PK')}</td>
                    <td className="py-4 text-gray-400 text-sm">{formatDate(order.createdAt)}</td>
                    <td className="py-4">
                      <button
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="flex items-center text-yellow-500 hover:text-yellow-400"
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {recentOrders.length > 0 ? recentOrders.map((order) => (
              <div key={order.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-yellow-500 font-semibold text-lg">{order.orderNumber}</h4>
                    <p className="text-white text-sm">{order.customerName}</p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(order.status)}`}>
                      {order.status.toLowerCase().replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-gray-400">Items</p>
                    <p className="text-white font-medium">
                      {order.items.reduce((total, item) => total + item.quantity, 0)} items
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total</p>
                    <p className="text-white font-medium">Rs {order.total.toLocaleString('en-PK')}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-xs">Order Time</p>
                    <p className="text-gray-300 text-sm">{formatDate(order.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="flex items-center bg-yellow-500 text-black px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                  >
                    <Eye size={14} className="mr-1" />
                    View Details
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>No recent orders found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}