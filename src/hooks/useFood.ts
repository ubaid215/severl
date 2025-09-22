// src/hooks/useFood.ts
import { useState, useEffect } from 'react';
import { FoodItem, Category, ApiResponse } from '@/types';
import { apiService } from '@/services/api';

export const useFoodItems = (categoryId?: string, query?: string) => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        setLoading(true);
        const response: ApiResponse<FoodItem[]> = await apiService.getFoodItems(categoryId, query);
        if (response.success) {
          setFoodItems(response.data!);
        } else {
          setError(response.error || 'Failed to fetch food items');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, [categoryId, query]);

  return { foodItems, loading, error };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response: ApiResponse<Category[]> = await apiService.getCategories();
        if (response.success) {
          setCategories(response.data!);
        } else {
          setError(response.error || 'Failed to fetch categories');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};