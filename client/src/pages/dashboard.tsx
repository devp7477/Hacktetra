import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProjectStats from "@/components/projects/project-stats";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: myTasks = [] } = useQuery({
    queryKey: ['/api/tasks/my'],
  });

  // Calculate project stats
  const stats = {
    total: projects.length,
    active: projects.filter((p: any) => p.status === 'active').length,
    onHold: projects.filter((p: any) => p.status === 'on_hold').length,
    completed: projects.filter((p: any) => p.status === 'completed').length,
  };

  // Get recent tasks
  const recentTasks = myTasks
    .filter((task: any) => task.status !== 'done')
    .slice(0, 5);

  // Get recent projects
  const recentProjects = projects
    .filter((project: any) => project.status === 'active')
    .slice(0, 3);

  return (
    <MainLayout title="Dashboard">
      <div className="p-4 lg:p-6" data-testid="dashboard-page">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2" data-testid="text-welcome-message">
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Project Stats */}
        <ProjectStats stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Recent Tasks</CardTitle>
                <Link href="/my-tasks">
                  <span className="text-sm text-primary hover:underline cursor-pointer">
                    View all
                  </span>
                </Link>
              </CardHeader>
              <CardContent>
                {recentTasks.length > 0 ? (
                  <div className="space-y-4">
                    {recentTasks.map((task: any) => (
                      <div key={task.id} className="flex items-center space-x-4 p-3 border rounded-lg" data-testid={`task-summary-${task.id}`}>
                        <div className="flex-1">
                          <h4 className="font-medium" data-testid="text-task-title">
                            {task.title}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {task.project?.name}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                Due {format(new Date(task.dueDate), "MMM d")}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={task.status === 'in_progress' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No active tasks assigned to you.</p>
                    <p className="text-sm">Tasks will appear here when they're assigned.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Active Projects</CardTitle>
                <Link href="/projects">
                  <span className="text-sm text-primary hover:underline cursor-pointer">
                    View all
                  </span>
                </Link>
              </CardHeader>
              <CardContent>
                {recentProjects.length > 0 ? (
                  <div className="space-y-4">
                    {recentProjects.map((project: any) => (
                      <Link key={project.id} href={`/projects/${project.id}`}>
                        <div className="p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer" data-testid={`project-summary-${project.id}`}>
                          <h4 className="font-medium mb-2" data-testid="text-project-name">
                            {project.name}
                          </h4>
                          <div className="flex items-center space-x-2 mb-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={project.manager?.profileImageUrl} />
                              <AvatarFallback className="text-xs">
                                {project.manager?.firstName?.[0]}{project.manager?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {project.manager?.firstName} {project.manager?.lastName}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Progress: {project.progress}%
                            </span>
                            <Badge
                              variant={project.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No active projects.</p>
                    <p className="text-sm">Create your first project to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
