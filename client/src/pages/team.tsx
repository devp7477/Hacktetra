import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  UsersIcon, 
  SearchIcon, 
  PlusIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  BriefcaseIcon,
  SettingsIcon
} from "lucide-react";
import InviteMemberModal from "@/components/team/invite-member-modal";

export default function Team() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Get all projects
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Get team members directly
  const { data: teamMembers = [], refetch: refetchTeamMembers } = useQuery({
    queryKey: ['/api/team/members'],
  });

  // Combine team members with project information
  const allMembers = teamMembers.map((member: any) => {
    // Find projects this member is part of
    const memberProjects = projects.filter((project: any) => 
      project.managerId === member.id || 
      (project.members && project.members.some((m: any) => m.userId === member.id))
    ).map((project: any) => project.name);
    
    return {
      ...member,
      projects: memberProjects.length > 0 ? memberProjects : [],
      status: 'active'
    };
  });

  // Refetch team members when the component mounts or when inviteDialogOpen changes
  // This ensures we have the latest data after an invitation is sent
  useEffect(() => {
    refetchTeamMembers();
  }, [inviteDialogOpen, refetchTeamMembers]);

  // Filter members based on search and role
  const filteredMembers = allMembers.filter((member: any) => {
    const matchesSearch = member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    totalMembers: allMembers.length,
    managers: allMembers.filter((m: any) => m.role === 'manager').length,
    activeProjects: projects.filter((p: any) => p.status === 'active').length,
    completedProjects: projects.filter((p: any) => p.status === 'completed').length,
  };

  return (
    <MainLayout title="Team">
      <div className="p-4 lg:p-6" data-testid="team-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-lg font-medium mb-1">Team Management</h2>
            <p className="text-sm text-muted-foreground">Manage your team members and their roles</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search-members"
              />
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32" data-testid="select-role-filter">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="manager">Managers</SelectItem>
                <SelectItem value="member">Members</SelectItem>
              </SelectContent>
            </Select>
            <InviteMemberModal open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card data-testid="stat-total-members">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
                  <UsersIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold" data-testid="stat-value-total-members">
                    {stats.totalMembers}
                  </div>
                  <div className="text-sm text-muted-foreground">Team Members</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-managers">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/10 rounded-lg mr-3">
                  <BriefcaseIcon className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold" data-testid="stat-value-managers">
                    {stats.managers}
                  </div>
                  <div className="text-sm text-muted-foreground">Managers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-active-projects">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500/10 rounded-lg mr-3">
                  <CalendarIcon className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold" data-testid="stat-value-active-projects">
                    {stats.activeProjects}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Projects</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-completed-projects">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/10 rounded-lg mr-3">
                  <SettingsIcon className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold" data-testid="stat-value-completed-projects">
                    {stats.completedProjects}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Members Grid */}
        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="team-members-grid">
            {filteredMembers.map((member: any) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow" data-testid={`member-card-${member.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.profileImageUrl} />
                      <AvatarFallback>
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold" data-testid="text-member-name">
                        {member.firstName} {member.lastName}
                      </h3>
                      <Badge 
                        variant={member.role === 'manager' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {member.role}
                      </Badge>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MailIcon className="h-4 w-4 mr-2" />
                      <span data-testid="text-member-email">{member.email}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Projects ({member.projects.length})</div>
                      <div className="flex flex-wrap gap-1">
                        {member.projects.slice(0, 2).map((project: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {project}
                          </Badge>
                        ))}
                        {member.projects.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.projects.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4 space-x-2">
                    <Button variant="ghost" size="sm">
                      <MailIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <SettingsIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchTerm || roleFilter !== "all" ? "No team members found" : "No team members yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || roleFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Invite team members to start collaborating on projects."
                }
              </p>
              <Button onClick={() => setInviteDialogOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Invite First Member
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}