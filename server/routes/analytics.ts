import express from 'express';
import { prisma } from '../prisma-client';
import { authenticateClerkToken } from '../middleware/clerk';

const router = express.Router();

// Get analytics data
router.get('/', async (req: any, res, next) => {
  // Skip authentication for development
  if (process.env.NODE_ENV !== 'development') {
    try {
      authenticateClerkToken(req, res, () => {});
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
  
  // Set a default user ID for development
  if (process.env.NODE_ENV === 'development' && !req.user) {
    req.user = { userId: 'dev-user-123' };
  }
  try {
    const userId = req.user.userId;
    let projects = [];
    let tasks = [];

    try {
      // Get all projects where user is manager or member
      projects = await prisma.project.findMany({
        where: {
          OR: [
            { managerId: userId },
            { members: { some: { userId } } }
          ]
        }
      });

      // Get all tasks assigned to the user
      tasks = await prisma.task.findMany({
        where: {
          OR: [
            { assigneeId: userId },
            { project: { managerId: userId } }
          ]
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Provide mock data for development
      if (process.env.NODE_ENV === 'development') {
        projects = [
          { id: 'mock1', name: 'Mock Project 1', status: 'active', progress: 50 },
          { id: 'mock2', name: 'Mock Project 2', status: 'completed', progress: 100 },
          { id: 'mock3', name: 'Mock Project 3', status: 'on_hold', progress: 30 }
        ];
        tasks = [
          { id: 'task1', status: 'todo', priority: 'high', projectId: 'mock1' },
          { id: 'task2', status: 'in_progress', priority: 'medium', projectId: 'mock1' },
          { id: 'task3', status: 'done', priority: 'low', projectId: 'mock2' },
          { id: 'task4', status: 'todo', priority: 'high', projectId: 'mock3' },
          { id: 'task5', status: 'in_progress', priority: 'medium', projectId: 'mock2' }
        ];
      }
    }

    // Calculate analytics data
    const analytics = {
      // Task Distribution
      taskDistribution: {
        todo: tasks.filter(task => task.status === 'todo').length,
        in_progress: tasks.filter(task => task.status === 'in_progress').length,
        done: tasks.filter(task => task.status === 'done').length
      },
      
      // Project Status
      projectStatus: {
        active: projects.filter(project => project.status === 'active').length,
        on_hold: projects.filter(project => project.status === 'on_hold').length,
        completed: projects.filter(project => project.status === 'completed').length
      },
      
      // Task Priority
      taskPriority: {
        high: tasks.filter(task => task.priority === 'high').length,
        medium: tasks.filter(task => task.priority === 'medium').length,
        low: tasks.filter(task => task.priority === 'low').length
      },
      
      // Summary statistics
      summary: {
        totalProjects: projects.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(task => task.status === 'done').length,
        completionRate: tasks.length > 0 
          ? (tasks.filter(task => task.status === 'done').length / tasks.length) * 100 
          : 0
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    next(error);
  }
});

// Get detailed project analytics
router.get('/projects', async (req: any, res, next) => {
  // Skip authentication for development
  if (process.env.NODE_ENV !== 'development') {
    try {
      authenticateClerkToken(req, res, () => {});
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
  
  // Set a default user ID for development
  if (process.env.NODE_ENV === 'development' && !req.user) {
    req.user = { userId: 'dev-user-123' };
  }
  try {
    const userId = req.user.userId;

    // Get all projects with task counts
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { managerId: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        _count: {
          select: {
            tasks: true
          }
        },
        tasks: {
          select: {
            status: true
          }
        }
      }
    });

    // Process data for charts
    const projectAnalytics = projects.map(project => {
      const completedTasks = project.tasks.filter(task => task.status === 'done').length;
      const totalTasks = project._count.tasks;
      
      return {
        id: project.id,
        name: project.name,
        status: project.status,
        progress: project.progress,
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      };
    });

    res.json(projectAnalytics);
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    next(error);
  }
});

// Get detailed task analytics
router.get('/tasks', async (req: any, res, next) => {
  // Skip authentication for development
  if (process.env.NODE_ENV !== 'development') {
    try {
      authenticateClerkToken(req, res, () => {});
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
  
  // Set a default user ID for development
  if (process.env.NODE_ENV === 'development' && !req.user) {
    req.user = { userId: 'dev-user-123' };
  }
  try {
    const userId = req.user.userId;

    // Get task statistics by project
    const tasksByProject = await prisma.project.findMany({
      where: {
        OR: [
          { managerId: userId },
          { members: { some: { userId } } }
        ]
      },
      select: {
        id: true,
        name: true,
        tasks: {
          select: {
            status: true,
            priority: true,
            createdAt: true,
            completedAt: true
          }
        }
      }
    });

    // Process data for charts
    const taskAnalytics = tasksByProject.map(project => {
      const tasks = project.tasks;
      
      return {
        projectId: project.id,
        projectName: project.name,
        totalTasks: tasks.length,
        statusDistribution: {
          todo: tasks.filter(task => task.status === 'todo').length,
          in_progress: tasks.filter(task => task.status === 'in_progress').length,
          done: tasks.filter(task => task.status === 'done').length
        },
        priorityDistribution: {
          high: tasks.filter(task => task.priority === 'high').length,
          medium: tasks.filter(task => task.priority === 'medium').length,
          low: tasks.filter(task => task.priority === 'low').length
        }
      };
    });

    res.json(taskAnalytics);
  } catch (error) {
    console.error('Error fetching task analytics:', error);
    next(error);
  }
});

export default router;
