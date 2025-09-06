import { PrismaClient } from '@prisma/client';
import { log } from '../utils';

async function main() {
  log('Creating database tables...');
  
  const prisma = new PrismaClient();
  
  try {
    // Create a test user
    log('Creating test user...');
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        profileImageUrl: 'https://ui-avatars.com/api/?name=Test+User'
      }
    });
    
    log(`Created test user with ID: ${user.id}`);
    
    // Create a sample project
    log('Creating sample project...');
    
    const project = await prisma.project.create({
      data: {
        name: 'Sample Project',
        description: 'This is a sample project created during database migration',
        managerId: user.id,
        priority: 'medium',
        status: 'active',
        progress: 0
      }
    });
    
    log(`Created sample project with ID: ${project.id}`);
    
    // Add user as project member
    log('Adding user as project member...');
    
    const projectMember = await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: user.id,
        role: 'manager'
      }
    });
    
    log(`Created project member with ID: ${projectMember.id}`);
    
    // Create sample tasks
    log('Creating sample tasks...');
    
    const task1 = await prisma.task.create({
      data: {
        projectId: project.id,
        title: 'Setup project repository',
        description: 'Initialize git repository and project structure',
        assigneeId: user.id,
        status: 'done',
        priority: 'high'
      }
    });
    
    log(`Created task with ID: ${task1.id}`);
    
    const task2 = await prisma.task.create({
      data: {
        projectId: project.id,
        title: 'Design database schema',
        description: 'Create database models and relationships',
        assigneeId: user.id,
        status: 'in_progress',
        priority: 'high'
      }
    });
    
    log(`Created task with ID: ${task2.id}`);
    
    const task3 = await prisma.task.create({
      data: {
        projectId: project.id,
        title: 'Implement authentication',
        description: 'Set up user authentication and authorization',
        assigneeId: user.id,
        status: 'todo',
        priority: 'medium'
      }
    });
    
    log(`Created task with ID: ${task3.id}`);
    
    // Create a sample chat message
    log('Creating sample chat message...');
    
    const chatMessage = await prisma.chatMessage.create({
      data: {
        projectId: project.id,
        userId: user.id,
        content: 'Project initialized successfully!'
      }
    });
    
    log(`Created chat message with ID: ${chatMessage.id}`);
    
    // Create a sample notification
    log('Creating sample notification...');
    
    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'welcome',
        title: 'Welcome to SynergySphere',
        message: 'Get started by exploring your first project',
        isRead: false
      }
    });
    
    log(`Created notification with ID: ${notification.id}`);
    
    log('Database setup completed successfully');
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
