import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@clerk/clerk-react";
import { clerkApi } from "./lib/clerkApi";
import { useEffect, useState } from "react";
import { useGlobalErrorHandler } from "@/hooks/useGlobalErrorHandler";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import ProjectCreateEdit from "@/pages/project-create-edit";
import MyTasks from "@/pages/my-tasks";
import Team from "@/pages/team";
import Calendar from "@/pages/calendar";
import Analytics from "@/pages/analytics";

function Router() {
  const { isSignedIn, isLoaded, getToken } = useUser();
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const setupToken = async () => {
      try {
        if (isSignedIn && getToken) {
          clerkApi.setTokenGetter(getToken);
          // Force a token refresh to ensure we have a valid token
          const token = await getToken();
          if (token) {
            setIsTokenSet(true);
            // Force refetch all queries to ensure they use the new token
            queryClient.invalidateQueries();
          }
        }
      } catch (error) {
        console.error("Error setting up token:", error);
      } finally {
        // Mark as initialized regardless of success/failure
        setIsInitialized(true);
      }
    };
    
    // In development mode, we don't need to wait for the token
    if (process.env.NODE_ENV === 'development') {
      setIsInitialized(true);
    } else if (isLoaded) {
      setupToken();
    }
  }, [isSignedIn, getToken, isLoaded]);

  // For development, allow bypassing authentication
  const devBypass = process.env.NODE_ENV === 'development';

  // Use a loading state that times out after 3 seconds in development mode
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  
  useEffect(() => {
    // In development mode, set a timeout to avoid infinite loading
    if (process.env.NODE_ENV === 'development' && !isInitialized) {
      const timer = setTimeout(() => {
        setLoadingTimedOut(true);
      }, 3000); // 3 second timeout
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);
  
  // Show loading state only briefly
  if (!isInitialized && !loadingTimedOut && !devBypass) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <div>Loading application...</div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isLoaded && !devBypass ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">Loading...</div>
        </div>
      ) : !isSignedIn && !devBypass ? (
        <>
          <Route path="/" component={Landing} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/projects" component={Projects} />
          <Route path="/projects/new" component={ProjectCreateEdit} />
          <Route path="/projects/edit/:id" component={ProjectCreateEdit} />
          <Route path="/projects/:id" component={ProjectDetail} />
          <Route path="/my-tasks" component={MyTasks} />
          <Route path="/team" component={Team} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/profile">
            {() => <div className="p-8 text-center">Profile page coming soon!</div>}
          </Route>
        </>
      )}
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize the global error handler
  useGlobalErrorHandler();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
