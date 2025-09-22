// src/contexts/CartContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartSummary, FoodItem } from '@/types';
import { apiService } from '@/services/api';

interface CartState {
  cart: CartSummary | null;
  loading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: CartSummary }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_CART' };

interface CartContextType extends CartState {
  addToCart: (foodItem: FoodItem, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'CLEAR_CART':
      return { ...state, cart: null, loading: false, error: null };
    default:
      return state;
  }
}

export function CartProvider({ children, sessionId }: { children: React.ReactNode; sessionId: string }) {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    refreshCart();
  }, [sessionId]);

  const refreshCart = async () => {
    if (!sessionId) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiService.getCart(sessionId);
      if (response.success) {
        dispatch({ type: 'SET_CART', payload: response.data! });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to fetch cart' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'An error occurred' });
    }
  };

  const addToCart = async (foodItem: FoodItem, quantity: number = 1): Promise<boolean> => {
    if (!sessionId) return false;
    
    try {
      const response = await apiService.addToCart({
        sessionId,
        foodItemId: foodItem.id,
        quantity,
      });
      
      if (response.success) {
        await refreshCart();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to add item to cart' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'An error occurred' });
      return false;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!sessionId) return;
    
    try {
      const response = await apiService.updateCartItem(itemId, quantity);
      if (response.success) {
        await refreshCart();
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to update item' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'An error occurred' });
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!sessionId) return;
    
    try {
      const response = await apiService.removeFromCart(itemId);
      if (response.success) {
        await refreshCart();
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to remove item' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'An error occurred' });
    }
  };

  const clearCart = async () => {
    if (!sessionId) return;
    
    try {
      const response = await apiService.clearCart(sessionId);
      if (response.success) {
        dispatch({ type: 'CLEAR_CART' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to clear cart' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'An error occurred' });
    }
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};