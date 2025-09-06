import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";

export function useClerkAuth() {
  const { getToken, isSignedIn, isLoaded, userId } = useAuth();

  const authConfig = useMemo(() => ({
    getToken,
    isSignedIn: !!isSignedIn,
    isLoaded,
    userId,
  }), [getToken, isSignedIn, isLoaded, userId]);

  return authConfig;
}

// Hook to get the current token
export function useClerkToken() {
  const { getToken } = useAuth();
  return getToken;
}
