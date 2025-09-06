import { 
  User, UpsertUser, 
  Project, InsertProject, 
  Task, InsertTask, 
  ChatMessage, InsertChatMessage,
  Notification, InsertNotification,
  ProjectMember
} from '../shared/schema';
import { prisma } from './prisma-client';

// Storage implementation using Prisma
export const prismaStorage = {
  // User methods
  async getUser(userId: string): Promise<User> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        profileImageUrl: user.profileImageUrl || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const users = await prisma.user.findMany();
      return users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        profileImageUrl: user.profileImageUrl || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const user = await prisma.user.upsert({
        where: { id: userData.id },
        update: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl
        },
        create: {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl
        }
      });
      
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        profileImageUrl: user.profileImageUrl || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  },

  async createUser(userData: UpsertUser): Promise<User> {
    // Reuse the upsert method for simplicity
    return this.upsertUser(userData);
  },

  // Project methods
  async getProjects(userId: string): Promise<Project[]> {
    try {
      // Get projects where user is manager
      const managedProjects = await prisma.project.findMany({
        where: { managerId: userId }
      });
      
      // Get projects where user is a member
      const memberProjects = await prisma.project.findMany({
        where: {
          members: {
            some: {
              userId
            }
          }
        }
      });
      
      // Combine and deduplicate
      const allProjects = [...managedProjects];
      for (const project of memberProjects) {
        if (!allProjects.some(p => p.id === project.id)) {
          allProjects.push(project);
        }
      }
      
      return allProjects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || undefined,
        managerId: project.managerId || undefined,
        deadline: project.deadline || undefined,
        priority: project.priority as 'low' | 'medium' | 'high',
        status: project.status as 'active' | 'on_hold' | 'completed',
        progress: project.progress,
        tags: project.tags || undefined,
        imageUrl: project.imageUrl || undefined,
        testUserAssigned: project.testUserAssigned || false,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      }));
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  },

  async getProjectById(projectId: string): Promise<Project | null> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });
      
      if (!project) {
        return null;
      }
      
      return {
        id: project.id,
        name: project.name,
        description: project.description || undefined,
        managerId: project.managerId || undefined,
        deadline: project.deadline || undefined,
        priority: project.priority as 'low' | 'medium' | 'high',
        status: project.status as 'active' | 'on_hold' | 'completed',
        progress: project.progress,
        tags: project.tags || undefined,
        imageUrl: project.imageUrl || undefined,
        testUserAssigned: project.testUserAssigned || false,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      };
    } catch (error) {
      console.error('Error getting project by ID:', error);
      throw error;
    }
  },

  async createProject(projectData: InsertProject): Promise<Project> {
    try {
      const project = await prisma.project.create({
        data: {
          name: projectData.name,
          description: projectData.description,
          managerId: projectData.managerId,
          deadline: projectData.deadline,
          priority: projectData.priority,
          status: projectData.status,
          progress: projectData.progress,
          tags: projectData.tags,
          imageUrl: projectData.imageUrl,
          testUserAssigned: projectData.testUserAssigned
        }
      });
      
      return {
        id: project.id,
        name: project.name,
        description: project.description || undefined,
        managerId: project.managerId || undefined,
        deadline: project.deadline || undefined,
        priority: project.priority as 'low' | 'medium' | 'high',
        status: project.status as 'active' | 'on_hold' | 'completed',
        progress: project.progress,
        tags: project.tags || undefined,
        imageUrl: project.imageUrl || undefined,
        testUserAssigned: project.testUserAssigned || false,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      };
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    try {
      const project = await prisma.project.update({
        where: { id: projectId },
        data: {
          name: updates.name,
          description: updates.description,
          managerId: updates.managerId,
          deadline: updates.deadline,
          priority: updates.priority,
          status: updates.status,
          progress: updates.progress,
          tags: updates.tags,
          imageUrl: updates.imageUrl,
          testUserAssigned: updates.testUserAssigned
        }
      });
      
      return {
        id: project.id,
        name: project.name,
        description: project.description || undefined,
        managerId: project.managerId || undefined,
        deadline: project.deadline || undefined,
        priority: project.priority as 'low' | 'medium' | 'high',
        status: project.status as 'active' | 'on_hold' | 'completed',
        progress: project.progress,
        tags: project.tags || undefined,
        imageUrl: project.imageUrl || undefined,
        testUserAssigned: project.testUserAssigned || false,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      };
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  async deleteProject(projectId: string): Promise<void> {
    try {
      await prisma.project.delete({
        where: { id: projectId }
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // Project members methods
  async getProjectMembers(projectId: string): Promise<User[]> {
    try {
      const members = await prisma.projectMember.findMany({
        where: { projectId },
        include: { user: true }
      });
      
      return members.map(member => ({
        id: member.user.id,
        email: member.user.email,
        firstName: member.user.firstName || undefined,
        lastName: member.user.lastName || undefined,
        profileImageUrl: member.user.profileImageUrl || undefined,
        createdAt: member.user.createdAt,
        updatedAt: member.user.updatedAt
      }));
    } catch (error) {
      console.error('Error getting project members:', error);
      throw error;
    }
  },

  async addProjectMember(projectId: string, userId: string): Promise<ProjectMember> {
    try {
      const member = await prisma.projectMember.create({
        data: {
          projectId,
          userId,
          role: 'member'
        }
      });
      
      return {
        id: member.id,
        projectId: member.projectId,
        userId: member.userId,
        role: member.role as 'manager' | 'member',
        joinedAt: member.joinedAt
      };
    } catch (error) {
      console.error('Error adding project member:', error);
      throw error;
    }
  },

  // Task methods
  async getTasksByProject(projectId: string): Promise<Task[]> {
    try {
      const tasks = await prisma.task.findMany({
        where: { projectId }
      });
      
      return tasks.map(task => ({
        id: task.id,
        projectId: task.projectId,
        title: task.title,
        description: task.description || undefined,
        assigneeId: task.assigneeId || undefined,
        status: task.status as 'todo' | 'in_progress' | 'done',
        priority: task.priority as 'low' | 'medium' | 'high',
        dueDate: task.dueDate || undefined,
        completedAt: task.completedAt || undefined,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }));
    } catch (error) {
      console.error('Error getting tasks by project:', error);
      throw error;
    }
  },

  async getTasksByUser(userId: string): Promise<Task[]> {
    try {
      const tasks = await prisma.task.findMany({
        where: { assigneeId: userId }
      });
      
      return tasks.map(task => ({
        id: task.id,
        projectId: task.projectId,
        title: task.title,
        description: task.description || undefined,
        assigneeId: task.assigneeId || undefined,
        status: task.status as 'todo' | 'in_progress' | 'done',
        priority: task.priority as 'low' | 'medium' | 'high',
        dueDate: task.dueDate || undefined,
        completedAt: task.completedAt || undefined,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }));
    } catch (error) {
      console.error('Error getting tasks by user:', error);
      throw error;
    }
  },

  async createTask(taskData: InsertTask): Promise<Task> {
    try {
      const task = await prisma.task.create({
        data: {
          projectId: taskData.projectId,
          title: taskData.title,
          description: taskData.description,
          assigneeId: taskData.assigneeId,
          status: taskData.status,
          priority: taskData.priority,
          dueDate: taskData.dueDate
        }
      });
      
      return {
        id: task.id,
        projectId: task.projectId,
        title: task.title,
        description: task.description || undefined,
        assigneeId: task.assigneeId || undefined,
        status: task.status as 'todo' | 'in_progress' | 'done',
        priority: task.priority as 'low' | 'medium' | 'high',
        dueDate: task.dueDate || undefined,
        completedAt: task.completedAt || undefined,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    try {
      // If status is changing to done, set completedAt
      const completedAt = updates.status === 'done' ? new Date() : undefined;
      
      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          title: updates.title,
          description: updates.description,
          assigneeId: updates.assigneeId,
          status: updates.status,
          priority: updates.priority,
          dueDate: updates.dueDate,
          completedAt: updates.status === 'done' ? completedAt : updates.status !== 'done' ? null : undefined
        }
      });
      
      return {
        id: task.id,
        projectId: task.projectId,
        title: task.title,
        description: task.description || undefined,
        assigneeId: task.assigneeId || undefined,
        status: task.status as 'todo' | 'in_progress' | 'done',
        priority: task.priority as 'low' | 'medium' | 'high',
        dueDate: task.dueDate || undefined,
        completedAt: task.completedAt || undefined,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      await prisma.task.delete({
        where: { id: taskId }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Chat methods
  async getChatMessages(projectId: string): Promise<(ChatMessage & { user: User })[]> {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: { projectId },
        include: { user: true },
        orderBy: { createdAt: 'asc' }
      });
      
      return messages.map(message => ({
        id: message.id,
        projectId: message.projectId,
        userId: message.userId,
        content: message.content,
        createdAt: message.createdAt,
        user: {
          id: message.user.id,
          email: message.user.email,
          firstName: message.user.firstName || undefined,
          lastName: message.user.lastName || undefined,
          profileImageUrl: message.user.profileImageUrl || undefined,
          createdAt: message.user.createdAt,
          updatedAt: message.user.updatedAt
        }
      }));
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  },

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    try {
      const message = await prisma.chatMessage.create({
        data: {
          projectId: messageData.projectId,
          userId: messageData.userId,
          content: messageData.content
        }
      });
      
      return {
        id: message.id,
        projectId: message.projectId,
        userId: message.userId,
        content: message.content,
        createdAt: message.createdAt
      };
    } catch (error) {
      console.error('Error creating chat message:', error);
      throw error;
    }
  },

  // Notification methods
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      
      return notifications.map(notification => ({
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          isRead: notificationData.isRead || false
        }
      });
      
      return {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
};
