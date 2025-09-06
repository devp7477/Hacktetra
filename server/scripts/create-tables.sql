-- Create User table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "user" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "email" TEXT UNIQUE,
  "firstName" TEXT,
  "lastName" TEXT,
  "profileImageUrl" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Project table
CREATE TABLE IF NOT EXISTS "project" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "managerId" UUID,
  "deadline" TIMESTAMP,
  "priority" TEXT NOT NULL DEFAULT 'medium',
  "status" TEXT NOT NULL DEFAULT 'active',
  "progress" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Task table
CREATE TABLE IF NOT EXISTS "task" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "assigneeId" UUID,
  "status" TEXT NOT NULL DEFAULT 'todo',
  "priority" TEXT NOT NULL DEFAULT 'medium',
  "dueDate" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE
);

-- Create ProjectMember table
CREATE TABLE IF NOT EXISTS "project_member" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "joinedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
  UNIQUE ("projectId", "userId")
);

-- Create ChatMessage table
CREATE TABLE IF NOT EXISTS "chat_message" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Create Notification table
CREATE TABLE IF NOT EXISTS "notification" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO "user" ("id", "email", "firstName", "lastName", "profileImageUrl", "updatedAt")
VALUES (uuid_generate_v4(), 'test@example.com', 'Test', 'User', 'https://ui-avatars.com/api/?name=Test+User', CURRENT_TIMESTAMP);

-- Get the user ID
DO $$
DECLARE
  user_id UUID;
  project_id UUID;
BEGIN
  SELECT "id" INTO user_id FROM "user" WHERE "email" = 'test@example.com';
  
  -- Insert sample project
  INSERT INTO "project" ("name", "description", "managerId", "priority", "status", "progress")
  VALUES ('Sample Project', 'This is a sample project created during database setup', user_id, 'medium', 'active', 0)
  RETURNING "id" INTO project_id;
  
  -- Insert project member
  INSERT INTO "project_member" ("projectId", "userId", "role")
  VALUES (project_id, user_id, 'manager');
  
  -- Insert sample tasks
  INSERT INTO "task" ("projectId", "title", "description", "assigneeId", "status", "priority")
  VALUES 
    (project_id, 'Setup project repository', 'Initialize git repository and project structure', user_id, 'done', 'high'),
    (project_id, 'Design database schema', 'Create database models and relationships', user_id, 'in_progress', 'high'),
    (project_id, 'Implement authentication', 'Set up user authentication and authorization', user_id, 'todo', 'medium');
  
  -- Insert sample chat message
  INSERT INTO "chat_message" ("projectId", "userId", "content")
  VALUES (project_id, user_id, 'Project initialized successfully!');
  
  -- Insert sample notification
  INSERT INTO "notification" ("userId", "type", "title", "message")
  VALUES (user_id, 'welcome', 'Welcome to SynergySphere', 'Get started by exploring your first project');
END $$;
