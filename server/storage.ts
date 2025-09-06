import { 
  User, UpsertUser, 
  Project, InsertProject, 
  Task, InsertTask, 
  ChatMessage, InsertChatMessage,
  Notification, InsertNotification,
  ProjectMember
} from '../shared/schema';
import { prismaStorage } from './storage-prisma';

// Check if we should use Prisma or in-memory storage
const USE_PRISMA = process.env.NODE_ENV === 'production' || process.env.USE_PRISMA === 'true';

// Mock data storage (for development/fallback)
const users: Record<string, User> = {};
const projects: Record<string, Project> = {};
const tasks: Record<string, Task> = {};
const chatMessages: Record<string, ChatMessage> = {};
const notifications: Record<string, Notification> = {};
const projectMembers: Record<string, ProjectMember> = {};
const passwords: Record<string, string> = {};

// Helper function to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Storage implementation with fallback to in-memory storage
export const storage = {
  // User methods
  async getUser(userId: string): Promise<User> {
    if (USE_PRISMA) {
      try {
        return await prismaStorage.getUser(userId);
      } catch (error) {
        console.error('Prisma getUser failed, falling back to in-memory storage:', error);
      }
    }
    
    // Fallback to in-memory storage
    if (!users[userId]) {
      // Create a default user if not exists
      users[userId] = {
        id: userId,
        email: `user-${userId}@example.com`,
        firstName: `User`,
        lastName: `${userId.substring(0, 5)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    return users[userId];
  },

  async getAllUsers(): Promise<User[]> {
    if (USE_PRISMA) {
      try {
        return await prismaStorage.getAllUsers();
      } catch (error) {
        console.error('Prisma getAllUsers failed, falling back to in-memory storage:', error);
      }
    }
    
    // Fallback to in-memory storage
    return Object.values(users);
  },

  async createUser(userData: UpsertUser): Promise<User> {
    if (USE_PRISMA) {
      try {
        return await prismaStorage.createUser(userData);
      } catch (error) {
        console.error('Prisma createUser failed, falling back to in-memory storage:', error);
      }
    }
    
    // Fallback to in-memory storage
    const now = new Date();
    const user = {
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    users[userData.id] = user;
    return user;
  },

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (USE_PRISMA) {
      try {
        return await prismaStorage.upsertUser(userData);
      } catch (error) {
        console.error('Prisma upsertUser failed, falling back to in-memory storage:', error);
      }
    }
    
    // Fallback to in-memory storage
    const now = new Date();
    const user = {
      ...userData,
      createdAt: users[userData.id]?.createdAt || now,
      updatedAt: now
    };
    users[userData.id] = user;
    return user;
  },

  // Project methods
  async getProjects(userId: string): Promise<Project[]> {
    if (USE_PRISMA) {
      try {
        return await prismaStorage.getProjects(userId);
      } catch (error) {
        console.error('Prisma getProjects failed, falling back to in-memory storage:', error);
      }
    }
    
    // Fallback to in-memory storage
    return Object.values(projects).filter(project => {
      // Check if user is manager
      if (project.managerId === userId) return true;
      
      // Check if user is member
      return Object.values(projectMembers).some(
        member => member.projectId === project.id && member.userId === userId
      );
    });
  },

  async getProjectById(projectId: string): Promise<Project | null> {
    if (USE_PRISMA) {
      try {
        return await prismaStorage.getProjectById(projectId);
      } catch (error) {
        console.error('Prisma getProjectById failed, falling back to in-memory storage:', error);
      }
    }
    
    // Fallback to in-memory storage
    return projects[projectId] || null;
  },

  async createProject(projectData: InsertProject): Promise<Project> {
    if (USE_PRISMA) {
      try {
        return await prismaStorage.createProject(projectData);
      } catch (error) {
        console.error('Prisma createProject failed, falling back to in-memory storage:', error);
      }
    }
    
    // Fallback to in-memory storage
    const now = new Date();
    const id = generateId();
    const project: Project = {
      id,
      ...projectData,
      createdAt: now,
      updatedAt: now
    };
    projects[id] = project;
    return project;
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    if (USE_PRISMA) {
      try {
        return await prismaStorage.updateProject(projectId, updates);
      } catch (error) {
        console.error('Prisma updateProject failed, falling back to in-memory storage:', error);
      }
    }
    
    // Fallback to in-memory storage
    const project = projects[projectId];
    if (!project) {
      throw new Error('Project not found');
    }
    
    const updatedProject = {
      ...project,
      ...updates,
      id: projectId, // Ensure ID doesn't change
      updatedAt: new Date()
    };
    
    projects[projectId] = updatedProject;
    return updatedProject;
  },

  async deleteProject(projectId: string): Promise<void> {
    if (USE_PRISMA) {
      try {
        await prismaStorage.deleteProject(projectId);
        return;
      } catch (error) {
        console.error('Prisma deleteProject failed, falling back to in-memory storage:', error);
      }
    }
    
    // Fallback to in-memory storage
    delete projects[projectId];
    
    // Delete related tasks
    Object.entries(tasks).forEach(([taskId, task]) => {
      if (task.projectId === projectId) {
        delete tasks[taskId];
      }
    });
    
    // Delete project members
    Object.entries(projectMembers).forEach(([memberId, member]) => {
      if (member.projectId === projectId) {
        delete projectMembers[memberId];
      }
    });
    
    // Delete chat messages
    Object.entries(chatMessages).forEach(([messageId, message]) => {
      if (message.projectId === projectId) {
        delete chatMessages[messageId];
      }
    });
  },

  // Project members methods
  async getProjectMembers(projectId: string): Promise<User[]> {
    const memberIds = Object.values(projectMembers)
      .filter(member => member.projectId === projectId)
      .map(member => member.userId);
    
    return Promise.all(memberIds.map(userId => this.getUser(userId)));
  },

  async addProjectMember(projectId: string, userId: string): Promise<ProjectMember> {
    const id = generateId();
    const member: ProjectMember = {
      id,
      projectId,
      userId,
      role: 'member',
      joinedAt: new Date()
    };
    projectMembers[id] = member;
    return member;
  },

  // Task methods
  async getTasksByProject(projectId: string): Promise<Task[]> {
    return Object.values(tasks).filter(task => task.projectId === projectId);
  },

  async getTasksByUser(userId: string): Promise<Task[]> {
    return Object.values(tasks).filter(task => task.assigneeId === userId);
  },

  async createTask(taskData: InsertTask): Promise<Task> {
    const now = new Date();
    const id = generateId();
    const task: Task = {
      id,
      ...taskData,
      createdAt: now,
      updatedAt: now
    };
    tasks[id] = task;
    return task;
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const task = tasks[taskId];
    if (!task) {
      throw new Error('Task not found');
    }
    
    const updatedTask = {
      ...task,
      ...updates,
      id: taskId, // Ensure ID doesn't change
      updatedAt: new Date()
    };
    
    // If status changed to done, set completedAt
    if (updates.status === 'done' && task.status !== 'done') {
      updatedTask.completedAt = new Date();
    }
    
    // If status changed from done, clear completedAt
    if (updates.status && updates.status !== 'done' && task.status === 'done') {
      updatedTask.completedAt = undefined;
    }
    
    tasks[taskId] = updatedTask;
    return updatedTask;
  },

  async deleteTask(taskId: string): Promise<void> {
    delete tasks[taskId];
  },

  // Chat methods
  async getChatMessages(projectId: string): Promise<(ChatMessage & { user: User })[]> {
    const messages = Object.values(chatMessages)
      .filter(message => message.projectId === projectId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // Attach user data to each message
    const messagesWithUsers = await Promise.all(
      messages.map(async (message) => {
        const user = await this.getUser(message.userId);
        return { ...message, user };
      })
    );
    
    return messagesWithUsers;
  },

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const id = generateId();
    const message: ChatMessage = {
      id,
      ...messageData,
      createdAt: new Date()
    };
    chatMessages[id] = message;
    return message;
  },

  // Notification methods
  async getNotifications(userId: string): Promise<Notification[]> {
    return Object.values(notifications)
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Newest first
  },

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = generateId();
    const notification: Notification = {
      id,
      ...notificationData,
      isRead: false,
      createdAt: new Date()
    };
    notifications[id] = notification;
    return notification;
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    if (notifications[notificationId]) {
      notifications[notificationId].isRead = true;
    }
  },

  // Password management
  passwords: passwords,

  async setPassword(userId: string, hashedPassword: string): Promise<void> {
    passwords[userId] = hashedPassword;
  },

  async getPassword(userId: string): Promise<string | undefined> {
    return passwords[userId];
  }
};