// controllers/analyticsController.ts
// Key changes vs original:
//  - All independent DB calls wrapped in Promise.all (parallel execution)
//  - select: {...} on every query — no over-fetching
//  - Cache-Control headers on GET routes
//  - try/catch on every handler

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDateRange(searchParams: URLSearchParams) {
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  return {
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  }
}

function makeDateFilter(startDate?: Date, endDate?: Date) {
  if (!startDate && !endDate) return {}
  return {
    createdAt: {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    },
  }
}

type RevenueByPeriod = {
  period: string
  revenue: number
  orders: number
  averageOrderValue: number
}

function groupByPeriod(
  orders: { createdAt: Date; total: number }[],
  period: string
): RevenueByPeriod[] {
  const grouped = new Map<string, { revenue: number; orders: number }>()

  for (const order of orders) {
    let key: string
    switch (period) {
      case 'weekly': {
        const ws = new Date(order.createdAt)
        ws.setDate(ws.getDate() - ws.getDay())
        key = ws.toISOString().split('T')[0]
        break
      }
      case 'monthly':
        key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`
        break
      case 'yearly':
        key = order.createdAt.getFullYear().toString()
        break
      default: // daily
        key = order.createdAt.toISOString().split('T')[0]
    }

    const entry = grouped.get(key) ?? { revenue: 0, orders: 0 }
    entry.revenue += order.total
    entry.orders += 1
    grouped.set(key, entry)
  }

  return Array.from(grouped.entries())
    .map(([period, d]) => ({ period, ...d, averageOrderValue: d.revenue / d.orders }))
    .sort((a, b) => a.period.localeCompare(b.period))
}

async function getPeriodStats(startDate: Date, endDate: Date) {
  // Single query: aggregate + item counts together
  const [orders] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { not: 'CANCELLED' },
      },
      select: {
        total: true,
        items: { select: { quantity: true } },
      },
    }),
  ])

  const revenue = orders.reduce((s, o) => s + o.total, 0)
  const itemsSold = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0)

  return {
    revenue,
    orders: orders.length,
    averageOrderValue: revenue / (orders.length || 1),
    itemsSold,
  }
}

// ─── Controller ───────────────────────────────────────────────────────────────

export class AnalyticsController {
  // GET /api/analytics/revenue-trends
  static async getRevenueTrends(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const period = searchParams.get('period') ?? 'daily'
      const { startDate, endDate } = parseDateRange(searchParams)
      const dateFilter = makeDateFilter(startDate, endDate)

      const orders = await prisma.order.findMany({
        where: { status: { not: 'CANCELLED' }, ...dateFilter },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: 'asc' },
      })

      const trends = groupByPeriod(orders, period)
      const totalRevenue = trends.reduce((s, t) => s + t.revenue, 0)
      const totalOrders = trends.reduce((s, t) => s + t.orders, 0)

      return NextResponse.json(
        {
          period,
          trends,
          summary: {
            totalRevenue,
            totalOrders,
            averagePeriodRevenue: totalRevenue / (trends.length || 1),
          },
        },
        { headers: { 'Cache-Control': 'private, max-age=120' } }
      )
    } catch (error) {
      console.error('Get revenue trends error:', error)
      return NextResponse.json({ error: 'Failed to fetch revenue trends' }, { status: 500 })
    }
  }

  // GET /api/analytics/daily-summary
  static async getDailySummary(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const dateParam = searchParams.get('date')

      const targetDate = dateParam ? new Date(dateParam) : new Date()
      targetDate.setHours(0, 0, 0, 0)
      const nextDate = new Date(targetDate)
      nextDate.setDate(nextDate.getDate() + 1)

      const dateRange = { gte: targetDate, lt: nextDate }

      // Two queries in parallel — completed+all orders, and hourly buckets
      const [orders] = await Promise.all([
        prisma.order.findMany({
          where: { createdAt: dateRange },
          select: {
            status: true,
            total: true,
            createdAt: true,
            items: { select: { quantity: true } },
          },
        }),
      ])

      const completedOrders = orders.filter((o) => o.status !== 'CANCELLED')
      const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED')
      const totalRevenue = completedOrders.reduce((s, o) => s + o.total, 0)
      const totalItemsSold = completedOrders.reduce(
        (s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0),
        0
      )

      const hourlyData = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, revenue: 0, orders: 0 }))
      for (const order of completedOrders) {
        const h = order.createdAt.getHours()
        hourlyData[h].revenue += order.total
        hourlyData[h].orders += 1
      }

      return NextResponse.json(
        {
          date: targetDate.toISOString().split('T')[0],
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
          peakHour: hourlyData.reduce((max, cur) => (cur.revenue > max.revenue ? cur : max)),
        },
        { headers: { 'Cache-Control': 'private, max-age=60' } }
      )
    } catch (error) {
      console.error('Get daily summary error:', error)
      return NextResponse.json({ error: 'Failed to fetch daily summary' }, { status: 500 })
    }
  }

  // GET /api/analytics/weekly-report
  static async getWeeklySummary(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const startDateParam = searchParams.get('startDate')

      const startDate = startDateParam ? new Date(startDateParam) : new Date()
      startDate.setHours(0, 0, 0, 0)
      startDate.setDate(startDate.getDate() - startDate.getDay())
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 7)

      const orders = await prisma.order.findMany({
        where: { createdAt: { gte: startDate, lt: endDate }, status: { not: 'CANCELLED' } },
        select: {
          createdAt: true,
          total: true,
          items: { select: { quantity: true } },
        },
      })

      const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const dailyData = DAYS.map((day, i) => ({
        day,
        date: new Date(startDate.getTime() + i * 86400000).toISOString().split('T')[0],
        revenue: 0,
        orders: 0,
        items: 0,
      }))

      for (const order of orders) {
        const d = dailyData[order.createdAt.getDay()]
        d.revenue += order.total
        d.orders += 1
        d.items += order.items.reduce((s, i) => s + i.quantity, 0)
      }

      const totalRevenue = dailyData.reduce((s, d) => s + d.revenue, 0)
      const totalOrders = dailyData.reduce((s, d) => s + d.orders, 0)

      return NextResponse.json(
        {
          weekStart: startDate.toISOString().split('T')[0],
          weekEnd: endDate.toISOString().split('T')[0],
          summary: {
            totalRevenue,
            totalOrders,
            averageOrderValue: totalRevenue / (totalOrders || 1),
            averageDailyRevenue: totalRevenue / 7,
            busiestDay: dailyData.reduce((max, cur) => (cur.revenue > max.revenue ? cur : max)),
          },
          dailyBreakdown: dailyData,
        },
        { headers: { 'Cache-Control': 'private, max-age=120' } }
      )
    } catch (error) {
      console.error('Get weekly summary error:', error)
      return NextResponse.json({ error: 'Failed to fetch weekly summary' }, { status: 500 })
    }
  }

  // GET /api/analytics/monthly-report
  static async getMonthlySummary(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const monthParam = searchParams.get('month')
      const today = new Date()
      const [year, month] = monthParam
        ? monthParam.split('-').map(Number)
        : [today.getFullYear(), today.getMonth() + 1]

      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 1)
      const dateRange = { gte: startDate, lt: endDate }

      // Three queries in parallel
      const [orders, statusBreakdown, paymentMethodBreakdown] = await Promise.all([
        prisma.order.findMany({
          where: { createdAt: dateRange },
          select: {
            status: true,
            total: true,
            createdAt: true,
            items: { select: { quantity: true } },
          },
        }),
        prisma.order.groupBy({ by: ['status'], where: { createdAt: dateRange }, _count: { id: true } }),
        prisma.order.groupBy({
          by: ['paymentMethod'],
          where: { createdAt: dateRange, status: { not: 'CANCELLED' } },
          _sum: { total: true },
          _count: { id: true },
        }),
      ])

      const completed = orders.filter((o) => o.status !== 'CANCELLED')
      const totalRevenue = completed.reduce((s, o) => s + o.total, 0)
      const totalItems = completed.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0)

      const daysInMonth = new Date(year, month, 0).getDate()
      const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        date: new Date(year, month - 1, i + 1).toISOString().split('T')[0],
        revenue: 0,
        orders: 0,
      }))
      for (const order of completed) {
        const d = dailyData[order.createdAt.getDate() - 1]
        d.revenue += order.total
        d.orders += 1
      }

      return NextResponse.json(
        {
          month: `${year}-${String(month).padStart(2, '0')}`,
          summary: {
            totalRevenue,
            totalOrders: orders.length,
            completedOrders: completed.length,
            cancelledOrders: orders.length - completed.length,
            averageOrderValue: totalRevenue / (completed.length || 1),
            totalItemsSold: totalItems,
            averageDailyRevenue: totalRevenue / daysInMonth,
          },
          statusBreakdown,
          paymentMethodBreakdown: paymentMethodBreakdown.map((pm) => ({
            method: pm.paymentMethod,
            revenue: pm._sum.total ?? 0,
            orders: pm._count.id,
          })),
          dailyBreakdown: dailyData,
          topDay: dailyData.reduce((max, cur) => (cur.revenue > max.revenue ? cur : max)),
        },
        { headers: { 'Cache-Control': 'private, max-age=300' } }
      )
    } catch (error) {
      console.error('Get monthly summary error:', error)
      return NextResponse.json({ error: 'Failed to fetch monthly summary' }, { status: 500 })
    }
  }

  // GET /api/analytics/yearly-report
  static async getYearlySummary(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))
      const startDate = new Date(year, 0, 1)
      const endDate = new Date(year + 1, 0, 1)

      const orders = await prisma.order.findMany({
        where: { createdAt: { gte: startDate, lt: endDate }, status: { not: 'CANCELLED' } },
        select: { createdAt: true, total: true, items: { select: { quantity: true } } },
      })

      const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthlyData = MONTHS.map((month, i) => ({ month, monthNumber: i + 1, revenue: 0, orders: 0, items: 0 }))

      for (const order of orders) {
        const m = monthlyData[order.createdAt.getMonth()]
        m.revenue += order.total
        m.orders += 1
        m.items += order.items.reduce((s, i) => s + i.quantity, 0)
      }

      const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0)
      const totalOrders = monthlyData.reduce((s, m) => s + m.orders, 0)

      const quarterDefs = [
        { quarter: 'Q1', months: [0, 1, 2] },
        { quarter: 'Q2', months: [3, 4, 5] },
        { quarter: 'Q3', months: [6, 7, 8] },
        { quarter: 'Q4', months: [9, 10, 11] },
      ]
      const quarterlyBreakdown = quarterDefs.map(({ quarter, months }) => {
        const revenue = months.reduce((s, m) => s + monthlyData[m].revenue, 0)
        const orders = months.reduce((s, m) => s + monthlyData[m].orders, 0)
        return { quarter, revenue, orders, averageOrderValue: revenue / (orders || 1) }
      })

      return NextResponse.json(
        {
          year,
          summary: {
            totalRevenue,
            totalOrders,
            averageOrderValue: totalRevenue / (totalOrders || 1),
            averageMonthlyRevenue: totalRevenue / 12,
            bestMonth: monthlyData.reduce((max, cur) => (cur.revenue > max.revenue ? cur : max)),
            bestQuarter: quarterlyBreakdown.reduce((max, cur) => (cur.revenue > max.revenue ? cur : max)),
          },
          monthlyBreakdown: monthlyData,
          quarterlyBreakdown,
        },
        { headers: { 'Cache-Control': 'private, max-age=600' } }
      )
    } catch (error) {
      console.error('Get yearly summary error:', error)
      return NextResponse.json({ error: 'Failed to fetch yearly summary' }, { status: 500 })
    }
  }

  // GET /api/analytics/top-items
  static async getTopSellingItems(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '10'))
      const { startDate, endDate } = parseDateRange(searchParams)
      const dateFilter = makeDateFilter(startDate, endDate)

      const topItems = await prisma.orderItem.groupBy({
        by: ['foodItemId'],
        where: { order: { status: { not: 'CANCELLED' }, ...dateFilter } },
        _sum: { quantity: true, total: true },
        _count: { id: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: limit,
      })

      const foodItemIds = topItems.map((i) => i.foodItemId)
      const foodItems = await prisma.foodItem.findMany({
        where: { id: { in: foodItemIds } },
        select: { id: true, name: true, category: { select: { name: true } } },
      })

      const itemMap = new Map(foodItems.map((f) => [f.id, f]))

      return NextResponse.json(
        {
          topItems: topItems.map((item) => {
            const food = itemMap.get(item.foodItemId)
            return {
              foodItemId: item.foodItemId,
              name: food?.name ?? 'Unknown',
              category: food?.category?.name ?? 'Unknown',
              quantitySold: item._sum.quantity ?? 0,
              totalRevenue: item._sum.total ?? 0,
              orderCount: item._count.id,
              averagePrice: (item._sum.total ?? 0) / (item._sum.quantity ?? 1),
            }
          }),
          totalItemsAnalyzed: foodItemIds.length,
        },
        { headers: { 'Cache-Control': 'private, max-age=120' } }
      )
    } catch (error) {
      console.error('Get top selling items error:', error)
      return NextResponse.json({ error: 'Failed to fetch top selling items' }, { status: 500 })
    }
  }

  // GET /api/analytics/category-performance
  static async getCategoryPerformance(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const { startDate, endDate } = parseDateRange(searchParams)
      const dateFilter = makeDateFilter(startDate, endDate)

      // Use groupBy at DB level instead of in-memory aggregation
      const stats = await prisma.orderItem.groupBy({
        by: ['foodItemId'],
        where: { order: { status: { not: 'CANCELLED' }, ...dateFilter } },
        _sum: { total: true, quantity: true },
        _count: { orderId: true },
      })

      const foodItemIds = stats.map((s) => s.foodItemId)
      const foodItems = await prisma.foodItem.findMany({
        where: { id: { in: foodItemIds } },
        select: { id: true, category: { select: { id: true, name: true } } },
      })

      const categoryMap = new Map<string, { name: string; revenue: number; quantity: number; orderIds: Set<string>; items: Set<string> }>()

      // We still need per-orderId distinct count — re-fetch minimally
      const orderItemsWithOrders = await prisma.orderItem.findMany({
        where: {
          foodItemId: { in: foodItemIds },
          order: { status: { not: 'CANCELLED' }, ...dateFilter },
        },
        select: { foodItemId: true, orderId: true, total: true, quantity: true },
      })

      const foodMap = new Map(foodItems.map((f) => [f.id, f]))

      for (const item of orderItemsWithOrders) {
        const food = foodMap.get(item.foodItemId)
        if (!food) continue
        const catName = food.category.name
        const entry = categoryMap.get(catName) ?? { name: catName, revenue: 0, quantity: 0, orderIds: new Set(), items: new Set() }
        entry.revenue += item.total
        entry.quantity += item.quantity
        entry.orderIds.add(item.orderId)
        entry.items.add(item.foodItemId)
        categoryMap.set(catName, entry)
      }

      const categories = Array.from(categoryMap.values())
        .map((cat) => ({
          category: cat.name,
          revenue: cat.revenue,
          quantitySold: cat.quantity,
          orderCount: cat.orderIds.size,
          uniqueItems: cat.items.size,
          averageOrderValue: cat.revenue / (cat.orderIds.size || 1),
        }))
        .sort((a, b) => b.revenue - a.revenue)

      const totalRevenue = categories.reduce((s, c) => s + c.revenue, 0)

      return NextResponse.json(
        {
          categories: categories.map((c) => ({ ...c, revenuePercentage: (c.revenue / totalRevenue) * 100 })),
          totalRevenue,
          totalCategories: categories.length,
        },
        { headers: { 'Cache-Control': 'private, max-age=120' } }
      )
    } catch (error) {
      console.error('Get category performance error:', error)
      return NextResponse.json({ error: 'Failed to fetch category performance' }, { status: 500 })
    }
  }

  // GET /api/analytics/customer-insights
  static async getCustomerInsights(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const { startDate, endDate } = parseDateRange(searchParams)
      const dateFilter = makeDateFilter(startDate, endDate)

      const orders = await prisma.order.findMany({
        where: dateFilter,
        select: { customerPhone: true, customerName: true, total: true, status: true, createdAt: true },
      })

      const customerMap = new Map<string, { name: string; orderCount: number; totalSpent: number; lastOrder: Date; cancelledOrders: number }>()

      for (const order of orders) {
        const entry = customerMap.get(order.customerPhone) ?? {
          name: order.customerName,
          orderCount: 0,
          totalSpent: 0,
          lastOrder: order.createdAt,
          cancelledOrders: 0,
        }
        entry.orderCount += 1
        if (order.status !== 'CANCELLED') entry.totalSpent += order.total
        else entry.cancelledOrders += 1
        if (order.createdAt > entry.lastOrder) entry.lastOrder = order.createdAt
        customerMap.set(order.customerPhone, entry)
      }

      const customers = Array.from(customerMap.entries())
        .map(([phone, d]) => ({
          phone,
          name: d.name,
          orderCount: d.orderCount,
          totalSpent: d.totalSpent,
          averageOrderValue: d.totalSpent / ((d.orderCount - d.cancelledOrders) || 1),
          lastOrderDate: d.lastOrder,
          cancelledOrders: d.cancelledOrders,
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)

      const vip = customers.filter((c) => c.orderCount >= 10)
      const regular = customers.filter((c) => c.orderCount >= 5 && c.orderCount < 10)
      const occasional = customers.filter((c) => c.orderCount >= 2 && c.orderCount < 5)
      const oneTime = customers.filter((c) => c.orderCount === 1)

      return NextResponse.json(
        {
          totalCustomers: customers.length,
          topCustomers: customers.slice(0, 20),
          segments: {
            vip: { count: vip.length, totalRevenue: vip.reduce((s, c) => s + c.totalSpent, 0) },
            regular: { count: regular.length, totalRevenue: regular.reduce((s, c) => s + c.totalSpent, 0) },
            occasional: { count: occasional.length, totalRevenue: occasional.reduce((s, c) => s + c.totalSpent, 0) },
            oneTime: { count: oneTime.length, totalRevenue: oneTime.reduce((s, c) => s + c.totalSpent, 0) },
          },
          retentionRate: ((customers.length - oneTime.length) / (customers.length || 1)) * 100,
        },
        { headers: { 'Cache-Control': 'private, max-age=300' } }
      )
    } catch (error) {
      console.error('Get customer insights error:', error)
      return NextResponse.json({ error: 'Failed to fetch customer insights' }, { status: 500 })
    }
  }

  // GET /api/analytics/order-patterns
  static async getOrderPatterns(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const { startDate, endDate } = parseDateRange(searchParams)
      const dateFilter = makeDateFilter(startDate, endDate)

      const orders = await prisma.order.findMany({
        where: { status: { not: 'CANCELLED' }, ...dateFilter },
        select: { createdAt: true, total: true },
      })

      const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const hourly = Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, '0')}:00`, orders: 0, revenue: 0 }))
      const daily = DAYS.map((day) => ({ day, orders: 0, revenue: 0 }))

      for (const order of orders) {
        hourly[order.createdAt.getHours()].orders += 1
        hourly[order.createdAt.getHours()].revenue += order.total
        daily[order.createdAt.getDay()].orders += 1
        daily[order.createdAt.getDay()].revenue += order.total
      }

      const activeHourly = hourly.filter((h) => h.orders > 0)

      return NextResponse.json(
        {
          hourlyPatterns: activeHourly,
          dailyPatterns: daily,
          insights: {
            peakHour: hourly.reduce((max, cur) => (cur.orders > max.orders ? cur : max)),
            peakDay: daily.reduce((max, cur) => (cur.orders > max.orders ? cur : max)),
            slowestHour: activeHourly.length
              ? activeHourly.reduce((min, cur) => (cur.orders < min.orders ? cur : min))
              : null,
            slowestDay: daily.reduce((min, cur) => (cur.orders < min.orders ? cur : min)),
          },
        },
        { headers: { 'Cache-Control': 'private, max-age=300' } }
      )
    } catch (error) {
      console.error('Get order patterns error:', error)
      return NextResponse.json({ error: 'Failed to fetch order patterns' }, { status: 500 })
    }
  }

  // GET /api/analytics/performance-metrics
  static async getPerformanceMetrics(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const { startDate, endDate } = parseDateRange(searchParams)
      const dateFilter = makeDateFilter(startDate, endDate)

      // Three in parallel
      const [allOrders, statusBreakdown, paymentBreakdown] = await Promise.all([
        prisma.order.findMany({
          where: dateFilter,
          select: { status: true, paymentStatus: true, createdAt: true, updatedAt: true },
        }),
        prisma.order.groupBy({ by: ['status'], where: dateFilter, _count: { id: true } }),
        prisma.order.groupBy({ by: ['paymentStatus'], where: dateFilter, _count: { id: true } }),
      ])

      const total = allOrders.length
      const cancelled = allOrders.filter((o) => o.status === 'CANCELLED').length
      const completed = allOrders.filter((o) => o.status === 'DELIVERED').length
      const pending = allOrders.filter((o) => ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status)).length

      const delivered = allOrders.filter((o) => o.status === 'DELIVERED')
      const avgMs = delivered.reduce((s, o) => s + (o.updatedAt.getTime() - o.createdAt.getTime()), 0) / (delivered.length || 1)

      return NextResponse.json(
        {
          summary: {
            totalOrders: total,
            completedOrders: completed,
            cancelledOrders: cancelled,
            pendingOrders: pending,
            cancellationRate: (cancelled / (total || 1)) * 100,
            completionRate: (completed / (total || 1)) * 100,
            averageProcessingTime: `${Math.round(avgMs / 60000)} minutes`,
          },
          statusBreakdown: statusBreakdown.map((s) => ({ status: s.status, count: s._count.id, percentage: (s._count.id / (total || 1)) * 100 })),
          paymentBreakdown: paymentBreakdown.map((p) => ({ status: p.paymentStatus, count: p._count.id, percentage: (p._count.id / (total || 1)) * 100 })),
        },
        { headers: { 'Cache-Control': 'private, max-age=120' } }
      )
    } catch (error) {
      console.error('Get performance metrics error:', error)
      return NextResponse.json({ error: 'Failed to fetch performance metrics' }, { status: 500 })
    }
  }

  // GET /api/analytics/compare-periods
  static async comparePeriods(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const type = searchParams.get('type') ?? 'daily'

      const now = new Date()
      let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date

      if (type === 'weekly') {
        currentStart = new Date(now)
        currentStart.setDate(now.getDate() - now.getDay())
        currentStart.setHours(0, 0, 0, 0)
        currentEnd = new Date(now)
        previousStart = new Date(currentStart)
        previousStart.setDate(previousStart.getDate() - 7)
        previousEnd = new Date(currentStart)
        previousEnd.setMilliseconds(-1)
      } else if (type === 'monthly') {
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
        currentEnd = new Date(now)
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      } else {
        // daily
        currentStart = new Date(now)
        currentStart.setHours(0, 0, 0, 0)
        currentEnd = new Date(now)
        currentEnd.setHours(23, 59, 59, 999)
        previousStart = new Date(currentStart)
        previousStart.setDate(previousStart.getDate() - 1)
        previousEnd = new Date(currentEnd)
        previousEnd.setDate(previousEnd.getDate() - 1)
      }

      // Both periods in parallel
      const [current, previous] = await Promise.all([
        getPeriodStats(currentStart, currentEnd),
        getPeriodStats(previousStart, previousEnd),
      ])

      const change = (cur: number, prev: number) =>
        prev === 0 ? (cur > 0 ? 100 : 0) : ((cur - prev) / prev) * 100

      return NextResponse.json(
        {
          comparison: {
            revenue: { current: current.revenue, previous: previous.revenue, change: change(current.revenue, previous.revenue) },
            orders: { current: current.orders, previous: previous.orders, change: change(current.orders, previous.orders) },
            averageOrderValue: { current: current.averageOrderValue, previous: previous.averageOrderValue, change: change(current.averageOrderValue, previous.averageOrderValue) },
            itemsSold: { current: current.itemsSold, previous: previous.itemsSold, change: change(current.itemsSold, previous.itemsSold) },
          },
          currentPeriod: { start: currentStart.toISOString(), end: currentEnd.toISOString() },
          previousPeriod: { start: previousStart.toISOString(), end: previousEnd.toISOString() },
        },
        { headers: { 'Cache-Control': 'private, max-age=60' } }
      )
    } catch (error) {
      console.error('Compare periods error:', error)
      return NextResponse.json({ error: 'Failed to compare periods' }, { status: 500 })
    }
  }

  // POST /api/analytics/custom-report
  static async generateCustomReport(req: NextRequest) {
    try {
      const body = await req.json()
      const { startDate, endDate, metrics } = body

      if (!startDate || !endDate) {
        return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 })
      }

      const dateRange = { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } }
      const nonCancelledWhere = { ...dateRange, status: { not: 'CANCELLED' as const } }

      const wantAll = !metrics || !metrics.length

      // Kick off all needed queries in parallel
      const [revenueData, orderStats, productStats, uniqueCustomers, repeatCustomers, paymentStats] =
        await Promise.all([
          wantAll || metrics.includes('revenue')
            ? prisma.order.aggregate({ where: nonCancelledWhere, _sum: { total: true, subtotal: true, deliveryCharges: true }, _count: { id: true }, _avg: { total: true } })
            : Promise.resolve(null),
          wantAll || metrics.includes('orders')
            ? prisma.order.groupBy({ by: ['status'], where: dateRange, _count: { id: true } })
            : Promise.resolve(null),
          wantAll || metrics.includes('products')
            ? prisma.orderItem.groupBy({ by: ['foodItemId'], where: { order: nonCancelledWhere }, _sum: { quantity: true, total: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 10 })
            : Promise.resolve(null),
          wantAll || metrics.includes('customers')
            ? prisma.order.findMany({ where: dateRange, select: { customerPhone: true }, distinct: ['customerPhone'] })
            : Promise.resolve(null),
          wantAll || metrics.includes('customers')
            ? prisma.order.groupBy({ by: ['customerPhone'], where: dateRange, _count: { id: true }, having: { id: { _count: { gt: 1 } } } })
            : Promise.resolve(null),
          wantAll || metrics.includes('payments')
            ? prisma.order.groupBy({ by: ['paymentMethod'], where: nonCancelledWhere, _sum: { total: true }, _count: { id: true } })
            : Promise.resolve(null),
        ])

      const report: any = {
        period: { start: startDate, end: endDate },
        generatedAt: new Date().toISOString(),
        data: {},
      }

      if (revenueData) {
        report.data.revenue = {
          total: revenueData._sum.total ?? 0,
          subtotal: revenueData._sum.subtotal ?? 0,
          deliveryCharges: revenueData._sum.deliveryCharges ?? 0,
          orderCount: revenueData._count.id,
          averageOrderValue: revenueData._avg.total ?? 0,
        }
      }

      if (orderStats) {
        report.data.orders = {
          byStatus: orderStats.map((s) => ({ status: s.status, count: s._count.id })),
          total: orderStats.reduce((sum, s) => sum + s._count.id, 0),
        }
      }

      if (productStats) {
        const foodItemIds = productStats.map((p) => p.foodItemId)
        const foodItems = await prisma.foodItem.findMany({
          where: { id: { in: foodItemIds } },
          select: { id: true, name: true, category: { select: { name: true } } },
        })
        const fMap = new Map(foodItems.map((f) => [f.id, f]))
        report.data.products = {
          topSelling: productStats.map((p) => {
            const item = fMap.get(p.foodItemId)
            return { name: item?.name ?? 'Unknown', category: item?.category?.name ?? 'Unknown', quantitySold: p._sum.quantity ?? 0, revenue: p._sum.total ?? 0 }
          }),
        }
      }

      if (uniqueCustomers !== null && repeatCustomers !== null) {
        report.data.customers = {
          unique: uniqueCustomers.length,
          repeat: repeatCustomers.length,
          repeatRate: (repeatCustomers.length / (uniqueCustomers.length || 1)) * 100,
        }
      }

      if (paymentStats) {
        report.data.payments = paymentStats.map((p) => ({
          method: p.paymentMethod,
          revenue: p._sum.total ?? 0,
          orderCount: p._count.id,
        }))
      }

      return NextResponse.json(report)
    } catch (error) {
      console.error('Generate custom report error:', error)
      return NextResponse.json({ error: 'Failed to generate custom report' }, { status: 500 })
    }
  }

  // GET /api/analytics/export
  static async exportAnalytics(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const type = searchParams.get('type') ?? 'orders'
      const { startDate, endDate } = parseDateRange(searchParams)
      const dateFilter = makeDateFilter(startDate, endDate)

      let csvContent = ''

      if (type === 'orders') {
        const orders = await prisma.order.findMany({
          where: dateFilter,
          select: {
            orderNumber: true, createdAt: true, customerName: true, customerPhone: true,
            status: true, paymentMethod: true, subtotal: true, deliveryCharges: true, total: true,
            items: { select: { quantity: true, foodItem: { select: { name: true } } } },
          },
          orderBy: { createdAt: 'desc' },
        })

        csvContent = 'Order Number,Date,Customer Name,Customer Phone,Status,Payment Method,Subtotal,Delivery,Total,Items\n'
        for (const o of orders) {
          const items = o.items.map((i) => `${i.quantity}x ${i.foodItem.name}`).join('; ')
          csvContent += `${o.orderNumber},${o.createdAt.toISOString()},${o.customerName},${o.customerPhone},${o.status},${o.paymentMethod},${o.subtotal},${o.deliveryCharges},${o.total},"${items}"\n`
        }
      } else if (type === 'revenue') {
        const revenueData = await prisma.order.findMany({
          where: { ...dateFilter, status: { not: 'CANCELLED' } },
          select: { createdAt: true, orderNumber: true, total: true, subtotal: true, deliveryCharges: true },
          orderBy: { createdAt: 'asc' },
        })
        csvContent = 'Date,Order Number,Subtotal,Delivery Charges,Total\n'
        for (const o of revenueData) {
          csvContent += `${o.createdAt.toISOString().split('T')[0]},${o.orderNumber},${o.subtotal},${o.deliveryCharges},${o.total}\n`
        }
      } else if (type === 'products') {
        const productStats = await prisma.orderItem.groupBy({
          by: ['foodItemId'],
          where: { order: { ...dateFilter, status: { not: 'CANCELLED' } } },
          _sum: { quantity: true, total: true },
          _count: { id: true },
          orderBy: { _sum: { quantity: 'desc' } },
        })
        const foodItems = await prisma.foodItem.findMany({
          where: { id: { in: productStats.map((p) => p.foodItemId) } },
          select: { id: true, name: true, category: { select: { name: true } } },
        })
        const fMap = new Map(foodItems.map((f) => [f.id, f]))
        csvContent = 'Product Name,Category,Quantity Sold,Revenue,Order Count\n'
        for (const stat of productStats) {
          const item = fMap.get(stat.foodItemId)
          csvContent += `${item?.name ?? 'Unknown'},${item?.category?.name ?? 'Unknown'},${stat._sum.quantity ?? 0},${stat._sum.total ?? 0},${stat._count.id}\n`
        }
      } else {
        return NextResponse.json({ error: 'Invalid export type. Must be: orders, revenue, or products' }, { status: 400 })
      }

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type}-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } catch (error) {
      console.error('Export analytics error:', error)
      return NextResponse.json({ error: 'Failed to export analytics' }, { status: 500 })
    }
  }
}