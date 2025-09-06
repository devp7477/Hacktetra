import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import WebSocket, { WebSocketServer } from 'ws';
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { authenticateToken } from "./middleware/auth";
import { authenticateClerkToken } from "./middleware/clerk";
import { insertProjectSchema, insertTaskSchema, insertChatMessageSchema } from "../shared/schema";
import projectsRouter from './routes/projects';
import tasksRouter from './routes/tasks';
import teamRouter from './routes/team';
import authRouter from './routes/auth';
import analyticsRouter from './routes/analytics';

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // API routes
  app.use('/api/projects', projectsRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/team', teamRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/analytics', analyticsRouter);

  // Legacy routes - keep them for backward compatibility
  app.get('/api/auth/user', authenticateClerkToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Chat routes
  app.get('/api/projects/:id/chat', authenticateClerkToken, async (req: any, res) => {
    try {
      const projectId = req.params.id;
      const messages = await storage.getChatMessages(projectId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Notification routes
  app.get('/api/notifications', authenticateClerkToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', authenticateClerkToken, async (req: any, res) => {
    try {
      const notificationId = req.params.id;
      await storage.markNotificationAsRead(notificationId);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'chat_message') {
          const chatMessage = await storage.createChatMessage({
            projectId: data.projectId,
            userId: data.userId,
            content: data.content,
          });
          
          // Broadcast to all connected clients
          const messageWithUser = await storage.getChatMessages(data.projectId);
          const latestMessage = messageWithUser[messageWithUser.length - 1];
          
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'new_message',
                projectId: data.projectId,
                message: latestMessage,
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    });
  });

  return httpServer;
}