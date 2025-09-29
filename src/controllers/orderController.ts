import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { CartModel } from "@/models/cart";

// Interfaces for type safety
interface CreateOrderInput {
  sessionId: string; // Add this line
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  latitude?: number;
  longitude?: number;
  items: Array<{
    foodItemId: string;
    quantity: number;
  }>;
  paymentMethod?:
    | "CASH_ON_DELIVERY"
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "PAYPAL"
    | "STRIPE";
  notes?: string;
}

interface GetOrdersFilters {
  page?: number;
  limit?: number;
  status?:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";
  dateFrom?: Date;
  dateTo?: Date;
}

// Helper function to calculate delivery charge
function calculateDeliveryCharge(distance: number): number {
  if (distance <= 4) {
    return 0; // Free delivery within 4km
  } else if (distance > 4 && distance <= 6) {
    return 50; // 50 rupees for 4-6km
  } else {
    return 120; // 120 rupees for above 6km
  }
}

// Helper function to calculate distance (simplified for demo)
function calculateDistance(
  restaurantLocation: string,
  deliveryAddress: string,
  latitude?: number,
  longitude?: number
): number {
  // If coordinates are provided, use simplified calculation
  if (latitude && longitude) {
    // Restaurant coordinates (should come from database or config)
    const restaurantLat = 31.391427; // FSD coordinates
    const restaurantLng = 72.991881;

    // Simplified distance calculation (for demo purposes)
    // In a real app, use Haversine formula
    const latDiff = Math.abs(latitude - restaurantLat);
    const lngDiff = Math.abs(longitude - restaurantLng);
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Approx km per degree

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  // Fallback: For demo purposes, return a random distance between 1-10km
  return Math.floor(Math.random() * 10) + 1;
}

// Helper function to generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).slice(-4); // Last 4 chars
  const randomStr = Math.random().toString(36).substring(2, 6); // 4 random chars
  return `ORD-${timestamp}${randomStr}`.toUpperCase();
}

export class OrderController {
  // Create a new order
  static async createOrder(req: NextRequest) {
  try {
    console.log("📥 Incoming request to createOrder");

    const orderData: CreateOrderInput = await req.json();
    console.log("✅ Parsed orderData:", orderData);

    // Validate required fields
    if (
      !orderData.customerName ||
      !orderData.customerPhone ||
      !orderData.deliveryAddress
    ) {
      console.warn("⚠️ Missing customer details:", {
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.deliveryAddress,
      });
      return NextResponse.json(
        { error: "Customer name, phone, and delivery address are required" },
        { status: 400 }
      );
    }

    if (!orderData.items || orderData.items.length === 0) {
      console.warn("⚠️ Empty items array");
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    if (!orderData.sessionId) {
      console.warn("⚠️ Missing sessionId");
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    console.log("📍 Validations passed");

    // Calculate distance (for tracking purposes, but delivery is free)
    const restaurantLocation = "Restaurant Address";
    const distance = calculateDistance(
      restaurantLocation,
      orderData.deliveryAddress,
      orderData.latitude,
      orderData.longitude
    );
    console.log("📏 Distance calculated:", distance);

    // Set delivery charges to 0 (FREE DELIVERY)
    const deliveryCharges = 0;
    console.log("🆓 Delivery charges: FREE (", deliveryCharges, ")");

    // Get food items with current prices
    const foodItems = await prisma.foodItem.findMany({
      where: {
        id: {
          in: orderData.items.map((item) => item.foodItemId),
        },
        isAvailable: true,
      },
    });
    console.log("🍔 Retrieved foodItems:", foodItems);

    // Calculate order totals
    let subtotal = 0;
    const orderItems = orderData.items.map((item) => {
      const foodItem = foodItems.find((fi) => fi.id === item.foodItemId);
      if (!foodItem) {
        console.error(`❌ Food item with ID ${item.foodItemId} not found`);
        throw new Error(
          `Food item with ID ${item.foodItemId} not found or not available`
        );
      }

      const itemTotal = foodItem.price * item.quantity;
      subtotal += itemTotal;

      console.log(
        `🛒 Item added: ${foodItem.name}, Qty: ${item.quantity}, Total: ${itemTotal}`
      );

      return {
        foodItemId: item.foodItemId,
        quantity: item.quantity,
        price: foodItem.price,
        total: itemTotal,
      };
    });

    // Total equals subtotal since delivery is free
    const total = subtotal + deliveryCharges; // deliveryCharges is 0
    const orderNumber = generateOrderNumber();
    console.log("📦 Order summary:", {
      subtotal,
      deliveryCharges: "FREE",
      total,
      orderNumber,
    });

    // Create the order - ensure we only use fields that exist in schema
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail || null,
        deliveryAddress: orderData.deliveryAddress,
        latitude: orderData.latitude || null,
        longitude: orderData.longitude || null,
        distance: distance || null,
        subtotal,
        deliveryCharges, // 0 (free delivery)
        total,
        status: "PENDING", // Explicitly set status
        paymentStatus: "PENDING", // Explicitly set payment status
        paymentMethod: orderData.paymentMethod || "CASH_ON_DELIVERY",
        notes: orderData.notes || null,
        // DO NOT include cancelledAt - it doesn't exist in schema
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            foodItem: true,
          },
        },
      },
    });

    console.log("✅ Order created successfully:", order.id);

    // Clear the cart after successful order creation
    await CartModel.clearCart(orderData.sessionId);
    console.log("🗑️ Cart cleared for session:", orderData.sessionId);

    return NextResponse.json(
      {
        message: "Order created successfully",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

  // Get all orders (with optional filtering and pagination)
  static async getAllOrders(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const status = searchParams.get("status");
      const dateFrom = searchParams.get("dateFrom");
      const dateTo = searchParams.get("dateTo");

      const skip = (page - 1) * limit;

      const whereClause: any = {};

      if (status) {
        whereClause.status = status;
      }

      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt.gte = new Date(dateFrom);
        if (dateTo) whereClause.createdAt.lte = new Date(dateTo);
      }

      const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
          where: whereClause,
          include: {
            items: {
              include: {
                foodItem: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.order.count({ where: whereClause }),
      ]);

      return NextResponse.json({
        orders,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      console.error("Get all orders error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }
  }

  // Get a single order by ID
  static async getOrderById(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: {
          items: {
            include: {
              foodItem: true,
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      return NextResponse.json({ order });
    } catch (error) {
      console.error("Get order error:", error);
      return NextResponse.json(
        { error: "Failed to fetch order" },
        { status: 500 }
      );
    }
  }

  // Get a single order by order number
  static async getOrderByOrderNumber(
    req: NextRequest,
    { params }: { params: { orderNumber: string } }
  ) {
    try {
      const order = await prisma.order.findUnique({
        where: { orderNumber: params.orderNumber },
        include: {
          items: {
            include: {
              foodItem: true,
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      return NextResponse.json({ order });
    } catch (error) {
      console.error("Get order by number error:", error);
      return NextResponse.json(
        { error: "Failed to fetch order" },
        { status: 500 }
      );
    }
  }

  // Update order status
  static async updateOrderStatus(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { status } = await req.json();

      if (!status) {
        return NextResponse.json(
          { error: "Status is required" },
          { status: 400 }
        );
      }

      const validStatuses = [
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }

      const order = await prisma.order.update({
        where: { id: params.id },
        data: { status },
        include: {
          items: {
            include: {
              foodItem: true,
            },
          },
        },
      });

      return NextResponse.json({
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error("Update order status error:", error);
      return NextResponse.json(
        { error: "Failed to update order status" },
        { status: 500 }
      );
    }
  }

  // Update payment status
  static async updatePaymentStatus(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { paymentStatus } = await req.json();

      if (!paymentStatus) {
        return NextResponse.json(
          { error: "Payment status is required" },
          { status: 400 }
        );
      }

      const validStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];
      if (!validStatuses.includes(paymentStatus)) {
        return NextResponse.json(
          { error: "Invalid payment status value" },
          { status: 400 }
        );
      }

      const order = await prisma.order.update({
        where: { id: params.id },
        data: { paymentStatus },
        include: {
          items: {
            include: {
              foodItem: true,
            },
          },
        },
      });

      return NextResponse.json({
        message: "Payment status updated successfully",
        order,
      });
    } catch (error) {
      console.error("Update payment status error:", error);
      return NextResponse.json(
        { error: "Failed to update payment status" },
        { status: 500 }
      );
    }
  }

  // Cancel an order
  static async cancelOrder(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { reason } = await req.json();

      // Get existing notes to preserve them
      const existingOrder = await prisma.order.findUnique({
        where: { id: params.id },
        select: { notes: true },
      });

      const updatedNotes = reason
        ? `Cancellation reason: ${reason}. ${existingOrder?.notes || ""}`
        : existingOrder?.notes || "";

      const order = await prisma.order.update({
        where: { id: params.id },
        data: {
          status: "CANCELLED",
          notes: updatedNotes,
        },
        include: {
          items: {
            include: {
              foodItem: true,
            },
          },
        },
      });

      return NextResponse.json({
        message: "Order cancelled successfully",
        order,
      });
    } catch (error) {
      console.error("Cancel order error:", error);
      return NextResponse.json(
        { error: "Failed to cancel order" },
        { status: 500 }
      );
    }
  };

  // Add this method to your OrderController class
static async getDashboardStats(req: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's stats
    const [
      todayOrders,
      todayRevenue,
      totalOrders,
      totalRevenue,
      totalCustomers,
      averageOrderValue,
      pendingOrders,
      completedOrders
    ] = await Promise.all([
      // Today's orders count
      prisma.order.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // Today's revenue
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          },
          status: { not: 'CANCELLED' }
        },
        _sum: { total: true }
      }),
      
      // Total orders (all time)
      prisma.order.count(),
      
      // Total revenue (all time)
      prisma.order.aggregate({
        where: {
          status: { not: 'CANCELLED' }
        },
        _sum: { total: true }
      }),
      
      // Total unique customers
      prisma.order.findMany({
        select: { customerPhone: true },
        distinct: ['customerPhone']
      }),
      
      // Average order value
      prisma.order.aggregate({
        where: {
          status: { not: 'CANCELLED' }
        },
        _avg: { total: true }
      }),
      
      // Pending orders
      prisma.order.count({
        where: {
          status: {
            in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY']
          }
        }
      }),
      
      // Completed orders
      prisma.order.count({
        where: {
          status: 'DELIVERED'
        }
      })
    ]);

    const stats = {
      todayOrders,
      todayRevenue: todayRevenue._sum.total || 0,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      totalCustomers: totalCustomers.length,
      averageOrderValue: averageOrderValue._avg.total || 0,
      pendingOrders,
      completedOrders
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

  // Get order analytics
static async getOrderAnalytics(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const whereClause: any = {
      status: { not: 'CANCELLED' } 
    };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    console.log('📊 Analytics query with filters:', whereClause);

    const [
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
      ordersByPaymentMethod,
    ] = await Promise.all([
      prisma.order.count({ where: whereClause }),
      
      prisma.order.aggregate({
        where: whereClause,
        _sum: { total: true },
      }),
      
      prisma.order.aggregate({
        where: whereClause,
        _avg: { total: true },
      }),
      
      // Don't exclude cancelled from status breakdown (for complete picture)
      prisma.order.groupBy({
        by: ["status"],
        where: startDate || endDate ? {
          createdAt: whereClause.createdAt
        } : {}, // Only apply date filter for status breakdown
        _count: { id: true },
      }),
      
      prisma.order.groupBy({
        by: ["paymentMethod"],
        where: whereClause,
        _count: { id: true },
      }),
    ]);

    const analytics = {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      averageOrderValue: averageOrderValue._avg.total || 0,
      ordersByStatus,
      ordersByPaymentMethod,
    };

    console.log('📈 Analytics generated:', {
      totalOrders: analytics.totalOrders,
      totalRevenue: analytics.totalRevenue,
      averageOrderValue: analytics.averageOrderValue
    });

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Get order analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order analytics" },
      { status: 500 }
    );
  }
}

  // Get orders by status count
  static async getOrdersByStatus() {
    try {
      const statusCounts = await prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
      });

      return NextResponse.json({ statusCounts });
    } catch (error) {
      console.error("Get orders by status error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders by status" },
        { status: 500 }
      );
    }
  }

  // Get revenue report 
static async getRevenueReport(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const whereClause: any = {
      status: { not: 'CANCELLED' } // ✅ Exclude cancelled orders
    };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const revenueData = await prisma.order.findMany({
      where: whereClause,
      select: {
        createdAt: true,
        total: true,
        status: true, // Include status for debugging
      },
      orderBy: { createdAt: "asc" },
    });

    console.log(`📊 Revenue report: Found ${revenueData.length} orders for analytics`);

    // Group data by date
    const groupedData = revenueData.reduce((acc: any, order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orders: 0 };
      }
      acc[date].revenue += order.total;
      acc[date].orders += 1;
      return acc;
    }, {});

    const report = Object.values(groupedData);
    
    console.log(`📈 Revenue report generated: ${report.length} days of data`);

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Get revenue report error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue report" },
      { status: 500 }
    );
  }
}

  // Generate order slip for download and WhatsApp sharing
  static async generateOrderSlip(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: {
          items: {
            include: {
              foodItem: true,
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Get the requested format from query parameters
      const { searchParams } = new URL(req.url);
      const format = searchParams.get("format") || "json"; // json, text, html, pdf

      // Generate order slip based on requested format
      switch (format) {
        case "text":
          return this.generateTextSlip(order);
        case "html":
          return this.generateHtmlSlip(order);
        case "pdf":
          return this.generateThermalSlip(order);
        case "thermal":
          return this.generateThermal58mm(order);
        case "thermal58":
          return this.generatePdfSlip(order);
        case "escpos":
          return this.generateESCPOSSlip(order);
        default:
          return NextResponse.json({ order });
      }
    } catch (error) {
      console.error("Generate order slip error:", error);
      return NextResponse.json(
        { error: "Failed to generate order slip" },
        { status: 500 }
      );
    }
  }

  // Generate text format order slip (for WhatsApp sharing)
  private static generateTextSlip(order: any) {
    const slipText = `
🍕 ORDER SLIP 🍕
Order #: ${order.orderNumber}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Time: ${new Date(order.createdAt).toLocaleTimeString()}
Status: ${order.status}
Payment: ${order.paymentStatus} (${order.paymentMethod})

👤 CUSTOMER DETAILS
Name: ${order.customerName}
Phone: ${order.customerPhone}
${order.customerEmail ? `Email: ${order.customerEmail}` : ""}
Address: ${order.deliveryAddress}
${order.distance ? `Distance: ${order.distance} km` : ""}

📦 ORDER ITEMS
${order.items
  .map(
    (item: any) =>
      `${item.quantity}x ${item.foodItem.name} - ₹${item.price} each = ₹${item.total}`
  )
  .join("\n")}

💵 BILL SUMMARY
Subtotal: ₹${order.subtotal}
Delivery: ₹${order.deliveryCharges}
Total: ₹${order.total}

📝 NOTES: ${order.notes || "None"}

Thank you for your order! 🎉
    `.trim();

    return new NextResponse(slipText, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="order-${order.orderNumber}.txt"`,
      },
    });
  }

  // Generate HTML format order slip
  private static generateHtmlSlip(order: any) {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Order Slip - ${order.orderNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .section { margin-bottom: 15px; }
        .section-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .total-row { font-weight: bold; }
        .notes { padding: 10px; background-color: #f9f9f9; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🍕 ORDER SLIP 🍕</h1>
        <p><strong>Order #:</strong> ${order.orderNumber}</p>
        <p><strong>Date:</strong> ${new Date(
          order.createdAt
        ).toLocaleDateString()} | 
           <strong>Time:</strong> ${new Date(
             order.createdAt
           ).toLocaleTimeString()}</p>
        <p><strong>Status:</strong> ${order.status} | 
           <strong>Payment:</strong> ${order.paymentStatus} (${
      order.paymentMethod
    })</p>
    </div>

    <div class="section">
        <div class="section-title">👤 CUSTOMER DETAILS</div>
        <p><strong>Name:</strong> ${order.customerName}</p>
        <p><strong>Phone:</strong> ${order.customerPhone}</p>
        ${
          order.customerEmail
            ? `<p><strong>Email:</strong> ${order.customerEmail}</p>`
            : ""
        }
        <p><strong>Address:</strong> ${order.deliveryAddress}</p>
        ${
          order.distance
            ? `<p><strong>Distance:</strong> ${order.distance} km</p>`
            : ""
        }
    </div>

    <div class="section">
        <div class="section-title">📦 ORDER ITEMS</div>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items
                  .map(
                    (item: any) => `
                    <tr>
                        <td>${item.foodItem.name}</td>
                        <td>${item.quantity}</td>
                        <td>₹${item.price}</td>
                        <td>₹${item.total}</td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">💵 BILL SUMMARY</div>
        <table>
            <tr>
                <td>Subtotal:</td>
                <td>₹${order.subtotal}</td>
            </tr>
            <tr>
                <td>Delivery Charges:</td>
                <td>₹${order.deliveryCharges}</td>
            </tr>
            <tr class="total-row">
                <td>TOTAL:</td>
                <td>₹${order.total}</td>
            </tr>
        </table>
    </div>

    ${
      order.notes
        ? `
    <div class="section">
        <div class="section-title">📝 NOTES</div>
        <div class="notes">${order.notes}</div>
    </div>
    `
        : ""
    }

    <div class="section" style="text-align: center; margin-top: 30px;">
        <p>Thank you for your order! 🎉</p>
    </div>
</body>
</html>
    `.trim();

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="order-${order.orderNumber}.html"`,
      },
    });
  }

  // Thermal printer optimized slip generator
  private static generateThermalSlip(order: any) {
    const slip = `
================================
         Several
         P-562/A Opposite Govt. Nusrat Fateh Ali Khan Hospital, Peoples Colony No 2, Faisalabad
        Phone: +923290039757
================================

ORDER #: ${order.orderNumber}
DATE: ${new Date(order.createdAt).toLocaleDateString("en-IN")}
TIME: ${new Date(order.createdAt).toLocaleTimeString("en-IN", { hour12: true })}

--------------------------------
CUSTOMER DETAILS
--------------------------------
Name: ${order.customerName}
Phone: ${order.customerPhone}
${order.customerEmail ? `Email: ${order.customerEmail}\n` : ""}
Address: ${order.deliveryAddress}
${order.distance ? `Distance: ${order.distance} km\n` : ""}

--------------------------------
ORDER ITEMS
--------------------------------
${order.items
  .map((item: any) => {
    const itemName =
      item.foodItem.name.length > 20
        ? item.foodItem.name.substring(0, 17) + "..."
        : item.foodItem.name;
    const qty = item.quantity.toString().padStart(2);
    const price = `Rs.${item.price}`.padStart(8);
    const total = `Rs.${item.total}`.padStart(8);

    return `${itemName}\n${qty} x ${price} = ${total}`;
  })
  .join("\n\n")}

--------------------------------
BILL SUMMARY
--------------------------------
Subtotal:           Rs.${order.subtotal.toString().padStart(8)}
Delivery:           Rs.${order.deliveryCharges.toString().padStart(8)}
--------------------------------
TOTAL:              Rs.${order.total.toString().padStart(8)}
--------------------------------

Payment: ${order.paymentMethod}
Status: ${order.status}

${order.notes ? `Notes: ${order.notes}\n` : ""}
================================
     Thank you for your order!
       Visit us again soon!
================================

Generated: ${new Date().toLocaleString("en-IN")}
`.trim();

    return new NextResponse(slip, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="thermal-slip-${order.orderNumber}.txt"`,
      },
    });
  }

  // Alternative: 58mm width format (32 characters)
  private static generateThermal58mm(order: any) {
    const slip = `
================================
       Several
P-562/A Opposite Govt. Nusrat Fateh Ali Khan Hospital, Peoples Colony No 2, Faisalabad
      Phone: +923290039757
================================

ORDER #: ${order.orderNumber}
DATE: ${new Date(order.createdAt).toLocaleDateString("en-IN")}
TIME: ${new Date(order.createdAt).toLocaleTimeString("en-IN", { hour12: true })}

--------------------------------
CUSTOMER
--------------------------------
${order.customerName}
${order.customerPhone}
${
  order.deliveryAddress.length > 30
    ? order.deliveryAddress.substring(0, 77) + "..."
    : order.deliveryAddress
}

--------------------------------
ITEMS
--------------------------------
${order.items
  .map((item: any) => {
    const name =
      item.foodItem.name.length > 18
        ? item.foodItem.name.substring(0, 15) + "..."
        : item.foodItem.name;
    const line1 = name;
    const line2 = `${item.quantity} x Rs.${item.price} = Rs.${item.total}`;
    return `${line1}\n${line2}`;
  })
  .join("\n\n")}

--------------------------------
Subtotal:          Rs.${order.subtotal}
Delivery:          Rs.${order.deliveryCharges}
--------------------------------
TOTAL:             Rs.${order.total}
--------------------------------

Payment: ${order.paymentMethod}
Status: ${order.status}

${order.notes ? `Notes:\n${order.notes}\n` : ""}
================================
    Thank you for your order!
================================
`.trim();

    return new NextResponse(slip, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="thermal58mm-${order.orderNumber}.txt"`,
      },
    });
  }

  // ESC/POS command version for direct printer communication
  private static generateESCPOSSlip(order: any) {
    // ESC/POS commands for thermal printers
    const ESC = "\x1B";
    const commands = {
      init: ESC + "@", // Initialize printer
      centerAlign: ESC + "a1", // Center alignment
      leftAlign: ESC + "a0", // Left alignment
      bold: ESC + "E1", // Bold on
      boldOff: ESC + "E0", // Bold off
      doubleHeight: ESC + "!1", // Double height
      normal: ESC + "!0", // Normal size
      cut: ESC + "i", // Cut paper
      lineFeed: "\n",
    };

    const slip =
      commands.init +
      commands.centerAlign +
      commands.bold +
      commands.doubleHeight +
      "Several\n" +
      commands.normal +
      "P-562/A Opposite Govt. Nusrat Fateh Ali Khan Hospital, Peoples Colony No 2, Faisalabad\n" +
      "Phone: +923290039757\n" +
      "================================\n\n" +
      commands.leftAlign +
      commands.bold +
      `ORDER #: ${order.orderNumber}\n` +
      commands.boldOff +
      `DATE: ${new Date(order.createdAt).toLocaleDateString("en-IN")}\n` +
      `TIME: ${new Date(order.createdAt).toLocaleTimeString("en-IN")}\n\n` +
      commands.bold +
      "CUSTOMER DETAILS\n" +
      commands.boldOff +
      "--------------------------------\n" +
      `Name: ${order.customerName}\n` +
      `Phone: ${order.customerPhone}\n` +
      `Address: ${order.deliveryAddress}\n\n` +
      commands.bold +
      "ORDER ITEMS\n" +
      commands.boldOff +
      "--------------------------------\n" +
      order.items
        .map(
          (item: any) =>
            `${item.foodItem.name}\n` +
            `${item.quantity} x Rs.${item.price} = Rs.${item.total}\n\n`
        )
        .join("") +
      "--------------------------------\n" +
      commands.bold +
      `Subtotal: Rs.${order.subtotal}\n` +
      `Delivery: Rs.${order.deliveryCharges}\n` +
      "--------------------------------\n" +
      `TOTAL: Rs.${order.total}\n` +
      commands.boldOff +
      "--------------------------------\n\n" +
      `Payment: ${order.paymentMethod}\n` +
      `Status: ${order.status}\n\n` +
      (order.notes ? `Notes: ${order.notes}\n\n` : "") +
      commands.centerAlign +
      "================================\n" +
      "Thank you for your order!\n" +
      "Visit us again soon!\n" +
      "================================\n\n" +
      commands.cut;

    return new NextResponse(slip, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="escpos-${order.orderNumber}.txt"`,
      },
    });
  }

  // Generate PDF format order slip (simple implementation)
  private static async generatePdfSlip(order: any) {
    // For a real implementation, you would use a PDF library like pdfkit, jspdf, or puppeteer
    // This is a simplified version that returns HTML that can be converted to PDF

    const htmlContent = this.generateHtmlSlip(order);
    const htmlText = await htmlContent.text();

    // In a real implementation, you would convert HTML to PDF here
    // For now, we'll return the HTML with a PDF content type

    return new NextResponse(htmlText, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="order-${order.orderNumber}.pdf"`,
      },
    });
  }

  // Generate WhatsApp shareable text
  static async generateWhatsAppText(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params; // ✅ await before accessing

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            foodItem: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const whatsappText = `
Order #${order.orderNumber}
Status: ${order.status}
Customer: ${order.customerName} (${order.customerPhone})
Delivery: ${order.deliveryAddress}
Items:
${order.items
  .map((item: any) => `- ${item.quantity}x ${item.foodItem.name}`)
  .join("\n")}
Total: ₹${order.total}
    `.trim();

    const encodedText = encodeURIComponent(whatsappText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;

    return NextResponse.json({
      text: whatsappText,
      shareUrl: whatsappUrl,
    });
  } catch (error) {
    console.error("Generate WhatsApp text error:", error);
    return NextResponse.json(
      { error: "Failed to generate WhatsApp text" },
      { status: 500 }
    );
  }
}

}
