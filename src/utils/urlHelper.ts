/**
 * Cleans image URLs to ensure they point to the correct backend.
 * Fixes issues where the server might return 'localhost' URLs when deployed.
 */
export const cleanImageUrl = (url: string | undefined): string => {
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
  
  if (!url) return FALLBACK_IMAGE;
  
  // If we are on a production domain (Vercel) but the URL is localhost
  if (typeof window !== 'undefined' && 
      !window.location.hostname.includes('localhost') && 
      url.includes('localhost:5000')) {
    
    const apiUrl = import.meta.env.VITE_API_URL || '';
    // Extract base URL (e.g., https://server.onrender.com)
    const baseApi = apiUrl.split('/api/v1')[0];
    
    if (baseApi) {
      return url.replace(/http:\/\/localhost:5000/g, baseApi);
    }
  }
  
  return url;
};
