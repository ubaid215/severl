import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Interfaces for type safety
interface TimeRange {
  startDate: Date;
  endDate: Date;
}

interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalItems: number;
}

interface RevenueByPeriod {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export class AnalyticsController {
  // ==================== REVENUE ANALYTICS ====================

  /**
   * Get revenue trends by time period (daily, weekly, monthly, yearly)
   * GET /api/analytics/revenue-trends?period=daily&startDate=2024-01-01&endDate=2024-12-31
   */
  static async getRevenueTrends(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const period = searchParams.get("period") || "daily";
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      const whereClause: any = {
        status: { not: "CANCELLED" },
      };

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
      }

      const orders = await prisma.order.findMany({
        where: whereClause,
        select: {
          createdAt: true,
          total: true,
          subtotal: true,
          deliveryCharges: true,
        },
        orderBy: { createdAt: "asc" },
      });

      const groupedData = this.groupByPeriod(orders, period);

      return NextResponse.json({
        period,
        trends: groupedData,
        summary: {
          totalRevenue: groupedData.reduce((sum, item) => sum + item.revenue, 0),
          totalOrders: groupedData.reduce((sum, item) => sum + item.orders, 0),
          averagePeriodRevenue:
            groupedData.reduce((sum, item) => sum + item.revenue, 0) /
            (groupedData.length || 1),
        },
      });
    } catch (error) {
      console.error("Get revenue trends error:", error);
      return NextResponse.json(
        { error: "Failed to fetch revenue trends" },
        { status: 500 }
      );
    }
  }

  /**
   * Get daily sales summary for POS dashboard
   * GET /api/analytics/daily-summary?date=2024-01-01
   */
  static async getDailySummary(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const dateParam = searchParams.get("date");

      const targetDate = dateParam ? new Date(dateParam) : new Date();
      targetDate.setHours(0, 0, 0, 0);

      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const [orders, hourlyBreakdown] = await Promise.all([
        prisma.order.findMany({
          where: {
            createdAt: {
              gte: targetDate,
              lt: nextDate,
            },
          },
          include: {
            items: {
              include: {
                foodItem: true,
              },
            },
          },
        }),

        prisma.order.findMany({
          where: {
            createdAt: {
              gte: targetDate,
              lt: nextDate,
            },
            status: { not: "CANCELLED" },
          },
          select: {
            createdAt: true,
            total: true,
          },
        }),
      ]);

      const completedOrders = orders.filter((o) => o.status !== "CANCELLED");
      const cancelledOrders = orders.filter((o) => o.status === "CANCELLED");

      const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
      const totalItemsSold = completedOrders.reduce(
        (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
        0
      );

      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour}:00`,
        revenue: 0,
        orders: 0,
      }));

      hourlyBreakdown.forEach((order) => {
        const hour = order.createdAt.getHours();
        hourlyData[hour].revenue += order.total;
        hourlyData[hour].orders += 1;
      });

      return NextResponse.json({
        date: targetDate.toISOString().split("T")[0],
        summary: {
          totalOrders: orders.length,
          completedOrders: completedOrders.length,
          cancelledOrders: cancelledOrders.length,
          totalRevenue,
          averageOrderValue: totalRevenue / (completedOrders.length || 1),
          totalItemsSold,
          cancellationRate: (cancelledOrders.length / (orders.length || 1)) * 100,
        },
        hourlyBreakdown: hourlyData.filter((h) => h.orders > 0),
        peakHour: hourlyData.reduce((max, curr) =>
          curr.revenue > max.revenue ? curr : max
        ),
      });
    } catch (error) {
      console.error("Get daily summary error:", error);
      return NextResponse.json(
        { error: "Failed to fetch daily summary" },
        { status: 500 }
      );
    }
  }

  /**
   * Get weekly sales report
   * GET /api/analytics/weekly-report?startDate=2024-01-01
   */
  static async getWeeklySummary(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const startDateParam = searchParams.get("startDate");

      const startDate = startDateParam ? new Date(startDateParam) : new Date();
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - startDate.getDay());

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
          status: { not: "CANCELLED" },
        },
        select: {
          createdAt: true,
          total: true,
          items: {
            select: {
              quantity: true,
            },
          },
        },
      });

      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dailyData = daysOfWeek.map((day, index) => ({
        day,
        date: new Date(
          startDate.getTime() + index * 24 * 60 * 60 * 1000
        ).toISOString().split("T")[0],
        revenue: 0,
        orders: 0,
        items: 0,
      }));

      orders.forEach((order) => {
        const dayIndex = order.createdAt.getDay();
        dailyData[dayIndex].revenue += order.total;
        dailyData[dayIndex].orders += 1;
        dailyData[dayIndex].items += order.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
      });

      const totalRevenue = dailyData.reduce((sum, day) => sum + day.revenue, 0);
      const totalOrders = dailyData.reduce((sum, day) => sum + day.orders, 0);

      return NextResponse.json({
        weekStart: startDate.toISOString().split("T")[0],
        weekEnd: endDate.toISOString().split("T")[0],
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue: totalRevenue / (totalOrders || 1),
          averageDailyRevenue: totalRevenue / 7,
          busiestDay: dailyData.reduce((max, curr) =>
            curr.revenue > max.revenue ? curr : max
          ),
        },
        dailyBreakdown: dailyData,
      });
    } catch (error) {
      console.error("Get weekly summary error:", error);
      return NextResponse.json(
        { error: "Failed to fetch weekly summary" },
        { status: 500 }
      );
    }
  }

  /**
   * Get monthly sales report
   * GET /api/analytics/monthly-report?month=2024-01
   */
  static async getMonthlySummary(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const monthParam = searchParams.get("month");

      const today = new Date();
      const [year, month] = monthParam
        ? monthParam.split("-").map(Number)
        : [today.getFullYear(), today.getMonth() + 1];

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const [orders, statusBreakdown, paymentMethodBreakdown] =
        await Promise.all([
          prisma.order.findMany({
            where: {
              createdAt: {
                gte: startDate,
                lt: endDate,
              },
            },
            select: {
              createdAt: true,
              total: true,
              status: true,
              paymentMethod: true,
              items: {
                select: {
                  quantity: true,
                  total: true,
                },
              },
            },
          }),

          prisma.order.groupBy({
            by: ["status"],
            where: {
              createdAt: {
                gte: startDate,
                lt: endDate,
              },
            },
            _count: { id: true },
          }),

          prisma.order.groupBy({
            by: ["paymentMethod"],
            where: {
              createdAt: {
                gte: startDate,
                lt: endDate,
              },
              status: { not: "CANCELLED" },
            },
            _sum: { total: true },
            _count: { id: true },
          }),
        ]);

      const completedOrders = orders.filter((o) => o.status !== "CANCELLED");
      const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
      const totalItems = completedOrders.reduce(
        (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
        0
      );

      const daysInMonth = new Date(year, month, 0).getDate();
      const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(year, month - 1, i + 1);
        return {
          day: i + 1,
          date: date.toISOString().split("T")[0],
          revenue: 0,
          orders: 0,
        };
      });

      completedOrders.forEach((order) => {
        const day = order.createdAt.getDate() - 1;
        dailyData[day].revenue += order.total;
        dailyData[day].orders += 1;
      });

      return NextResponse.json({
        month: `${year}-${String(month).padStart(2, "0")}`,
        summary: {
          totalRevenue,
          totalOrders: orders.length,
          completedOrders: completedOrders.length,
          cancelledOrders: orders.length - completedOrders.length,
          averageOrderValue: totalRevenue / (completedOrders.length || 1),
          totalItemsSold: totalItems,
          averageDailyRevenue: totalRevenue / daysInMonth,
        },
        statusBreakdown,
        paymentMethodBreakdown: paymentMethodBreakdown.map((pm) => ({
          method: pm.paymentMethod,
          revenue: pm._sum.total || 0,
          orders: pm._count.id,
        })),
        dailyBreakdown: dailyData,
        topDay: dailyData.reduce((max, curr) =>
          curr.revenue > max.revenue ? curr : max
        ),
      });
    } catch (error) {
      console.error("Get monthly summary error:", error);
      return NextResponse.json(
        { error: "Failed to fetch monthly summary" },
        { status: 500 }
      );
    }
  }

  /**
   * Get yearly sales report
   * GET /api/analytics/yearly-report?year=2024
   */
  static async getYearlySummary(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const yearParam = searchParams.get("year");

      const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);

      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
          status: { not: "CANCELLED" },
        },
        select: {
          createdAt: true,
          total: true,
          items: {
            select: {
              quantity: true,
            },
          },
        },
      });

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthlyData = months.map((month, index) => ({
        month,
        monthNumber: index + 1,
        revenue: 0,
        orders: 0,
        items: 0,
      }));

      orders.forEach((order) => {
        const monthIndex = order.createdAt.getMonth();
        monthlyData[monthIndex].revenue += order.total;
        monthlyData[monthIndex].orders += 1;
        monthlyData[monthIndex].items += order.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
      });

      const totalRevenue = monthlyData.reduce(
        (sum, month) => sum + month.revenue,
        0
      );
      const totalOrders = monthlyData.reduce(
        (sum, month) => sum + month.orders,
        0
      );

      const quarters = [
        {
          quarter: "Q1",
          months: [0, 1, 2],
          revenue: 0,
          orders: 0,
        },
        {
          quarter: "Q2",
          months: [3, 4, 5],
          revenue: 0,
          orders: 0,
        },
        {
          quarter: "Q3",
          months: [6, 7, 8],
          revenue: 0,
          orders: 0,
        },
        {
          quarter: "Q4",
          months: [9, 10, 11],
          revenue: 0,
          orders: 0,
        },
      ];

      quarters.forEach((q) => {
        q.months.forEach((m) => {
          q.revenue += monthlyData[m].revenue;
          q.orders += monthlyData[m].orders;
        });
      });

      return NextResponse.json({
        year,
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue: totalRevenue / (totalOrders || 1),
          averageMonthlyRevenue: totalRevenue / 12,
          bestMonth: monthlyData.reduce((max, curr) =>
            curr.revenue > max.revenue ? curr : max
          ),
          bestQuarter: quarters.reduce((max, curr) =>
            curr.revenue > max.revenue ? curr : max
          ),
        },
        monthlyBreakdown: monthlyData,
        quarterlyBreakdown: quarters.map((q) => ({
          quarter: q.quarter,
          revenue: q.revenue,
          orders: q.orders,
          averageOrderValue: q.revenue / (q.orders || 1),
        })),
      });
    } catch (error) {
      console.error("Get yearly summary error:", error);
      return NextResponse.json(
        { error: "Failed to fetch yearly summary" },
        { status: 500 }
      );
    }
  }

  // ==================== PRODUCT ANALYTICS ====================

  /**
   * Get top selling items by time period
   * GET /api/analytics/top-items?period=daily&limit=10&startDate=2024-01-01
   */
  static async getTopSellingItems(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get("limit") || "10");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      const whereClause: any = {
        order: {
          status: { not: "CANCELLED" },
        },
      };

      if (startDate || endDate) {
        whereClause.order.createdAt = {};
        if (startDate)
          whereClause.order.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.order.createdAt.lte = new Date(endDate);
      }

      const topItems = await prisma.orderItem.groupBy({
        by: ["foodItemId"],
        where: whereClause,
        _sum: {
          quantity: true,
          total: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: limit,
      });

      const foodItemIds = topItems.map((item) => item.foodItemId);
      const foodItems = await prisma.foodItem.findMany({
        where: {
          id: {
            in: foodItemIds,
          },
        },
        include: {
          category: true,
        },
      });

      const enrichedData = topItems.map((item) => {
        const foodItem = foodItems.find((fi) => fi.id === item.foodItemId);
        return {
          foodItemId: item.foodItemId,
          name: foodItem?.name || "Unknown",
          category: foodItem?.category?.name || "Unknown",
          quantitySold: item._sum.quantity || 0,
          totalRevenue: item._sum.total || 0,
          orderCount: item._count.id,
          averagePrice: (item._sum.total || 0) / (item._sum.quantity || 1),
        };
      });

      return NextResponse.json({
        topItems: enrichedData,
        totalItemsAnalyzed: foodItemIds.length,
      });
    } catch (error) {
      console.error("Get top selling items error:", error);
      return NextResponse.json(
        { error: "Failed to fetch top selling items" },
        { status: 500 }
      );
    }
  }

  /**
   * Get category-wise sales performance
   * GET /api/analytics/category-performance?startDate=2024-01-01
   */
  static async getCategoryPerformance(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      const whereClause: any = {
        order: {
          status: { not: "CANCELLED" },
        },
      };

      if (startDate || endDate) {
        whereClause.order.createdAt = {};
        if (startDate)
          whereClause.order.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.order.createdAt.lte = new Date(endDate);
      }

      const orderItems = await prisma.orderItem.findMany({
        where: whereClause,
        include: {
          foodItem: {
            include: {
              category: true,
            },
          },
        },
      });

      const categoryMap = new Map<
        string,
        {
          revenue: number;
          quantity: number;
          orders: Set<string>;
          items: Set<string>;
        }
      >();

      orderItems.forEach((item) => {
        const category = item.foodItem.category.name;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            revenue: 0,
            quantity: 0,
            orders: new Set(),
            items: new Set(),
          });
        }

        const data = categoryMap.get(category)!;
        data.revenue += item.total;
        data.quantity += item.quantity;
        data.orders.add(item.orderId);
        data.items.add(item.foodItemId);
      });

      const categoryPerformance = Array.from(categoryMap.entries()).map(
        ([category, data]) => ({
          category,
          revenue: data.revenue,
          quantitySold: data.quantity,
          orderCount: data.orders.size,
          uniqueItems: data.items.size,
          averageOrderValue: data.revenue / data.orders.size,
        })
      );

      categoryPerformance.sort((a, b) => b.revenue - a.revenue);

      const totalRevenue = categoryPerformance.reduce(
        (sum, cat) => sum + cat.revenue,
        0
      );

      return NextResponse.json({
        categories: categoryPerformance.map((cat) => ({
          ...cat,
          revenuePercentage: (cat.revenue / totalRevenue) * 100,
        })),
        totalRevenue,
        totalCategories: categoryPerformance.length,
      });
    } catch (error) {
      console.error("Get category performance error:", error);
      return NextResponse.json(
        { error: "Failed to fetch category performance" },
        { status: 500 }
      );
    }
  }

  // ==================== CUSTOMER ANALYTICS ====================

  /**
   * Get customer insights
   * GET /api/analytics/customer-insights?startDate=2024-01-01
   */
  static async getCustomerInsights(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      const whereClause: any = {};

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
      }

      const orders = await prisma.order.findMany({
        where: whereClause,
        select: {
          customerPhone: true,
          customerName: true,
          total: true,
          status: true,
          createdAt: true,
        },
      });

      const customerMap = new Map<
        string,
        {
          name: string;
          orderCount: number;
          totalSpent: number;
          lastOrder: Date;
          cancelledOrders: number;
        }
      >();

      orders.forEach((order) => {
        if (!customerMap.has(order.customerPhone)) {
          customerMap.set(order.customerPhone, {
            name: order.customerName,
            orderCount: 0,
            totalSpent: 0,
            lastOrder: order.createdAt,
            cancelledOrders: 0,
          });
        }

        const customer = customerMap.get(order.customerPhone)!;
        customer.orderCount += 1;
        if (order.status !== "CANCELLED") {
          customer.totalSpent += order.total;
        } else {
          customer.cancelledOrders += 1;
        }
        if (order.createdAt > customer.lastOrder) {
          customer.lastOrder = order.createdAt;
        }
      });

      const customers = Array.from(customerMap.entries()).map(
        ([phone, data]) => ({
          phone,
          name: data.name,
          orderCount: data.orderCount,
          totalSpent: data.totalSpent,
          averageOrderValue: data.totalSpent / (data.orderCount - data.cancelledOrders || 1),
          lastOrderDate: data.lastOrder,
          cancelledOrders: data.cancelledOrders,
        })
      );

      customers.sort((a, b) => b.totalSpent - a.totalSpent);

      const segments = {
        vip: customers.filter((c) => c.orderCount >= 10),
        regular: customers.filter((c) => c.orderCount >= 5 && c.orderCount < 10),
        occasional: customers.filter((c) => c.orderCount >= 2 && c.orderCount < 5),
        oneTime: customers.filter((c) => c.orderCount === 1),
      };

      return NextResponse.json({
        totalCustomers: customers.length,
        topCustomers: customers.slice(0, 20),
        segments: {
          vip: {
            count: segments.vip.length,
            totalRevenue: segments.vip.reduce((sum, c) => sum + c.totalSpent, 0),
          },
          regular: {
            count: segments.regular.length,
            totalRevenue: segments.regular.reduce(
              (sum, c) => sum + c.totalSpent,
              0
            ),
          },
          occasional: {
            count: segments.occasional.length,
            totalRevenue: segments.occasional.reduce(
              (sum, c) => sum + c.totalSpent,
              0
            ),
          },
          oneTime: {
            count: segments.oneTime.length,
            totalRevenue: segments.oneTime.reduce(
              (sum, c) => sum + c.totalSpent,
              0
            ),
          },
        },
        retentionRate:
          ((customers.length - segments.oneTime.length) /
            (customers.length || 1)) *
          100,
      });
    } catch (error) {
      console.error("Get customer insights error:", error);
      return NextResponse.json(
        { error: "Failed to fetch customer insights" },
        { status: 500 }
      );
    }
  }

  // ==================== OPERATIONAL ANALYTICS ====================

  /**
   * Get order patterns (peak hours, busy days)
   * GET /api/analytics/order-patterns?startDate=2024-01-01
   */
  static async getOrderPatterns(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      const whereClause: any = {
        status: { not: "CANCELLED" },
      };

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
      }

      const orders = await prisma.order.findMany({
        where: whereClause,
        select: {
          createdAt: true,
          total: true,
        },
      });

      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        hour: `${String(hour).padStart(2, "0")}:00`,
        orders: 0,
        revenue: 0,
      }));

      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dailyData = daysOfWeek.map((day) => ({
        day,
        orders: 0,
        revenue: 0,
      }));

      orders.forEach((order) => {
        const hour = order.createdAt.getHours();
        const dayOfWeek = order.createdAt.getDay();

        hourlyData[hour].orders += 1;
        hourlyData[hour].revenue += order.total;

        dailyData[dayOfWeek].orders += 1;
        dailyData[dayOfWeek].revenue += order.total;
      });

      const peakHour = hourlyData.reduce((max, curr) =>
        curr.orders > max.orders ? curr : max
      );
      const peakDay = dailyData.reduce((max, curr) =>
        curr.orders > max.orders ? curr : max
      );

      return NextResponse.json({
        hourlyPatterns: hourlyData.filter((h) => h.orders > 0),
        dailyPatterns: dailyData,
        insights: {
          peakHour: {
            time: peakHour.hour,
            orders: peakHour.orders,
            revenue: peakHour.revenue,
          },
          peakDay: {
            day: peakDay.day,
            orders: peakDay.orders,
            revenue: peakDay.revenue,
          },
          slowestHour: hourlyData
            .filter((h) => h.orders > 0)
            .reduce((min, curr) => (curr.orders < min.orders ? curr : min)),
          slowestDay: dailyData.reduce((min, curr) =>
            curr.orders < min.orders ? curr : min
          ),
        },
      });
    } catch (error) {
      console.error("Get order patterns error:", error);
      return NextResponse.json(
        { error: "Failed to fetch order patterns" },
        { status: 500 }
      );
    }
  }

  /**
   * Get performance metrics (delivery time, cancellation rate, etc.)
   * GET /api/analytics/performance-metrics?startDate=2024-01-01
   */
  static async getPerformanceMetrics(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      const whereClause: any = {};

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
      }

      const [allOrders, statusBreakdown, paymentBreakdown] = await Promise.all([
        prisma.order.findMany({
          where: whereClause,
          select: {
            status: true,
            paymentStatus: true,
            createdAt: true,
            updatedAt: true,
          },
        }),

        prisma.order.groupBy({
          by: ["status"],
          where: whereClause,
          _count: { id: true },
        }),

        prisma.order.groupBy({
          by: ["paymentStatus"],
          where: whereClause,
          _count: { id: true },
        }),
      ]);

      const totalOrders = allOrders.length;
      const cancelledOrders = allOrders.filter(
        (o) => o.status === "CANCELLED"
      ).length;
      const completedOrders = allOrders.filter(
        (o) => o.status === "DELIVERED"
      ).length;
      const pendingOrders = allOrders.filter(
        (o) =>
          o.status === "PENDING" ||
          o.status === "CONFIRMED" ||
          o.status === "PREPARING"
      ).length;

      const deliveredOrders = allOrders.filter(
        (o) => o.status === "DELIVERED"
      );
      const avgProcessingTime =
        deliveredOrders.reduce((sum, order) => {
          const diffMs = order.updatedAt.getTime() - order.createdAt.getTime();
          return sum + diffMs;
        }, 0) / (deliveredOrders.length || 1);

      const avgProcessingMinutes = Math.round(avgProcessingTime / 1000 / 60);

      return NextResponse.json({
        summary: {
          totalOrders,
          completedOrders,
          cancelledOrders,
          pendingOrders,
          cancellationRate: (cancelledOrders / (totalOrders || 1)) * 100,
          completionRate: (completedOrders / (totalOrders || 1)) * 100,
          averageProcessingTime: `${avgProcessingMinutes} minutes`,
        },
        statusBreakdown: statusBreakdown.map((s) => ({
          status: s.status,
          count: s._count.id,
          percentage: (s._count.id / (totalOrders || 1)) * 100,
        })),
        paymentBreakdown: paymentBreakdown.map((p) => ({
          status: p.paymentStatus,
          count: p._count.id,
          percentage: (p._count.id / (totalOrders || 1)) * 100,
        })),
      });
    } catch (error) {
      console.error("Get performance metrics error:", error);
      return NextResponse.json(
        { error: "Failed to fetch performance metrics" },
        { status: 500 }
      );
    }
  }

  // ==================== COMPARISON ANALYTICS ====================

  /**
   * Compare periods (today vs yesterday, this week vs last week, etc.)
   * GET /api/analytics/compare-periods?type=daily
   */
  static async comparePeriods(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const type = searchParams.get("type") || "daily";

      let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;

      const now = new Date();

      switch (type) {
        case "daily":
          currentStart = new Date(now);
          currentStart.setHours(0, 0, 0, 0);
          currentEnd = new Date(now);
          currentEnd.setHours(23, 59, 59, 999);

          previousStart = new Date(currentStart);
          previousStart.setDate(previousStart.getDate() - 1);
          previousEnd = new Date(currentEnd);
          previousEnd.setDate(previousEnd.getDate() - 1);
          break;

        case "weekly":
          currentStart = new Date(now);
          currentStart.setDate(now.getDate() - now.getDay());
          currentStart.setHours(0, 0, 0, 0);
          currentEnd = new Date(now);

          previousStart = new Date(currentStart);
          previousStart.setDate(previousStart.getDate() - 7);
          previousEnd = new Date(currentStart);
          previousEnd.setMilliseconds(-1);
          break;

        case "monthly":
          currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
          currentEnd = new Date(now);

          previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
          break;

        default:
          currentStart = new Date(now);
          currentStart.setHours(0, 0, 0, 0);
          currentEnd = new Date(now);
          previousStart = new Date(currentStart);
          previousStart.setDate(previousStart.getDate() - 1);
          previousEnd = new Date(currentEnd);
          previousEnd.setDate(previousEnd.getDate() - 1);
      }

      const [currentPeriod, previousPeriod] = await Promise.all([
        this.getPeriodStats(currentStart, currentEnd),
        this.getPeriodStats(previousStart, previousEnd),
      ]);

      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      return NextResponse.json({
        comparison: {
          revenue: {
            current: currentPeriod.revenue,
            previous: previousPeriod.revenue,
            change: calculateChange(currentPeriod.revenue, previousPeriod.revenue),
          },
          orders: {
            current: currentPeriod.orders,
            previous: previousPeriod.orders,
            change: calculateChange(currentPeriod.orders, previousPeriod.orders),
          },
          averageOrderValue: {
            current: currentPeriod.averageOrderValue,
            previous: previousPeriod.averageOrderValue,
            change: calculateChange(
              currentPeriod.averageOrderValue,
              previousPeriod.averageOrderValue
            ),
          },
          itemsSold: {
            current: currentPeriod.itemsSold,
            previous: previousPeriod.itemsSold,
            change: calculateChange(
              currentPeriod.itemsSold,
              previousPeriod.itemsSold
            ),
          },
        },
        currentPeriod: {
          start: currentStart.toISOString(),
          end: currentEnd.toISOString(),
        },
        previousPeriod: {
          start: previousStart.toISOString(),
          end: previousEnd.toISOString(),
        },
      });
    } catch (error) {
      console.error("Compare periods error:", error);
      return NextResponse.json(
        { error: "Failed to compare periods" },
        { status: 500 }
      );
    }
  }

  // ==================== CUSTOM REPORTS ====================

  /**
   * Generate custom report with flexible date range and metrics
   * POST /api/analytics/custom-report
   */
  static async generateCustomReport(req: NextRequest) {
    try {
      const body = await req.json();
      const { startDate, endDate, metrics } = body;

      if (!startDate || !endDate) {
        return NextResponse.json(
          { error: "Start date and end date are required" },
          { status: 400 }
        );
      }

      const whereClause: any = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };

      const report: any = {
        period: {
          start: startDate,
          end: endDate,
        },
        generatedAt: new Date().toISOString(),
        data: {},
      };

      if (!metrics || metrics.includes("revenue")) {
        const revenueData = await prisma.order.aggregate({
          where: { ...whereClause, status: { not: "CANCELLED" } },
          _sum: { total: true, subtotal: true, deliveryCharges: true },
          _count: { id: true },
          _avg: { total: true },
        });

        report.data.revenue = {
          total: revenueData._sum.total || 0,
          subtotal: revenueData._sum.subtotal || 0,
          deliveryCharges: revenueData._sum.deliveryCharges || 0,
          orderCount: revenueData._count.id,
          averageOrderValue: revenueData._avg.total || 0,
        };
      }

      if (!metrics || metrics.includes("orders")) {
        const orderStats = await prisma.order.groupBy({
          by: ["status"],
          where: whereClause,
          _count: { id: true },
        });

        report.data.orders = {
          byStatus: orderStats.map((s) => ({
            status: s.status,
            count: s._count.id,
          })),
          total: orderStats.reduce((sum, s) => sum + s._count.id, 0),
        };
      }

      if (!metrics || metrics.includes("products")) {
        const productStats = await prisma.orderItem.groupBy({
          by: ["foodItemId"],
          where: {
            order: { ...whereClause, status: { not: "CANCELLED" } },
          },
          _sum: { quantity: true, total: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 10,
        });

        const foodItemIds = productStats.map((p) => p.foodItemId);
        const foodItems = await prisma.foodItem.findMany({
          where: { id: { in: foodItemIds } },
          include: {
            category: true,
          },
        });

        report.data.products = {
          topSelling: productStats.map((p) => {
            const item = foodItems.find((f) => f.id === p.foodItemId);
            return {
              name: item?.name || "Unknown",
              category: item?.category?.name || "Unknown",
              quantitySold: p._sum.quantity || 0,
              revenue: p._sum.total || 0,
            };
          }),
        };
      }

      if (!metrics || metrics.includes("customers")) {
        const uniqueCustomers = await prisma.order.findMany({
          where: whereClause,
          select: { customerPhone: true },
          distinct: ["customerPhone"],
        });

        const repeatCustomers = await prisma.order.groupBy({
          by: ["customerPhone"],
          where: whereClause,
          _count: { id: true },
          having: {
            id: {
              _count: {
                gt: 1,
              },
            },
          },
        });

        report.data.customers = {
          unique: uniqueCustomers.length,
          repeat: repeatCustomers.length,
          repeatRate:
            (repeatCustomers.length / (uniqueCustomers.length || 1)) * 100,
        };
      }

      if (!metrics || metrics.includes("payments")) {
        const paymentStats = await prisma.order.groupBy({
          by: ["paymentMethod"],
          where: { ...whereClause, status: { not: "CANCELLED" } },
          _sum: { total: true },
          _count: { id: true },
        });

        report.data.payments = paymentStats.map((p) => ({
          method: p.paymentMethod,
          revenue: p._sum.total || 0,
          orderCount: p._count.id,
        }));
      }

      return NextResponse.json(report);
    } catch (error) {
      console.error("Generate custom report error:", error);
      return NextResponse.json(
        { error: "Failed to generate custom report" },
        { status: 500 }
      );
    }
  }

  /**
   * Export analytics data (CSV format)
   * GET /api/analytics/export?type=orders&startDate=2024-01-01
   */
  static async exportAnalytics(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const type = searchParams.get("type") || "orders";
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      const whereClause: any = {};

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
      }

      let csvContent = "";

      switch (type) {
        case "orders":
          const orders = await prisma.order.findMany({
            where: whereClause,
            include: {
              items: {
                include: {
                  foodItem: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          });

          csvContent =
            "Order Number,Date,Customer Name,Customer Phone,Status,Payment Method,Subtotal,Delivery,Total,Items\n";
          orders.forEach((order) => {
            const items = order.items
              .map((i) => `${i.quantity}x ${i.foodItem.name}`)
              .join("; ");
            csvContent += `${order.orderNumber},${order.createdAt.toISOString()},${order.customerName},${order.customerPhone},${order.status},${order.paymentMethod},${order.subtotal},${order.deliveryCharges},${order.total},"${items}"\n`;
          });
          break;

        case "revenue":
          const revenueData = await prisma.order.findMany({
            where: { ...whereClause, status: { not: "CANCELLED" } },
            select: {
              createdAt: true,
              orderNumber: true,
              total: true,
              subtotal: true,
              deliveryCharges: true,
            },
            orderBy: { createdAt: "asc" },
          });

          csvContent =
            "Date,Order Number,Subtotal,Delivery Charges,Total\n";
          revenueData.forEach((order) => {
            csvContent += `${order.createdAt.toISOString().split("T")[0]},${order.orderNumber},${order.subtotal},${order.deliveryCharges},${order.total}\n`;
          });
          break;

        case "products":
          const productStats = await prisma.orderItem.groupBy({
            by: ["foodItemId"],
            where: {
              order: { ...whereClause, status: { not: "CANCELLED" } },
            },
            _sum: { quantity: true, total: true },
            _count: { id: true },
            orderBy: { _sum: { quantity: "desc" } },
          });

          const foodItemIds = productStats.map((p) => p.foodItemId);
          const foodItems = await prisma.foodItem.findMany({
            where: { id: { in: foodItemIds } },
            include: {
              category: true,
            },
          });

          csvContent =
            "Product Name,Category,Quantity Sold,Revenue,Order Count\n";
          productStats.forEach((stat) => {
            const item = foodItems.find((f) => f.id === stat.foodItemId);
            csvContent += `${item?.name || "Unknown"},${item?.category?.name || "Unknown"},${stat._sum.quantity || 0},${stat._sum.total || 0},${stat._count.id}\n`;
          });
          break;

        default:
          return NextResponse.json(
            { error: "Invalid export type" },
            { status: 400 }
          );
      }

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${type}-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    } catch (error) {
      console.error("Export analytics error:", error);
      return NextResponse.json(
        { error: "Failed to export analytics" },
        { status: 500 }
      );
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Helper: Group orders by time period
   */
  private static groupByPeriod(
    orders: any[],
    period: string
  ): RevenueByPeriod[] {
    const grouped = new Map<string, { revenue: number; orders: number }>();

    orders.forEach((order) => {
      let key: string;

      switch (period) {
        case "daily":
          key = order.createdAt.toISOString().split("T")[0];
          break;
        case "weekly":
          const weekStart = new Date(order.createdAt);
          weekStart.setDate(
            weekStart.getDate() - weekStart.getDay()
          );
          key = weekStart.toISOString().split("T")[0];
          break;
        case "monthly":
          key = `${order.createdAt.getFullYear()}-${String(
            order.createdAt.getMonth() + 1
          ).padStart(2, "0")}`;
          break;
        case "yearly":
          key = order.createdAt.getFullYear().toString();
          break;
        default:
          key = order.createdAt.toISOString().split("T")[0];
      }

      if (!grouped.has(key)) {
        grouped.set(key, { revenue: 0, orders: 0 });
      }

      const data = grouped.get(key)!;
      data.revenue += order.total;
      data.orders += 1;
    });

    return Array.from(grouped.entries())
      .map(([period, data]) => ({
        period,
        revenue: data.revenue,
        orders: data.orders,
        averageOrderValue: data.revenue / data.orders,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Helper: Get stats for a specific period
   */
  private static async getPeriodStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    revenue: number;
    orders: number;
    averageOrderValue: number;
    itemsSold: number;
  }> {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: { not: "CANCELLED" },
      },
      include: {
        items: {
          select: {
            quantity: true,
          },
        },
      },
    });

    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const itemsSold = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

    return {
      revenue,
      orders: orders.length,
      averageOrderValue: revenue / (orders.length || 1),
      itemsSold,
    };
  }
}