import { ApiResponse, CartSummary, FoodItem, Category, Order, SpecialDeal, CreateOrderRequest, AddToCartRequest } from '@/types';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  private async fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Cart services
  async getCart(sessionId: string): Promise<ApiResponse<CartSummary>> {
    return this.fetchJson(`/cart?sessionId=${sessionId}`);
  }

  async addToCart(data: AddToCartRequest): Promise<ApiResponse> {
    return this.fetchJson('/cart', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCartItem(id: string, quantity: number): Promise<ApiResponse> {
    return this.fetchJson(`/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(id: string): Promise<ApiResponse> {
    return this.fetchJson(`/cart/${id}`, {
      method: 'DELETE',
    });
  }

  async clearCart(sessionId: string): Promise<ApiResponse> {
    return this.fetchJson('/cart/clear', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  // Food services
  async getFoodItems(categoryId?: string, query?: string): Promise<ApiResponse<FoodItem[]>> {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (query) params.append('q', query);
    
    return this.fetchJson(`/food/items?${params.toString()}`);
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.fetchJson('/food/categories');
  }

  // Order services
  async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return this.fetchJson('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(filters?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<{ orders: Order[]; pagination: any }>> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    
    return this.fetchJson(`/orders?${params.toString()}`);
  }

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return this.fetchJson(`/orders/${id}`);
  }

  // Special deals services
  async getSpecialDeals(activeOnly: boolean = true): Promise<ApiResponse<SpecialDeal[]>> {
    return this.fetchJson(`/deals?active=${activeOnly}`);
  }
}

export const apiService = new ApiService();