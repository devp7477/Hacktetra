import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import MainLayout from "@/components/layout/main-layout";
import ProjectCard from "@/components/projects/project-card";
import ProjectStats from "@/components/projects/project-stats";
import CreateProjectModal from "@/components/projects/create-project-modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterIcon, PlusIcon } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { clerkApi } from "@/lib/clerkApi";

export default function Projects() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: projects = [], error, isError } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: clerkApi.getProjects,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (isError && error && isUnauthorizedError(error as Error)) {
      // Only show toast in production mode
      if (process.env.NODE_ENV !== 'development') {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }
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
      <MainLayout title="Projects">
        <div className="p-4 lg:p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Filter projects based on status
  const filteredProjects = projects.filter((project: any) => 
    statusFilter === "all" || project.status === statusFilter
  );

  // Calculate stats
  const stats = {
    total: projects.length,
    active: projects.filter((p: any) => p.status === 'active').length,
    onHold: projects.filter((p: any) => p.status === 'on_hold').length,
    completed: projects.filter((p: any) => p.status === 'completed').length,
  };

  return (
    <MainLayout title="Projects">
      <div className="p-4 lg:p-6" data-testid="projects-page">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-lg font-medium mb-1">My Projects</h2>
            <p className="text-sm text-muted-foreground">Manage and track your team projects</p>
          </div>
          <div className="flex space-x-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32" data-testid="select-project-filter">
                <FilterIcon className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/projects/new">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Project Stats */}
        <ProjectStats stats={stats} />

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="projects-grid">
            {filteredProjects.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FilterIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {statusFilter === "all" ? "No projects yet" : `No ${statusFilter} projects`}
              </h3>
              <p className="text-muted-foreground mb-6">
                {statusFilter === "all" 
                  ? "Create your first project to get started with team collaboration."
                  : `There are no projects with ${statusFilter} status. Try changing the filter.`
                }
              </p>
              {statusFilter === "all" && (
                <Link href="/projects/new">
                  <Button>Create Your First Project</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
