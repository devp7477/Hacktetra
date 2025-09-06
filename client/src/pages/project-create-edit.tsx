import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { clerkApi } from "@/lib/clerkApi";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  tags: z.string().optional(),
  projectManager: z.string().optional(),
  deadline: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  image: z.any().optional(),
  description: z.string().optional(),
  testUserAssigned: z.boolean().default(false),
});

type CreateProjectData = z.infer<typeof createProjectSchema>;

export default function ProjectCreateEdit() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  const pageTitle = isEditMode ? "Edit Project" : "Create Project";

  const form = useForm<CreateProjectData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      tags: "",
      projectManager: "",
      deadline: "",
      priority: "medium",
      description: "",
      testUserAssigned: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateProjectData) => {
      if (isEditMode) {
        return await clerkApi.updateProject(id, data);
      } else {
        return await clerkApi.createProject(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: isEditMode 
          ? "Project updated successfully" 
          : "Project created successfully",
      });
      setLocation("/projects");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: isEditMode 
          ? "Failed to update project" 
          : "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateProjectData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-orange-500">{pageTitle}</h1>
        </div>

        <div className="border border-gray-700 rounded-lg overflow-hidden">
          {/* Header with company and search */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 border border-gray-600 rounded mr-2"></div>
              <span className="text-gray-300">Company</span>
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border border-gray-600 rounded px-3 py-1 text-sm"
              />
            </div>
          </div>

          {/* Sidebar and content */}
          <div className="flex">
            {/* Sidebar */}
            <div className="w-48 border-r border-gray-700 p-4">
              <div className="mb-4">
                <div className="text-gray-300 py-2 hover:bg-gray-800 rounded px-2">Projects</div>
              </div>
              <div className="mb-4">
                <div className="text-gray-300 py-2 hover:bg-gray-800 rounded px-2">My Tasks</div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1">
              {/* Breadcrumb and actions */}
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <div className="text-sm text-gray-400">
                  <span>Projects</span> &gt; <span>New Project</span>
                </div>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    className="bg-blue-600 text-white border-none hover:bg-blue-700"
                    onClick={() => setLocation("/projects")}
                  >
                    Discard
                  </Button>
                  <Button 
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={mutation.isPending}
                  >
                    Save
                  </Button>
                </div>
              </div>

              {/* Form */}
              <div className="p-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-300 block mb-2">Name</Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        className="w-full bg-transparent border-b border-gray-600 focus:border-gray-400 rounded-none px-0 py-2"
                      />
                    </div>

                    <div className="flex items-center">
                      <div className="flex-1">
                        <Label htmlFor="tags" className="text-gray-300 block mb-2">Tags</Label>
                        <Input
                          id="tags"
                          {...form.register("tags")}
                          className="w-full bg-transparent border-b border-gray-600 focus:border-gray-400 rounded-none px-0 py-2"
                        />
                      </div>
                      <div className="ml-4 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        Multi Selection Dropdown
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="flex-1">
                        <Label htmlFor="projectManager" className="text-gray-300 block mb-2">Project Manager</Label>
                        <Input
                          id="projectManager"
                          {...form.register("projectManager")}
                          className="w-full bg-transparent border-b border-gray-600 focus:border-gray-400 rounded-none px-0 py-2"
                        />
                      </div>
                      <div className="ml-4 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        Single Selection Dropdown
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="flex-1">
                        <Label htmlFor="deadline" className="text-gray-300 block mb-2">Deadline</Label>
                        <Input
                          id="deadline"
                          type="date"
                          {...form.register("deadline")}
                          className="w-full bg-transparent border-b border-gray-600 focus:border-gray-400 rounded-none px-0 py-2"
                        />
                      </div>
                      <div className="ml-4 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        Date Selection Field
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="flex-1">
                        <Label className="text-gray-300 block mb-2">Priority</Label>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="low"
                              {...form.register("priority")}
                              className="mr-2"
                            />
                            <span>Low</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="medium"
                              {...form.register("priority")}
                              className="mr-2"
                            />
                            <span>Medium</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="high"
                              {...form.register("priority")}
                              className="mr-2"
                            />
                            <span>High</span>
                          </label>
                        </div>
                      </div>
                      <div className="ml-4 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        Single Radio Selection
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="flex-1">
                        <Label className="text-gray-300 block mb-2">Image</Label>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="bg-gray-800 border-gray-600 text-gray-300"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-gray-300 block mb-2">Description</Label>
                      <Textarea
                        id="description"
                        {...form.register("description")}
                        className="w-full bg-transparent border border-gray-600 focus:border-gray-400 rounded min-h-[120px]"
                      />
                    </div>

                    <div className="flex items-center mt-4">
                      <div className="w-6 h-6 border border-gray-600 rounded-full mr-2"></div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...form.register("testUserAssigned")}
                          className="mr-2"
                        />
                        <span className="text-gray-300">Test User assigned</span>
                      </label>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
