import { useEffect } from 'react';
import { authErrorHandler } from '@/lib/authErrorHandler';

/**
 * Hook to initialize global error handling
 * This hook should be used in the App component to handle global errors
 */
export function useGlobalErrorHandler() {
  useEffect(() => {
    // In development mode, we don't want to show unauthorized errors
    if (process.env.NODE_ENV === 'development') {
      // Find and remove any unauthorized banners
      const removeUnauthorizedBanners = () => {
        const banners = document.querySelectorAll('[data-unauthorized-banner]');
        banners.forEach(banner => banner.remove());
      };
      
      // Initial cleanup
      removeUnauthorizedBanners();
      
      // Set up a periodic check to remove any unauthorized banners
      const interval = setInterval(removeUnauthorizedBanners, 1000);
      
      return () => {
        clearInterval(interval);
      };
    }
    
    // Set up global error handler for production
    const handleGlobalError = (event: ErrorEvent) => {
      // Check if it's an unauthorized error
      if (event.error && event.error.message && 
          (event.error.message.includes('401:') || 
           event.error.message.includes('403:') ||
           event.error.message.includes('Unauthorized'))) {
        // Handle the unauthorized error
        authErrorHandler.handleError(event.error);
        
        // Prevent the default error handling
        event.preventDefault();
      }
    };
    
    // Add global error handler
    window.addEventListener('error', handleGlobalError);
    
    // Cleanup
    return () => {
      window.removeEventListener('error', handleGlobalError);
      authErrorHandler.reset();
    };
  }, []);
}
