import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import TaskItem from "@/components/tasks/task-item";
import CreateTaskModal from "@/components/tasks/create-task-modal";
import ChatPanel from "@/components/chat/chat-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronRightIcon, 
  MessageCircleIcon,
  SettingsIcon,
  CalendarIcon,
  UsersIcon,
  ChartScatter
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { clerkApi } from "@/lib/clerkApi";

export default function ProjectDetail() {
  const { id: projectId } = useParams();
  const [taskFilter, setTaskFilter] = useState("all");
  const [chatOpen, setChatOpen] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: project, error: projectError, isError: isProjectError } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    queryFn: () => projectId ? clerkApi.getProject(projectId) : null,
    enabled: !!projectId,
  });

  const { data: tasks = [], error: tasksError, isError: isTasksError } = useQuery({
    queryKey: [`/api/projects/${projectId}/tasks`],
    queryFn: () => projectId ? clerkApi.getProjectTasks(projectId) : [],
    enabled: !!projectId && !!project,
  });

  const { data: members = [] } = useQuery({
    queryKey: [`/api/projects/${projectId}/members`],
    queryFn: () => clerkApi.getTeamMembers(),
    enabled: !!projectId && !!project,
  });

  // Handle unauthorized errors
  useEffect(() => {
    // Skip authentication errors in development mode
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    
    const handleUnauthorized = (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }
    };

    if (isProjectError && projectError) {
      handleUnauthorized(projectError as Error);
    }
    if (isTasksError && tasksError) {
      handleUnauthorized(tasksError as Error);
    }
  }, [isProjectError, projectError, isTasksError, tasksError, toast]);

  // Redirect if not authenticated
  useEffect(() => {
    // Skip authentication check in development mode
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (!projectId) {
    return <div>Project not found</div>;
  }

  // Handle loading state
  const isPageLoading = isLoading || !project;
  
  // Handle error state
  if (isProjectError && !project) {
    return (
      <MainLayout title="Error">
        <div className="p-4 lg:p-6 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The project you're looking for could not be found or you don't have access to it.
            </p>
            <Link href="/projects">
              <Button>Back to Projects</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Handle loading state
  if (isPageLoading) {
    return (
      <MainLayout title="Loading...">
        <div className="p-4 lg:p-6">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 bg-muted rounded w-4"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-64 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Filter tasks
  const filteredTasks = tasks.filter((task: any) => 
    taskFilter === "all" || task.status === taskFilter
  );

  // Calculate task stats
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t: any) => t.status === 'done').length,
    remaining: tasks.filter((t: any) => t.status !== 'done').length,
  };

  const statusColors = {
    active: "bg-green-500/10 text-green-500",
    on_hold: "bg-yellow-500/10 text-yellow-500",
    completed: "bg-gray-500/10 text-gray-500",
  };

  return (
    <MainLayout title="Project Details">
      <div className="p-4 lg:p-6" data-testid="project-detail-page">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6" data-testid="breadcrumb">
          <Link href="/projects" className="hover:text-foreground">
            Projects
          </Link>
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-foreground">{project.name}</span>
        </nav>

        {/* Project Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="flex items-start space-x-4">
            <div className="p-4 bg-primary/10 rounded-xl">
              <ChartScatter className="text-primary text-2xl h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2" data-testid="text-project-name">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-muted-foreground mb-4" data-testid="text-project-description">
                  {project.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {project.deadline && (
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Due: {format(new Date(project.deadline), "MMM d, yyyy")}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <UsersIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{members.length} members</span>
                </div>
                <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setChatOpen(true)}
              data-testid="button-open-chat"
            >
              <MessageCircleIcon className="mr-2 h-4 w-4" />
              Chat
            </Button>
            <Button variant="outline">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <CreateTaskModal projectId={projectId} />
          </div>
        </div>

        {/* Project Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Project Progress</CardTitle>
                  <span className="text-2xl font-bold text-primary" data-testid="text-project-progress">
                    {project.progress || 0}%
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={project.progress || 0} className="w-full mb-4" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-muted-foreground" data-testid="text-total-tasks">
                      {taskStats.total}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Tasks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-green-500" data-testid="text-completed-tasks">
                      {taskStats.completed}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-yellow-500" data-testid="text-remaining-tasks">
                      {taskStats.remaining}
                    </div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3" data-testid="team-members-list">
                  {members.map((member: any) => (
                    <div key={member.id} className="flex items-center space-x-3" data-testid={`member-${member.id}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profileImageUrl} />
                        <AvatarFallback className="text-xs">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {member.role || 'Member'}
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tasks Section */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Tasks</CardTitle>
              <div className="flex items-center space-x-3">
                <Select value={taskFilter} onValueChange={setTaskFilter}>
                  <SelectTrigger className="w-32" data-testid="select-task-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                <CreateTaskModal projectId={projectId}>
                  <Button variant="ghost" size="sm">
                    <span className="text-primary">+</span>
                  </Button>
                </CreateTaskModal>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredTasks.length > 0 ? (
              <div data-testid="tasks-list">
                {filteredTasks.map((task: any) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>
                  {taskFilter === "all" 
                    ? "No tasks in this project yet."
                    : `No ${taskFilter.replace('_', ' ')} tasks.`
                  }
                </p>
                <p className="text-sm mt-1">
                  {taskFilter === "all" 
                    ? "Create your first task to get started."
                    : "Try changing the filter or create a new task."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chat Panel */}
      <ChatPanel
        projectId={projectId}
        projectName={project.name}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </MainLayout>
  );
}
