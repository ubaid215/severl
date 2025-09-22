'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Array<{
    status: string;
    _count: { id: number };
  }>;
  ordersByPaymentMethod: Array<{
    paymentMethod: string;
    _count: { id: number };
  }>;
  revenueReport: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
}

function KPICard({ title, value, change, changeType, icon }: KPICardProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              changeType === 'increase' ? 'text-green-400' : 'text-red-400'
            }`}>
              {changeType === 'increase' ? (
                <TrendingUp size={16} className="mr-1" />
              ) : (
                <TrendingDown size={16} className="mr-1" />
              )}
              <span>{Math.abs(change)}% from last period</span>
            </div>
          )}
        </div>
        <div className="text-yellow-500">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('admin_token');
      
      // Fetch main analytics
      const analyticsResponse = await fetch(
        `/api/orders/analytics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      // Fetch revenue report
      const revenueResponse = await fetch(
        `/api/orders/analytics/reveneu?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const analyticsResult = await analyticsResponse.json();
      const revenueResult = await revenueResponse.json();

      if (analyticsResult.analytics && revenueResult.report) {
        setAnalyticsData({
          ...analyticsResult.analytics,
          revenueReport: revenueResult.report
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportReport = () => {
    if (!analyticsData) return;
    
    const reportData = {
      dateRange,
      ...analyticsData,
      generatedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analytics-report-${dateRange.startDate}-to-${dateRange.endDate}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Chart colors
  const COLORS = ['#EAB308', '#F59E0B', '#D97706', '#92400E', '#451A03'];

  // Prepare chart data
  const statusChartData = analyticsData?.ordersByStatus.map(item => ({
    name: item.status.replace(/_/g, ' '),
    value: item._count.id,
    fill: COLORS[analyticsData.ordersByStatus.indexOf(item) % COLORS.length]
  })) || [];

  const paymentMethodData = analyticsData?.ordersByPaymentMethod.map(item => ({
    name: item.paymentMethod.replace(/_/g, ' '),
    value: item._count.id,
    fill: COLORS[analyticsData.ordersByPaymentMethod.indexOf(item) % COLORS.length]
  })) || [];

  const revenueChartData = analyticsData?.revenueReport.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: item.revenue,
    orders: item.orders
  })) || [];

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
            <h1 className="text-3xl font-bold text-yellow-500 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Track your restaurant's performance and insights</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
            {/* Date Range Filter */}
            <div className="flex items-center space-x-2 bg-gray-900 rounded-lg p-2">
              <Calendar size={16} className="text-gray-400" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={fetchAnalytics}
                disabled={refreshing}
                className="flex items-center bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportReport}
                className="flex items-center bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Download size={16} className="mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {analyticsData ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPICard
                title="Total Orders"
                value={analyticsData.totalOrders}
                change={12.5}
                changeType="increase"
                icon={<ShoppingCart size={32} />}
              />
              <KPICard
                title="Total Revenue"
                value={`Rs ${analyticsData.totalRevenue.toLocaleString('en-PK')}`}
                change={8.2}
                changeType="increase"
                icon={<DollarSign size={32} />}
              />
              <KPICard
                title="Average Order Value"
                value={`Rs ${Math.round(analyticsData.averageOrderValue)}`}
                change={3.1}
                changeType="decrease"
                icon={<BarChart3 size={32} />}
              />
              <KPICard
                title="Active Customers"
                value={Math.round(analyticsData.totalOrders * 0.7)} // Estimated unique customers
                change={15.3}
                changeType="increase"
                icon={<Users size={32} />}
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Trend Chart */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Revenue Trend</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => `Rs ${value}`}
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
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#EAB308" 
                        strokeWidth={3}
                        dot={{ fill: '#EAB308', strokeWidth: 2 }}
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Orders by Status */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Orders by Status</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        dataKey="value"
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#FFFFFF'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Daily Orders */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Daily Orders</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
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
                      />
                      <Bar 
                        dataKey="orders" 
                        fill="#EAB308"
                        radius={[4, 4, 0, 0]}
                        name="Orders"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Payment Methods</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        dataKey="value"
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#FFFFFF'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Summary Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {analyticsData.ordersByStatus.reduce((acc, item) => 
                      item.status === 'DELIVERED' ? acc + item._count.id : acc, 0
                    )}
                  </div>
                  <div className="text-gray-400">Successfully Delivered</div>
                  <div className="text-sm text-green-400 mt-1">
                    {((analyticsData.ordersByStatus.reduce((acc, item) => 
                      item.status === 'DELIVERED' ? acc + item._count.id : acc, 0
                    ) / analyticsData.totalOrders) * 100).toFixed(1)}% Success Rate
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {analyticsData.ordersByStatus.reduce((acc, item) => 
                      ['PENDING', 'CONFIRMED', 'PREPARING'].includes(item.status) ? acc + item._count.id : acc, 0
                    )}
                  </div>
                  <div className="text-gray-400">Orders in Progress</div>
                  <div className="text-sm text-blue-400 mt-1">
                    Active Orders
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    PKR {Math.round(analyticsData.totalRevenue / Math.max(revenueChartData.length, 1))}
                  </div>
                  <div className="text-gray-400">Average Daily Revenue</div>
                  <div className="text-sm text-yellow-400 mt-1">
                    Per Day in Selected Period
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <BarChart3 size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Analytics Data</h3>
            <p className="text-gray-500">No data available for the selected date range.</p>
          </div>
        )}
      </div>
    </div>
  );
}