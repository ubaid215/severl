import { FoodItem, SpecialDeal } from '@/types';

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// Calculate discount
export const calculateDiscount = (deal: SpecialDeal, amount: number): number => {
  if (deal.minOrderAmount && amount < deal.minOrderAmount) {
    return 0;
  }

  if (deal.discountType === 'PERCENTAGE') {
    return (amount * deal.discount) / 100;
  } else {
    return deal.discount;
  }
};

// Generate session ID
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Local storage helpers
export const getStorage = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error getting from localStorage:', error);
    return null;
  }
};

export const setStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
};