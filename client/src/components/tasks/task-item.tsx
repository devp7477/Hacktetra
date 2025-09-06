import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { MessageCircleIcon } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string;
  completedAt?: string;
  assignee?: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

interface TaskItemProps {
  task: Task;
  onClick?: () => void;
}

const statusColors = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-yellow-500/10 text-yellow-500",
  done: "bg-green-500/10 text-green-500",
};

const priorityColors = {
  low: "bg-blue-500/10 text-blue-500",
  medium: "bg-green-500/10 text-green-500",
  high: "bg-red-500/10 text-red-500",
};

export default function TaskItem({ task, onClick }: TaskItemProps) {
  const [isCompleted, setIsCompleted] = useState(task.status === 'done');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: async (updates: { status: string }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${task.id}/status`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error) => {
      // Skip error toasts in development mode
      if (process.env.NODE_ENV !== 'development') {
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        });
      }
      
      console.error("Task update error:", error);
      setIsCompleted(!isCompleted);
    },
  });

  const handleCheckboxChange = (checked: boolean) => {
    setIsCompleted(checked);
    updateTaskMutation.mutate({
      status: checked ? 'done' : 'todo',
    });
  };

  return (
    <div 
      className="p-6 hover:bg-accent/50 transition-colors cursor-pointer border-b border-border"
      onClick={onClick}
      data-testid={`task-item-${task.id}`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex items-center mt-1">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            data-testid={`checkbox-task-${task.id}`}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 
              className={cn(
                "font-medium",
                isCompleted && "line-through text-muted-foreground"
              )}
              data-testid="text-task-title"
            >
              {task.title}
            </h4>
            <Badge className={cn("text-xs", priorityColors[task.priority as keyof typeof priorityColors])}>
              {task.priority}
            </Badge>
            <Badge className={cn("text-xs", statusColors[task.status as keyof typeof statusColors])}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground mb-3" data-testid="text-task-description">
              {task.description}
            </p>
          )}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {task.assignee && (
              <div className="flex items-center">
                <Avatar className="h-5 w-5 mr-2">
                  <AvatarImage src={task.assignee.profileImageUrl} />
                  <AvatarFallback className="text-xs">
                    {task.assignee.firstName[0]}{task.assignee.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <span data-testid="text-task-assignee">
                  {task.assignee.firstName} {task.assignee.lastName}
                </span>
              </div>
            )}
            {task.dueDate && !task.completedAt && (
              <span data-testid="text-task-due-date">
                Due {format(new Date(task.dueDate), "MMM d")}
              </span>
            )}
            {task.completedAt && (
              <span data-testid="text-task-completed-date">
                Completed {format(new Date(task.completedAt), "MMM d")}
              </span>
            )}
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <MessageCircleIcon className="h-3 w-3 mr-1" />
              <span className="text-xs">0</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
