"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  ShoppingCart,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import { useRouter } from "next/navigation";

interface RevenueData {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

interface RevenueStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  growthRate: number;
  previousPeriodRevenue: number;
}

interface CategoryPerformance {
  category: string;
  revenue: number;
  revenuePercentage: number;
  quantitySold: number;
}

const COLORS = ["#EAB308", "#F59E0B", "#D97706", "#FBBF24", "#FCD34D"];

export default function RevenuePage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("weekly");
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  const fetchRevenueData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("admin_token");

      const [revenueResponse, statsResponse, categoryResponse] =
        await Promise.all([
          fetch(`/api/analytics/revenue-trends?period=${timeRange}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/analytics/compare-periods?type=${timeRange}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/analytics/category-performance", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      if (revenueResponse.ok) {
        const revenueData = await revenueResponse.json();
        setRevenueData(revenueData.trends || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalRevenue: statsData.comparison.revenue.current,
          totalOrders: statsData.comparison.orders.current,
          averageOrderValue: statsData.comparison.averageOrderValue.current,
          growthRate: statsData.comparison.revenue.change,
          previousPeriodRevenue: statsData.comparison.revenue.previous,
        });
      }

      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        setCategoryData(categoryData.categories?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const exportRevenueData = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/analytics/export?type=revenue", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `revenue-export-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString("en-PK")}`;
  };

  const formatPeriodLabel = (period: string) => {
    switch (timeRange) {
      case "daily":
        return new Date(period).toLocaleDateString("en-PK", {
          day: "numeric",
          month: "short",
        });
      case "weekly":
        return `Week ${period}`;
      case "monthly":
        return new Date(period + "-01").toLocaleDateString("en-PK", {
          month: "short",
        });
      case "yearly":
        return period;
      default:
        return period;
    }
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
            <h1 className="text-3xl font-bold text-yellow-500 mb-2">
              Revenue Analytics
            </h1>
            <p className="text-gray-400">
              Track your revenue performance 
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
            <button
              onClick={exportRevenueData}
              className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download size={16} className="mr-2" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={fetchRevenueData}
              disabled={refreshing}
              className="flex items-center bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(["daily", "weekly", "monthly", "yearly"] as const).map(
              (range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartType("line")}
              className={`p-2 rounded-lg transition-colors ${
                chartType === "line"
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <LineChartIcon size={20} />
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`p-2 rounded-lg transition-colors ${
                chartType === "bar"
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <BarChart3 size={20} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats ? formatCurrency(stats.totalRevenue) : "Rs 0"}
                </p>
                <div
                  className={`flex items-center mt-2 text-sm ${
                    stats?.growthRate && stats.growthRate >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {stats?.growthRate && stats.growthRate >= 0 ? (
                    <ArrowUpRight size={16} className="mr-1" />
                  ) : (
                    <ArrowDownRight size={16} className="mr-1" />
                  )}
                  <span>
                    {stats ? Math.abs(stats.growthRate).toFixed(1) : 0}% vs last
                    period
                  </span>
                </div>
              </div>
              <div className="text-yellow-500">
                <DollarSign size={32} />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats?.totalOrders || 0}
                </p>
                <div className="flex items-center mt-2 text-sm text-blue-400">
                  <ShoppingCart size={16} className="mr-1" />
                  <span>Completed orders</span>
                </div>
              </div>
              <div className="text-yellow-500">
                <ShoppingCart size={32} />
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Avg Order Value
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats ? formatCurrency(stats.averageOrderValue) : "Rs 0"}
                </p>
                <div className="flex items-center mt-2 text-sm text-purple-400">
                  <TrendingUp size={16} className="mr-1" />
                  <span>Per order</span>
                </div>
              </div>
              <div className="text-yellow-500">
                <Users size={32} />
              </div>
            </div>
          </div>

          {/* Growth Rate */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Growth Rate</p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    stats?.growthRate && stats.growthRate >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {stats
                    ? `${
                        stats.growthRate >= 0 ? "+" : ""
                      }${stats.growthRate.toFixed(1)}%`
                    : "0%"}
                </p>
                <div className="flex items-center mt-2 text-sm text-gray-400">
                  <TrendingUp size={16} className="mr-1" />
                  <span>Revenue growth</span>
                </div>
              </div>
              <div
                className={`${
                  stats?.growthRate && stats.growthRate >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {stats?.growthRate && stats.growthRate >= 0 ? (
                  <TrendingUp size={32} />
                ) : (
                  <TrendingDown size={32} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Revenue Chart */}
          <div className="lg:col-span-2 bg-gray-900 rounded-lg p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2 sm:mb-0">
                Revenue Trend
              </h3>
              <div className="text-sm text-gray-400">
                {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}{" "}
                Overview
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "line" ? (
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="period"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={formatPeriodLabel}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => `Rs ${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#FFFFFF",
                      }}
                      formatter={(value: number, name: string) => [
                        name === "revenue" ? formatCurrency(value) : value,
                        name === "revenue" ? "Revenue" : "Orders",
                      ]}
                      labelFormatter={(label) =>
                        `Period: ${formatPeriodLabel(label)}`
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#EAB308"
                      strokeWidth={3}
                      dot={{ fill: "#EAB308", strokeWidth: 2 }}
                      name="Revenue"
                    />
                  </LineChart>
                ) : (
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="period"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={formatPeriodLabel}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => `Rs ${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#FFFFFF",
                      }}
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "Revenue",
                      ]}
                      labelFormatter={(label) =>
                        `Period: ${formatPeriodLabel(label)}`
                      }
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#EAB308"
                      radius={[4, 4, 0, 0]}
                      name="Revenue"
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-6">
            <h3 className="text-xl font-semibold text-white mb-6">
              Top Categories
            </h3>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData.map((item) => ({
                      name: item.category,
                      value: item.revenue,
                      percentage: item.revenuePercentage,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) =>
                      `${name}: ${(percentage as number).toFixed(1)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Revenue",
                    ]}
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Category List */}
            <div className="mt-4 space-y-3">
              {categoryData.map((category, index) => (
                <div
                  key={category.category}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-300">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {formatCurrency(category.revenue)}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {category.revenuePercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Revenue Table */}
        <div className="bg-gray-900 rounded-lg p-4 md:p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            Revenue Details
          </h3>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 font-medium py-3">
                    Period
                  </th>
                  <th className="text-left text-gray-400 font-medium py-3">
                    Revenue
                  </th>
                  <th className="text-left text-gray-400 font-medium py-3">
                    Orders
                  </th>
                  <th className="text-left text-gray-400 font-medium py-3">
                    Avg Order Value
                  </th>
                  <th className="text-left text-gray-400 font-medium py-3">
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((item, index) => {
                  const previousRevenue =
                    index > 0 ? revenueData[index - 1].revenue : item.revenue;
                  const growth =
                    ((item.revenue - previousRevenue) / previousRevenue) * 100;

                  return (
                    <tr
                      key={item.period}
                      className="border-b border-gray-800 hover:bg-gray-800"
                    >
                      <td className="py-4 text-white font-medium">
                        {formatPeriodLabel(item.period)}
                      </td>
                      <td className="py-4 text-yellow-500 font-medium">
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className="py-4 text-white">{item.orders}</td>
                      <td className="py-4 text-gray-300">
                        {formatCurrency(item.averageOrderValue)}
                      </td>
                      <td className="py-4">
                        <div
                          className={`flex items-center ${
                            growth >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {growth >= 0 ? (
                            <ArrowUpRight size={16} className="mr-1" />
                          ) : (
                            <ArrowDownRight size={16} className="mr-1" />
                          )}
                          <span>{Math.abs(growth).toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {revenueData.map((item, index) => {
              const previousRevenue =
                index > 0 ? revenueData[index - 1].revenue : item.revenue;
              const growth =
                ((item.revenue - previousRevenue) / previousRevenue) * 100;

              return (
                <div
                  key={item.period}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-yellow-500 font-semibold text-lg">
                      {formatPeriodLabel(item.period)}
                    </h4>
                    <div
                      className={`flex items-center text-sm ${
                        growth >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {growth >= 0 ? (
                        <ArrowUpRight size={16} className="mr-1" />
                      ) : (
                        <ArrowDownRight size={16} className="mr-1" />
                      )}
                      {Math.abs(growth).toFixed(1)}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Revenue</p>
                      <p className="text-yellow-500 font-medium">
                        {formatCurrency(item.revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Orders</p>
                      <p className="text-white font-medium">{item.orders}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Avg Order</p>
                      <p className="text-gray-300">
                        {formatCurrency(item.averageOrderValue)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {revenueData.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
              <p>No revenue data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
