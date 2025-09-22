// src/hooks/useCart.ts
import { useState, useEffect } from 'react';
import { CartSummary, ApiResponse } from '@/types';
import { apiService } from '@/services/api';

export const useCart = (sessionId: string) => {
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      if (!sessionId) return;
      
      try {
        setLoading(true);
        const response: ApiResponse<CartSummary> = await apiService.getCart(sessionId);
        if (response.success) {
          setCart(response.data!);
        } else {
          setError(response.error || 'Failed to fetch cart');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [sessionId]);

  const addToCart = async (foodItemId: string, quantity: number = 1) => {
    try {
      const response = await apiService.addToCart({ sessionId, foodItemId, quantity });
      if (response.success) {
        // Refresh cart after adding item
        const cartResponse: ApiResponse<CartSummary> = await apiService.getCart(sessionId);
        if (cartResponse.success) {
          setCart(cartResponse.data!);
        }
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return { cart, loading, error, addToCart };
};