import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('Applying migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../prisma/migrations/20250906_update_project/migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL into separate statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(`${statement};`);
      console.log(`Executed: ${statement.substring(0, 50)}...`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
