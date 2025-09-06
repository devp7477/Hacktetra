import express from 'express';
import { storage } from '../storage';
import { validateTask } from '@shared/schema';
import { authenticateClerkToken } from '../middleware/clerk';

const router = express.Router();

// Get all tasks for a user
router.get('/my', authenticateClerkToken, async (req: any, res, next) => {
  try {
    const userId = req.user.userId;
    const tasks = await storage.getTasksByUser(userId);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Get tasks for a project
router.get('/project/:id', authenticateClerkToken, async (req: any, res, next) => {
  try {
    const projectId = req.params.id;
    const tasks = await storage.getTasksByProject(projectId);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Create new task
router.post('/', authenticateClerkToken, async (req: any, res, next) => {
  try {
    const taskData = validateTask(req.body);
    const task = await storage.createTask(taskData);
    
    // Create notification for assignee
    if (task.assigneeId && task.assigneeId !== req.user.userId) {
      await storage.createNotification({
        userId: task.assigneeId,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You've been assigned the task "${task.title}"`,
      });
    }
    
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
});

// Update task
router.put('/:id', authenticateClerkToken, async (req: any, res, next) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;
    
    const task = await storage.updateTask(taskId, updates);
    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
});

// Update task status (separate endpoint for status updates)
router.patch('/:id/status', authenticateClerkToken, async (req: any, res, next) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    const task = await storage.updateTask(taskId, { status });
    res.json(task);
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ message: "Failed to update task status" });
  }
});

// Delete task
router.delete('/:id', authenticateClerkToken, async (req: any, res, next) => {
  try {
    const taskId = req.params.id;
    await storage.deleteTask(taskId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
