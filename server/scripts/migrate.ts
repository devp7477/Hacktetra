import { PrismaClient } from '@prisma/client';
import { log } from '../utils';

// This script will run database migrations and seed the database with initial data

async function main() {
  log('Starting database migration and seeding process...');
  
  const prisma = new PrismaClient();
  
  try {
    // Create a test user if none exists
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
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
          progress: 0,
          members: {
            create: {
              userId: user.id,
              role: 'manager'
            }
          }
        }
      });
      
      log(`Created sample project with ID: ${project.id}`);
      
      // Create sample tasks
      log('Creating sample tasks...');
      
      await prisma.task.createMany({
        data: [
          {
            projectId: project.id,
            title: 'Setup project repository',
            description: 'Initialize git repository and project structure',
            assigneeId: user.id,
            status: 'done',
            priority: 'high'
          },
          {
            projectId: project.id,
            title: 'Design database schema',
            description: 'Create database models and relationships',
            assigneeId: user.id,
            status: 'in_progress',
            priority: 'high'
          },
          {
            projectId: project.id,
            title: 'Implement authentication',
            description: 'Set up user authentication and authorization',
            assigneeId: user.id,
            status: 'todo',
            priority: 'medium'
          }
        ]
      });
      
      log('Created sample tasks');
      
      // Create a sample chat message
      log('Creating sample chat message...');
      
      await prisma.chatMessage.create({
        data: {
          projectId: project.id,
          userId: user.id,
          content: 'Project initialized successfully!'
        }
      });
      
      log('Created sample chat message');
    } else {
      log('Database already contains users, skipping seed data creation');
    }
    
    log('Database migration and seeding completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
