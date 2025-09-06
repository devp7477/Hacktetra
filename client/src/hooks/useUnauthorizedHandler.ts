import { useEffect } from 'react';
import { useToast } from './use-toast';

export function useUnauthorizedHandler() {
  const { toast } = useToast();
  
  // Hide all unauthorized toasts and banners in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Find and remove any unauthorized banners
      const unauthorizedBanners = document.querySelectorAll('[data-unauthorized-banner]');
      unauthorizedBanners.forEach(banner => {
        banner.remove();
      });
      
      // Override the default toast behavior for unauthorized messages
      const originalToast = toast;
      const wrappedToast = (props: any) => {
        // Skip unauthorized toasts in development mode
        if (props.title === 'Unauthorized' || props.description?.includes('logged out')) {
          return { id: 'skipped-toast' };
        }
        return originalToast(props);
      };
      
      // Apply the override
      Object.assign(toast, wrappedToast);
    }
  }, [toast]);
  
  return null;
}
