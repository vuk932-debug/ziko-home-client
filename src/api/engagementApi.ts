import apiClient from './axios';

export type EntityType = 'PROPERTY' | 'BLOG';

export interface EngagementStats {
  count: number;
  isLiked: boolean;
}

export interface ToggleLikeResult {
  liked: boolean;
}

export async function toggleLike(entityId: string, entityType: EntityType): Promise<ToggleLikeResult> {
  const { data } = await apiClient.post('/engagement/toggle-like', { entityId, entityType });
  return data;
}

export async function fetchEngagementStats(entityId: string, entityType: EntityType): Promise<EngagementStats> {
  const { data } = await apiClient.get('/engagement/stats', { params: { entityId, entityType } });
  return data;
}

export async function trackShare(entityId: string, entityType: EntityType, platform: string): Promise<void> {
  await apiClient.post('/engagement/share', { entityId, entityType, platform });
}
