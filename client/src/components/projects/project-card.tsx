import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  deadline: string;
  manager: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

interface ProjectCardProps {
  project: Project;
}

const statusColors = {
  active: "bg-green-500/10 text-green-500",
  on_hold: "bg-yellow-500/10 text-yellow-500", 
  completed: "bg-gray-500/10 text-gray-500",
};

const priorityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer" 
        data-testid={`card-project-${project.id}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <div className="w-6 h-6 bg-primary rounded text-primary-foreground flex items-center justify-center text-xl font-bold">
                {project.name[0]}
              </div>
            </div>
            <Badge className={cn("text-xs", statusColors[project.status as keyof typeof statusColors])}>
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
          
          <h3 className="font-semibold text-lg mb-2" data-testid="text-project-name">
            {project.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2" data-testid="text-project-description">
            {project.description}
          </p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Avatar className="h-6 w-6">
                <AvatarImage src={project.manager?.profileImageUrl || ''} />
                <AvatarFallback className="text-xs">
                  {project.manager?.firstName?.[0] || ''}{project.manager?.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <span className="ml-2 text-sm text-muted-foreground">
                {project.manager?.firstName || 'Unknown'} {project.manager?.lastName || ''}
              </span>
            </div>
            {project.deadline && (
              <span className="text-sm text-muted-foreground" data-testid="text-project-deadline">
                Due {format(new Date(project.deadline), "MMM d, yyyy")}
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium" data-testid="text-project-progress">
                {project.progress}%
              </span>
            </div>
            <Progress 
              value={project.progress} 
              className="w-full"
              style={{
                '--progress-background': priorityColors[project.priority as keyof typeof priorityColors]
              } as React.CSSProperties}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
