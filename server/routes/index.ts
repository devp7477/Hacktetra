import express from 'express';
import projectsRouter from './projects';

const router = express.Router();

// API routes
router.use('/projects', projectsRouter);

// Add more routes here as you build them
// router.use('/tasks', tasksRouter);
// router.use('/users', usersRouter);
// router.use('/auth', authRouter);

export default router;
