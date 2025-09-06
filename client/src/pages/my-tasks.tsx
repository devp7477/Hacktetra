import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import TaskItem from "@/components/tasks/task-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CalendarIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon } from "lucide-react";

export default function MyTasks() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: tasks = [], error, isError } = useQuery({
    queryKey: ['/api/tasks/my'],
  });

  // Handle unauthorized errors
  useEffect(() => {
    // Skip authentication errors in development mode
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    
    if (isError && error && isUnauthorizedError(error as Error)) {
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
  }, [isError, error, toast]);

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

  if (isLoading) {
    return (
      <MainLayout title="My Tasks">
        <div className="p-4 lg:p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Filter tasks
  const filteredTasks = tasks.filter((task: any) => {
    const statusMatch = statusFilter === "all" || task.status === statusFilter;
    const priorityMatch = priorityFilter === "all" || task.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  // Calculate task stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t: any) => t.status === 'todo').length,
    inProgress: tasks.filter((t: any) => t.status === 'in_progress').length,
    completed: tasks.filter((t: any) => t.status === 'done').length,
  };

  // Group tasks by status for better organization
  const todoTasks = filteredTasks.filter((t: any) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t: any) => t.status === 'in_progress');
  const completedTasks = filteredTasks.filter((t: any) => t.status === 'done');

  return (
    <MainLayout title="My Tasks">
      <div className="p-4 lg:p-6" data-testid="my-tasks-page">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-lg font-medium mb-1">My Tasks</h2>
            <p className="text-sm text-muted-foreground">Track and manage your assigned tasks</p>
          </div>
          <div className="flex space-x-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32" data-testid="select-priority-filter">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card data-testid="stat-total-tasks">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold" data-testid="stat-value-total-tasks">
                    {stats.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-todo-tasks">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-gray-500/10 rounded-lg mr-3">
                  <AlertCircleIcon className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold" data-testid="stat-value-todo-tasks">
                    {stats.todo}
                  </div>
                  <div className="text-sm text-muted-foreground">To Do</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-in-progress-tasks">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500/10 rounded-lg mr-3">
                  <ClockIcon className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold" data-testid="stat-value-in-progress-tasks">
                    {stats.inProgress}
                  </div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-completed-tasks">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/10 rounded-lg mr-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold" data-testid="stat-value-completed-tasks">
                    {stats.completed}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks by Status */}
        {filteredTasks.length > 0 ? (
          <div className="space-y-6">
            {/* To Do Tasks */}
            {todoTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircleIcon className="h-5 w-5 mr-2 text-gray-500" />
                    To Do ({todoTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div data-testid="todo-tasks-list">
                    {todoTasks.map((task: any) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* In Progress Tasks */}
            {inProgressTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2 text-yellow-500" />
                    In Progress ({inProgressTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div data-testid="in-progress-tasks-list">
                    {inProgressTasks.map((task: any) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                    Completed ({completedTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div data-testid="completed-tasks-list">
                    {completedTasks.map((task: any) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {statusFilter === "all" && priorityFilter === "all" 
                  ? "No tasks assigned" 
                  : "No tasks match your filters"
                }
              </h3>
              <p className="text-muted-foreground mb-6">
                {statusFilter === "all" && priorityFilter === "all"
                  ? "Tasks assigned to you will appear here. Check with your project manager for new assignments."
                  : "Try adjusting your filters to see more tasks, or check with your team for new assignments."
                }
              </p>
              {(statusFilter !== "all" || priorityFilter !== "all") && (
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setStatusFilter("all")}
                    data-testid="button-clear-status-filter"
                  >
                    Clear Status Filter
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setPriorityFilter("all")}
                    data-testid="button-clear-priority-filter"
                  >
                    Clear Priority Filter
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
