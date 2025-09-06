import express from 'express';
import { storage } from '../storage';
import { validateProject } from '@shared/schema';
import { authenticateClerkToken } from '../middleware/clerk';

const router = express.Router();

// Get all projects
router.get('/', authenticateClerkToken, async (req: any, res, next) => {
  try {
    const userId = req.user.userId;
    const projects = await storage.getProjects(userId);
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// Get project by ID
router.get('/:id', authenticateClerkToken, async (req: any, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await storage.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// Create new project
router.post('/', authenticateClerkToken, async (req: any, res, next) => {
  try {
    const userId = req.user.userId;
    const projectData = validateProject({
      ...req.body,
      managerId: userId,
    });
    
    const project = await storage.createProject(projectData);
    
    // Create notification for team members
    if (req.body.memberIds && req.body.memberIds.length > 0) {
      for (const memberId of req.body.memberIds) {
        if (memberId !== userId) {
          await storage.addProjectMember(project.id, memberId);
          await storage.createNotification({
            userId: memberId,
            type: 'project_created',
            title: 'New Project Assignment',
            message: `You've been added to the project "${project.name}"`,
          });
        }
      }
    }
    
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

// Update project
router.put('/:id', authenticateClerkToken, async (req: any, res, next) => {
  try {
    const projectId = req.params.id;
    const updates = req.body;
    
    const project = await storage.updateProject(projectId, updates);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// Delete project
router.delete('/:id', authenticateClerkToken, async (req: any, res, next) => {
  try {
    const projectId = req.params.id;
    await storage.deleteProject(projectId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get project tasks
router.get('/:id/tasks', authenticateClerkToken, async (req: any, res, next) => {
  try {
    const projectId = req.params.id;
    const tasks = await storage.getTasksByProject(projectId);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Get project members
router.get('/:id/members', authenticateClerkToken, async (req: any, res, next) => {
  try {
    const projectId = req.params.id;
    const members = await storage.getProjectMembers(projectId);
    res.json(members);
  } catch (error) {
    next(error);
  }
});

export default router;