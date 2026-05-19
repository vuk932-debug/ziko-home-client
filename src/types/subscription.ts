export type PlanType = 'STANDARD' | 'PRO' | 'PREMIUM';

export interface Subscription {
  id: string;
  userId: string;
  planType: PlanType;
  startDate: string;
  endDate: string;
  listingsCount: number;
  isActive: boolean;
  active: boolean; // Alias for UI consistency
  daysRemaining: number;
  listingLimit: number;
}
