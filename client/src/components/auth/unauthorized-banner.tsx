import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function UnauthorizedBanner() {
  const [show, setShow] = useState(false);
  
  // Hide the banner in development mode
  useEffect(() => {
    // In development mode, we don't show the banner by default
    if (process.env.NODE_ENV !== 'development') {
      setShow(true);
    }
  }, []);

  if (!show) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-destructive text-destructive-foreground p-4 z-50 flex items-center justify-between">
      <div>
        <span className="font-medium">Unauthorized</span>
        <span className="ml-2">You are logged out. Logging in again...</span>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full hover:bg-destructive-foreground/10"
        onClick={() => setShow(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
