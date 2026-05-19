/**
 * propertyApi.ts — Centralised property data layer. (v1.0.1)
 *
 * Currently backed by a mock that simulates:
 *  - Filtering (location, category, type, BHK, price range)
 *  - Sort
 *  - Pagination with configurable page size
 *  - Realistic network delay
 *
 * When the backend is ready, replace ONLY the `fetchProperties` function body
 * with: return apiClient.get('/properties', { params }).then(r => r.data)
 * — every consumer will continue to work unchanged.
 */

import apiClient from './axios';

// ─── Shared Types ─────────────────────────────────────────────────────────────

export type PropertyCategory =
  | 'NEW_PROJECT'
  | 'READY_TO_MOVE'
  | 'UNDER_CONSTRUCTION'
  | 'RESALE';

export type PropertyType =
  | 'APARTMENT'
  | 'VILLA'
  | 'PLOT'
  | 'INDEPENDENT_HOUSE'
  | 'COMMERCIAL';

export type SubscriptionTier = 'STANDARD' | 'PREMIUM' | 'PRO';

export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  priceLabel: string;          // e.g. "₹45 L" — pre-formatted for display
  location: string;
  structuredLocation: {
    city: string;
    area: string;
    state: string;
  };
  bhk: number | null;          // null for plots/commercial
  areaSqft: number;
  propertyType: PropertyType;
  category: PropertyCategory;
  images: { id: string; url: string }[];
  tier: SubscriptionTier;
  isFeatured: boolean;
  postedAt: string;            // ISO date string
}

export interface FetchPropertiesParams {
  location?: string;
  category?: string;
  propertyType?: string;
  bedrooms?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: number;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'relevance';
  seed?: number;
}

export interface FetchPropertiesResult {
  properties: Property[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchProperties(
  params: FetchPropertiesParams,
): Promise<FetchPropertiesResult> {
  const { data } = await apiClient.get('/properties', { params });
  return {
    properties: data.properties,
    totalCount: data.pagination.total,
    totalPages: data.pagination.pages,
    currentPage: data.pagination.page,
    limit: params.limit || 10
  };
}

export async function fetchPropertyById(
  id: string,
): Promise<Property | null> {
  try {
    const { data } = await apiClient.get(`/properties/${id}`);
    return data;
  } catch (err) {
    return null;
  }
}


// Suppress unused import warning until live API is enabled
void apiClient;
