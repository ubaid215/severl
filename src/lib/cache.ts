// lib/cache.ts
//
// Centralised data-fetching layer.
// ─ Every public read goes through `unstable_cache` so Next.js writes the
//   result into the Data Cache (persists across requests, survives server
//   restarts on Vercel Edge / Node runtime).
// ─ `cache()` (React cache) de-dupes identical calls inside ONE render pass.
// ─ On CMS / admin mutations call `revalidateTag(TAG)` to purge only the
//   affected slice of the cache.

import { unstable_cache, revalidateTag } from "next/cache";
import { cache } from "react";

// ─── Tag constants ────────────────────────────────────────────────────────────
// Import these in your API route handlers and call revalidateTag() after
// any mutation (POST / PUT / DELETE).
export const CACHE_TAGS = {
  categories: "categories",
  foodItems: "food-items",
  category: (id: string) => `category-${id}`,
  foodItemsByCategory: (id: string) => `food-items-category-${id}`,
  specialDeals: "special-deals",
} as const;

// ─── Types (match your Prisma models) ────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  image?: string;
  isActive: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image?: string;
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

// ─── Base URL helper ──────────────────────────────────────────────────────────
function apiUrl(path: string): string {
  // Server Components call the API routes via absolute URL.
  // NEXT_PUBLIC_BASE_URL must be set in your .env / Vercel env vars.
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base}${path}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${url} → ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

// ─── getCategories ────────────────────────────────────────────────────────────
// Cached across ALL requests. Revalidate after category mutations.
export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    return fetchJson<Category[]>(apiUrl("/api/categories"));
  },
  [CACHE_TAGS.categories],
  {
    tags: [CACHE_TAGS.categories],
    revalidate: 300, // fallback TTL: 5 min
  }
);

// ─── getCategoryById ──────────────────────────────────────────────────────────
export const getCategoryById = unstable_cache(
  async (id: string): Promise<Category | null> => {
    const categories = await fetchJson<Category[]>(apiUrl("/api/categories"));
    return categories.find((c) => c.id === id) ?? null;
  },
  // Cache key includes the id so each category gets its own entry
  [CACHE_TAGS.categories],
  {
    tags: [CACHE_TAGS.categories],
    revalidate: 300,
  }
);

// ─── getFoodItems ──────────────────────────────────────────────────────────────
// Optionally filtered by categoryId.
export const getFoodItems = unstable_cache(
  async (categoryId?: string): Promise<FoodItem[]> => {
    const url = categoryId
      ? apiUrl(`/api/food-items?categoryId=${categoryId}`)
      : apiUrl("/api/food-items");
    return fetchJson<FoodItem[]>(url);
  },
  [CACHE_TAGS.foodItems],
  {
    tags: [CACHE_TAGS.foodItems],
    revalidate: 120, // 2 min – food items change more often
  }
);

// ─── React cache wrappers (per-request deduplication) ────────────────────────
// Use these inside Server Components that are rendered within the same request.
// They call the unstable_cache versions so the Data Cache is still used.
export const getCategoriesCached = cache(getCategories);
export const getFoodItemsCached = cache(getFoodItems);
export const getCategoryByIdCached = cache(getCategoryById);

// ─── Revalidation helpers (call from API route handlers after mutations) ─────
export async function revalidateCategories() {
  revalidateTag(CACHE_TAGS.categories);
}

export async function revalidateFoodItems(categoryId?: string) {
  revalidateTag(CACHE_TAGS.foodItems);
  if (categoryId) {
    revalidateTag(CACHE_TAGS.foodItemsByCategory(categoryId));
  }
}

export async function revalidateSpecialDeals() {
  revalidateTag(CACHE_TAGS.specialDeals);
}

/*
 * ─── USAGE IN API ROUTE HANDLERS ────────────────────────────────────────────
 *
 * // app/api/categories/route.ts  (POST / PUT / DELETE handler)
 * import { revalidateCategories } from "@/lib/cache";
 *
 * export async function POST(req: Request) {
 *   // ... create category in DB ...
 *   await revalidateCategories();           // ← purge cache
 *   return Response.json({ success: true });
 * }
 *
 * // app/api/food-items/route.ts  (POST handler)
 * import { revalidateFoodItems } from "@/lib/cache";
 *
 * export async function POST(req: Request) {
 *   const body = await req.json();
 *   // ... create food item in DB ...
 *   await revalidateFoodItems(body.categoryId); // ← purge only that category
 *   return Response.json({ success: true });
 * }
 */