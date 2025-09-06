import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AuthStatus() {
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const { toast } = useToast();

  // Clear any unauthorized messages
  useEffect(() => {
    // In development mode, we don't show unauthorized messages
    if (process.env.NODE_ENV === 'development') {
      setShowUnauthorized(false);
      return;
    }
    
    // Check if there's an unauthorized message in the URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('unauthorized') === 'true') {
      setShowUnauthorized(true);
    }
  }, []);

  // Handle dismissing the alert
  const handleDismiss = () => {
    setShowUnauthorized(false);
    // Remove the parameter from the URL
    const url = new URL(window.location.href);
    url.searchParams.delete('unauthorized');
    window.history.replaceState({}, '', url);
  };

  if (!showUnauthorized) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert variant="destructive" className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
        <AlertTitle>Unauthorized</AlertTitle>
        <AlertDescription>
          You are logged out. Please log in again to continue.
        </AlertDescription>
      </Alert>
    </div>
  );
}
