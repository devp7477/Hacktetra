import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Mock authentication for development
export async function setupAuth(app: Express): Promise<void> {
  // This middleware will automatically create a mock user for development
  app.use((req: any, res: Response, next: NextFunction) => {
    // Set a mock user for development
    req.user = {
      claims: {
        sub: "dev-user-123",
        name: "Developer",
        email: "dev@example.com"
      }
    };
    next();
  });
}

// Authentication middleware
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const reqWithUser = req as Request & { user?: any };
  
  if (reqWithUser.user) {
    // Create or update the user in storage
    storage.upsertUser({
      id: reqWithUser.user.claims.sub,
      email: reqWithUser.user.claims.email,
      firstName: reqWithUser.user.claims.name?.split(' ')[0],
      lastName: reqWithUser.user.claims.name?.split(' ').slice(1).join(' ') || ''
    }).catch(err => console.error("Error upserting user:", err));
    
    return next();
  }
  
  return res.status(401).json({ message: "Unauthorized" });
}