import { PrismaClient } from '@prisma/client';
import { log } from '../utils';

// This script will create a user in the database

async function main() {
  log('Creating user...');
  
  const prisma = new PrismaClient();
  
  try {
    // Create tables if they don't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" TEXT UNIQUE,
        "firstName" TEXT,
        "lastName" TEXT,
        "profileImageUrl" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    log('User table created or already exists');
    
    // Create a test user
    const user = await prisma.$executeRaw`
      INSERT INTO "user" ("email", "firstName", "lastName", "profileImageUrl", "updatedAt")
      VALUES ('test@example.com', 'Test', 'User', 'https://ui-avatars.com/api/?name=Test+User', CURRENT_TIMESTAMP)
      ON CONFLICT (email) DO NOTHING
    `;
    
    log('User created or already exists');
    
    log('Done');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
