import { useState, useCallback } from 'react';
import apiClient from '../api/axios';

export const useLead = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedProperties, setCapturedProperties] = useState<Set<string>>(new Set());

  const captureLead = useCallback(async (propertyId: string) => {
    // Prevent multiple calls for the same property in the current session
    if (capturedProperties.has(propertyId) || isCapturing) {
      return;
    }

    setIsCapturing(true);
    try {
      await apiClient.post('/buyers/leads/capture', { propertyId });
      
      // Mark as captured locally to avoid re-sending in same session
      setCapturedProperties(prev => new Set(prev).add(propertyId));
    } catch (error) {
      // Fail silently as per requirement to not block UI
      console.error('Lead capture failed:', error);
    } finally {
      setIsCapturing(false);
    }
  }, [capturedProperties, isCapturing]);

  return { captureLead, isCapturing };
};
