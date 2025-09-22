// Base types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

// Cart types
export interface CartItem {
  id: string;
  sessionId: string;
  foodItemId: string;
  foodItem: FoodItem;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  deliveryCharges: number;
  total: number;
  itemCount: number;
}

// Food types
export interface Category {
  id: string;
  name: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  foodItems?: FoodItem[];
}

export interface FoodItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId: string;
  category?: Category;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 
  | 'CASH_ON_DELIVERY'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'PAYPAL'
  | 'STRIPE';

export type PaymentStatus = 
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  foodItemId: string;
  foodItem: FoodItem;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  subtotal: number;
  deliveryCharges: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Special Deals types
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface SpecialDeal {
  id: string;
  title: string;
  description: string;
  image?: string;
  discount: number;
  discountType: DiscountType;
  minOrderAmount?: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response types
export interface CreateOrderRequest {
  sessionId: string;
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
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface AddToCartRequest {
  sessionId: string;
  foodItemId: string;
  quantity: number;
}

// Filter types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface OrderFilters extends PaginationParams {
  status?: OrderStatus;
  dateFrom?: Date;
  dateTo?: Date;
}