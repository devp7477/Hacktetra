-- Update Project table
ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "tags" TEXT;
ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "image_url" TEXT;
ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "test_user_assigned" BOOLEAN DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "project_status_idx" ON "project"("status");
CREATE INDEX IF NOT EXISTS "project_priority_idx" ON "project"("priority");
CREATE INDEX IF NOT EXISTS "task_status_idx" ON "task"("status");
CREATE INDEX IF NOT EXISTS "task_priority_idx" ON "task"("priority");
CREATE INDEX IF NOT EXISTS "task_project_id_idx" ON "task"("projectId");
