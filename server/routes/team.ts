import express from 'express';
import { storage } from '../storage';
import { authenticateClerkToken } from '../middleware/clerk';

const router = express.Router();

// Get all team members
router.get('/members', authenticateClerkToken, async (req: any, res, next) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ message: "Failed to fetch team members" });
  }
});

// Get team managers
router.get('/managers', authenticateClerkToken, async (req: any, res, next) => {
  try {
    const managers = await storage.getManagers();
    res.json(managers);
  } catch (error) {
    next(error);
  }
});

// Invite a new team member
router.post('/invite', authenticateClerkToken, async (req: any, res, next) => {
  try {
    const { email, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Create a new user with the email
    const user = await storage.createUser({
      id: `user-${Date.now()}`,
      email,
      firstName: email.split('@')[0],
      lastName: '',
      profileImageUrl: `https://ui-avatars.com/api/?name=${email.split('@')[0]}`
    });
    
    // Send notification to the user
    await storage.createNotification({
      userId: user.id,
      type: 'team_invitation',
      title: 'Welcome to SynergySphere',
      message: `You've been invited to join the team as a ${role || 'member'}.`,
    });
    
    res.status(201).json(user);
  } catch (error) {
    console.error("Error inviting team member:", error);
    res.status(500).json({ message: "Failed to invite team member" });
  }
});

export default router;
