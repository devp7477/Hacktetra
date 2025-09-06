import { apiRequest } from "./queryClient";

const API_BASE_URL = "http://localhost:5002";

export class ClerkApiClient {
  private getToken: (() => Promise<string | null>) | null = null;
  private tokenCache: string | null = null;
  private tokenExpiry: number = 0;

  setTokenGetter(getToken: () => Promise<string | null>) {
    this.getToken = getToken;
    // Clear any cached token when setting a new getter
    this.tokenCache = null;
    this.tokenExpiry = 0;
  }

  async getAuthToken(): Promise<string | null> {
    // If we have a cached token that's not expired, use it
    const now = Date.now();
    if (this.tokenCache && now < this.tokenExpiry) {
      return this.tokenCache;
    }

    // Otherwise, get a new token
    if (this.getToken) {
      try {
        const token = await this.getToken();
        if (token) {
          this.tokenCache = token;
          // Set expiry to 55 minutes (Clerk tokens typically last 60 min)
          this.tokenExpiry = now + (55 * 60 * 1000);
          return token;
        }
      } catch (error) {
        console.error("Failed to get auth token:", error);
        // Clear cache on error
        this.tokenCache = null;
        this.tokenExpiry = 0;
      }
    }

    // For development, return a mock token if no real token is available
    if (process.env.NODE_ENV === 'development') {
      return 'dev-mock-token';
    }

    return null;
  }

  private async makeRequest(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<Response> {
    const token = await this.getAuthToken();
    return apiRequest(method, `${API_BASE_URL}${endpoint}`, data, token || undefined);
  }

  // Projects
  async getProjects() {
    try {
      const response = await this.makeRequest("GET", "/api/projects");
      if (!response.ok) {
        // In development mode, return mock data
        if (process.env.NODE_ENV === 'development') {
          console.log("Using mock project data for development");
          return this.getMockProjects();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      // Fallback to mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log("Error fetching projects, using mock data:", error);
        return this.getMockProjects();
      }
      throw error;
    }
  }
  
  // Mock projects for development
  getMockProjects() {
    return [
      {
        id: "proj-1",
        name: "Website Redesign",
        description: "Complete overhaul of the company website with modern design and improved user experience",
        status: "active",
        priority: "high",
        progress: 65,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        manager: {
          firstName: "Alex",
          lastName: "Johnson",
        },
        tasks: 12,
        completedTasks: 8,
        team: 5
      },
      {
        id: "proj-2",
        name: "Mobile App Development",
        description: "Creating a native mobile application for iOS and Android platforms",
        status: "active",
        priority: "medium",
        progress: 40,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        manager: {
          firstName: "Sarah",
          lastName: "Miller",
        },
        tasks: 20,
        completedTasks: 8,
        team: 4
      },
      {
        id: "proj-3",
        name: "Marketing Campaign",
        description: "Q4 digital marketing campaign across social media and email platforms",
        status: "on_hold",
        priority: "low",
        progress: 20,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        manager: {
          firstName: "Michael",
          lastName: "Brown",
        },
        tasks: 15,
        completedTasks: 3,
        team: 3
      },
      {
        id: "proj-4",
        name: "Database Migration",
        description: "Migrate legacy database to new cloud infrastructure with zero downtime",
        status: "completed",
        priority: "high",
        progress: 100,
        deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        manager: {
          firstName: "Emily",
          lastName: "Davis",
        },
        tasks: 18,
        completedTasks: 18,
        team: 6
      }
    ];
  }

  async getProject(id: string) {
    try {
      const response = await this.makeRequest("GET", `/api/projects/${id}`);
      if (!response.ok) {
        // In development mode, return mock data
        if (process.env.NODE_ENV === 'development') {
          console.log("Using mock project data for development");
          // Find the project in our mock data
          const mockProjects = this.getMockProjects();
          const project = mockProjects.find(p => p.id === id);
          if (project) {
            return project;
          }
          // If not found, return a default project
          return this.getMockProjects()[0];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      // Fallback to mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log("Error fetching project, using mock data:", error);
        // Return first mock project as fallback
        return this.getMockProjects()[0];
      }
      throw error;
    }
  }

  async createProject(data: any) {
    const response = await this.makeRequest("POST", "/api/projects", data);
    return response.json();
  }

  async updateProject(id: string, data: any) {
    const response = await this.makeRequest("PUT", `/api/projects/${id}`, data);
    return response.json();
  }

  async deleteProject(id: string) {
    const response = await this.makeRequest("DELETE", `/api/projects/${id}`);
    return response;
  }

  // Tasks
  async getMyTasks() {
    try {
      const response = await this.makeRequest("GET", "/api/tasks/my");
      if (!response.ok) {
        // In development mode, return mock data
        if (process.env.NODE_ENV === 'development') {
          console.log("Using mock tasks data for development");
          return this.getMockTasks();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      // Fallback to mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log("Error fetching tasks, using mock data:", error);
        return this.getMockTasks();
      }
      throw error;
    }
  }
  
  // Mock tasks for development
  getMockTasks() {
    const projects = this.getMockProjects();
    return [
      {
        id: "task-1",
        title: "Design homepage wireframes",
        description: "Create wireframes for the new homepage design",
        status: "in_progress",
        priority: "high",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        projectId: projects[0].id,
        projectName: projects[0].name,
        assignedTo: {
          firstName: "You",
          lastName: "",
        }
      },
      {
        id: "task-2",
        title: "Implement user authentication",
        description: "Add login and registration functionality",
        status: "todo",
        priority: "high",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        projectId: projects[1].id,
        projectName: projects[1].name,
        assignedTo: {
          firstName: "You",
          lastName: "",
        }
      },
      {
        id: "task-3",
        title: "Create social media assets",
        description: "Design graphics for Facebook and Instagram campaign",
        status: "done",
        priority: "medium",
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        projectId: projects[2].id,
        projectName: projects[2].name,
        assignedTo: {
          firstName: "You",
          lastName: "",
        }
      },
      {
        id: "task-4",
        title: "Test database migration script",
        description: "Run tests on the migration script in staging environment",
        status: "done",
        priority: "high",
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        projectId: projects[3].id,
        projectName: projects[3].name,
        assignedTo: {
          firstName: "You",
          lastName: "",
        }
      }
    ];
  }

  async getProjectTasks(projectId: string) {
    try {
      const response = await this.makeRequest("GET", `/api/projects/${projectId}/tasks`);
      if (!response.ok) {
        // In development mode, return mock data
        if (process.env.NODE_ENV === 'development') {
          console.log("Using mock project tasks data for development");
          return this.getMockProjectTasks(projectId);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      // Fallback to mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log("Error fetching project tasks, using mock data:", error);
        return this.getMockProjectTasks(projectId);
      }
      throw error;
    }
  }
  
  // Mock project tasks for development
  getMockProjectTasks(projectId: string) {
    // Filter tasks by project ID
    const allTasks = this.getMockTasks();
    return allTasks.filter(task => task.projectId === projectId);
  }

  async createTask(data: any) {
    const response = await this.makeRequest("POST", "/api/tasks", data);
    return response.json();
  }

  async updateTaskStatus(id: string, status: string) {
    const response = await this.makeRequest("PATCH", `/api/tasks/${id}/status`, { status });
    return response.json();
  }

  async deleteTask(id: string) {
    const response = await this.makeRequest("DELETE", `/api/tasks/${id}`);
    return response;
  }

  // Team
  async getTeamMembers() {
    try {
      const response = await this.makeRequest("GET", "/api/team/members");
      if (!response.ok) {
        // In development mode, return mock data
        if (process.env.NODE_ENV === 'development') {
          console.log("Using mock team members data for development");
          return this.getMockTeamMembers();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      // Fallback to mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log("Error fetching team members, using mock data:", error);
        return this.getMockTeamMembers();
      }
      throw error;
    }
  }
  
  // Mock team members for development
  getMockTeamMembers() {
    return [
      {
        id: "user-1",
        firstName: "Alex",
        lastName: "Johnson",
        email: "alex@example.com",
        role: "admin",
        profileImageUrl: null
      },
      {
        id: "user-2",
        firstName: "Sarah",
        lastName: "Miller",
        email: "sarah@example.com",
        role: "member",
        profileImageUrl: null
      },
      {
        id: "user-3",
        firstName: "Michael",
        lastName: "Brown",
        email: "michael@example.com",
        role: "member",
        profileImageUrl: null
      },
      {
        id: "user-dev-123",
        firstName: "Dev",
        lastName: "User",
        email: "dev@example.com",
        role: "admin",
        profileImageUrl: null
      }
    ];
  }

  async inviteMember(data: any) {
    const response = await this.makeRequest("POST", "/api/team/invite", data);
    return response.json();
  }

  // Notifications
  async getNotifications() {
    try {
      const response = await this.makeRequest("GET", "/api/notifications");
      if (!response.ok) {
        // In development mode, return mock data
        if (process.env.NODE_ENV === 'development') {
          console.log("Using mock notifications data for development");
          return this.getMockNotifications();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      // Fallback to mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log("Error fetching notifications, using mock data:", error);
        return this.getMockNotifications();
      }
      throw error;
    }
  }
  
  // Mock notifications for development
  getMockNotifications() {
    return [
      {
        id: "notif-1",
        userId: "user-dev-123",
        type: "project_created",
        title: "New Project Created",
        message: "Website Redesign project has been created",
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
      },
      {
        id: "notif-2",
        userId: "user-dev-123",
        type: "task_assigned",
        title: "Task Assigned",
        message: "You have been assigned to 'Design homepage wireframes'",
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        id: "notif-3",
        userId: "user-dev-123",
        type: "comment_added",
        title: "New Comment",
        message: "Alex commented on 'Mobile App Development'",
        isRead: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      }
    ];
  }

  async markNotificationAsRead(id: string) {
    const response = await this.makeRequest("PATCH", `/api/notifications/${id}/read`);
    return response;
  }

  // Analytics
  async getAnalytics() {
    try {
      const response = await this.makeRequest("GET", "/api/analytics");
      if (!response.ok) {
        // In development mode, return mock data
        if (process.env.NODE_ENV === 'development') {
          console.log("Using mock analytics data for development");
          return this.getMockAnalytics();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      // Fallback to mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log("Error fetching analytics data, using mock data:", error);
        return this.getMockAnalytics();
      }
      throw error;
    }
  }

  // Project analytics
  async getProjectAnalytics() {
    try {
      const response = await this.makeRequest("GET", "/api/analytics/projects");
      if (!response.ok) {
        // In development mode, return mock data
        if (process.env.NODE_ENV === 'development') {
          console.log("Using mock project analytics data for development");
          return this.getMockProjectAnalytics();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      // Fallback to mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log("Error fetching project analytics data, using mock data:", error);
        return this.getMockProjectAnalytics();
      }
      throw error;
    }
  }

  // Task analytics
  async getTaskAnalytics() {
    try {
      const response = await this.makeRequest("GET", "/api/analytics/tasks");
      if (!response.ok) {
        // In development mode, return mock data
        if (process.env.NODE_ENV === 'development') {
          console.log("Using mock task analytics data for development");
          return this.getMockTaskAnalytics();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      // Fallback to mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log("Error fetching task analytics data, using mock data:", error);
        return this.getMockTaskAnalytics();
      }
      throw error;
    }
  }

  // Mock analytics data
  getMockAnalytics() {
    return {
      taskDistribution: {
        todo: 5,
        in_progress: 8,
        done: 12
      },
      projectStatus: {
        active: 3,
        on_hold: 1,
        completed: 2
      },
      taskPriority: {
        high: 7,
        medium: 10,
        low: 8
      },
      summary: {
        totalProjects: 6,
        totalTasks: 25,
        completedTasks: 12,
        completionRate: 48
      }
    };
  }

  getMockProjectAnalytics() {
    return this.getMockProjects().map(project => ({
      id: project.id,
      name: project.name,
      status: project.status,
      progress: project.progress,
      totalTasks: Math.floor(Math.random() * 20) + 5,
      completedTasks: Math.floor(Math.random() * 10) + 2,
      completionRate: Math.floor(Math.random() * 100)
    }));
  }

  getMockTaskAnalytics() {
    return this.getMockProjects().map(project => ({
      projectId: project.id,
      projectName: project.name,
      totalTasks: Math.floor(Math.random() * 20) + 5,
      statusDistribution: {
        todo: Math.floor(Math.random() * 5) + 1,
        in_progress: Math.floor(Math.random() * 5) + 1,
        done: Math.floor(Math.random() * 5) + 1
      },
      priorityDistribution: {
        high: Math.floor(Math.random() * 5) + 1,
        medium: Math.floor(Math.random() * 5) + 1,
        low: Math.floor(Math.random() * 5) + 1
      }
    }));
  }

  // Auth
  async getCurrentUser() {
    try {
      const response = await this.makeRequest("GET", "/api/auth/user");
      if (!response.ok) {
        // In development mode, return mock user data
        if (process.env.NODE_ENV === 'development') {
          console.log("Using mock user data for development");
          return this.getMockUser();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      // Fallback to mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log("Error fetching user, using mock data:", error);
        return this.getMockUser();
      }
      throw error;
    }
  }
  
  // Mock user for development
  getMockUser() {
    return {
      id: "user-dev-123",
      firstName: "Dev",
      lastName: "User",
      email: "dev@example.com",
      profileImageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export const clerkApi = new ClerkApiClient();