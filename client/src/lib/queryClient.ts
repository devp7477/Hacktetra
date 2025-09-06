import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { authErrorHandler, withAuthErrorHandling } from "./authErrorHandler";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  token?: string,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Use withAuthErrorHandling to handle unauthorized errors
  return withAuthErrorHandling(async () => {
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });

      // For development environment, don't throw on 401/403 errors
      if (process.env.NODE_ENV === 'development' && (res.status === 401 || res.status === 403)) {
        console.warn(`Auth error (${res.status}) for ${method} ${url} - using mock data in development`);
        return new Response(JSON.stringify([])); // Return empty array as mock data
      }

      // Check for unauthorized errors
      if (res.status === 401 || res.status === 403) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }

      await throwIfResNotOk(res);
      return res;
    } catch (error) {
      // In development, provide fallback for network errors
      if (process.env.NODE_ENV === 'development') {
        console.error(`API request failed for ${method} ${url}:`, error);
        return new Response(JSON.stringify([]));
      }
      throw error;
    }
  });
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  token?: string;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, token }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Use withAuthErrorHandling to handle unauthorized errors
    return withAuthErrorHandling(async () => {
      const res = await fetch(queryKey.join("/") as string, {
        headers,
        credentials: "include",
      });

      // For development environment, don't throw on 401/403 errors
      if (process.env.NODE_ENV === 'development' && (res.status === 401 || res.status === 403)) {
        console.warn(`Auth error (${res.status}) for GET ${queryKey.join("/")} - using mock data in development`);
        return [];
      }

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    });
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
