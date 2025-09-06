// This is a simplified schema file without external dependencies
// We're only including the types needed for the application

// Project types
export type Project = {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'on_hold' | 'completed';
  progress: number;
  tags?: string;
  imageUrl?: string;
  testUserAssigned?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertProject = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

// Task types
export type Task = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>;

// User types
export type User = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UpsertUser = Omit<User, 'createdAt' | 'updatedAt'>;

// Project member types
export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  role: 'manager' | 'member';
  joinedAt: Date;
};

// Chat message types
export type ChatMessage = {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  createdAt: Date;
};

export type InsertChatMessage = Omit<ChatMessage, 'id' | 'createdAt'>;

// Notification types
export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

export type InsertNotification = Omit<Notification, 'id' | 'createdAt'>;

// Schema validation functions
export const validateProject = (project: any): InsertProject => {
  // Basic validation
  if (!project.name) {
    throw new Error('Project name is required');
  }
  
  return {
    name: project.name,
    description: project.description,
    managerId: project.managerId,
    deadline: project.deadline ? new Date(project.deadline) : undefined,
    priority: project.priority || 'medium',
    status: project.status || 'active',
    progress: project.progress || 0,
    tags: project.tags,
    imageUrl: project.imageUrl,
    testUserAssigned: project.testUserAssigned || false
  };
};

export const validateTask = (task: any): InsertTask => {
  // Basic validation
  if (!task.title) {
    throw new Error('Task title is required');
  }
  if (!task.projectId) {
    throw new Error('Project ID is required');
  }
  
  return {
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    assigneeId: task.assigneeId,
    status: task.status || 'todo',
    priority: task.priority || 'medium',
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined
  };
};

export const validateChatMessage = (message: any): InsertChatMessage => {
  // Basic validation
  if (!message.content) {
    throw new Error('Message content is required');
  }
  if (!message.projectId) {
    throw new Error('Project ID is required');
  }
  if (!message.userId) {
    throw new Error('User ID is required');
  }
  
  return {
    projectId: message.projectId,
    userId: message.userId,
    content: message.content
  };
};

// Aliases for backward compatibility
export const insertProjectSchema = {
  parse: validateProject
};

export const insertTaskSchema = {
  parse: validateTask
};

export const insertChatMessageSchema = {
  parse: validateChatMessage
};