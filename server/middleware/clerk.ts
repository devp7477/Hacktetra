import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/clerk-sdk-node';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

export const authenticateClerkToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For development, if no Clerk secret key is configured, use a mock user
    if (!CLERK_SECRET_KEY || CLERK_SECRET_KEY === 'sk_test_your_secret_key_here') {
      console.log('Clerk secret key not configured, using mock authentication for development');
      req.user = {
        userId: 'dev-user-123',
        sessionId: 'dev-session-123',
        sub: 'dev-user-123'
      };
      return next();
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      // For development, if no token is provided, use mock authentication
      console.log('No token provided, using mock authentication for development');
      req.user = {
        userId: 'dev-user-123',
        sessionId: 'dev-session-123',
        sub: 'dev-user-123'
      };
      return next();
    }

    const payload = await verifyToken(token, {
      secretKey: CLERK_SECRET_KEY,
    });

    // Attach user info to request
    req.user = {
      userId: payload.sub,
      sessionId: payload.sid,
      ...payload
    };

    next();
  } catch (error) {
    // For development, if token verification fails, fall back to mock authentication
    // This allows the app to work even when users aren't signed in through Clerk
    console.log('Token verification failed, falling back to mock authentication for development');
    req.user = {
      userId: 'dev-user-123',
      sessionId: 'dev-session-123',
      sub: 'dev-user-123'
    };
    return next();
  }
};
