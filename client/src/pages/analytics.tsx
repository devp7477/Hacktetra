import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  BarChart3Icon,
  PieChartIcon,
  ActivityIcon,
  UsersIcon,
  FolderIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon
} from "lucide-react";
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { clerkApi } from "@/lib/clerkApi";

export default function Analytics() {
  // Use mock data directly for analytics
  const analyticsData = clerkApi.getMockAnalytics();
  const isAnalyticsLoading = false;
  
  // Use mock data directly for project analytics
  const projectAnalytics = clerkApi.getMockProjectAnalytics();
  const isProjectAnalyticsLoading = false;
  
  // Use mock data directly for task analytics
  const taskAnalytics = clerkApi.getMockTaskAnalytics();
  const isTaskAnalyticsLoading = false;

  // Fetch projects and tasks for backward compatibility
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks/my'],
  });

  // Calculate analytics data
  const analytics = useMemo(() => {
    // Use API data if available, otherwise calculate from projects and tasks
    if (analyticsData) {
      // Convert task distribution to chart format
      const taskStatusData = [
        { name: 'To Do', value: analyticsData.taskDistribution.todo, color: '#f59e0b' },
        { name: 'In Progress', value: analyticsData.taskDistribution.in_progress, color: '#3b82f6' },
        { name: 'Done', value: analyticsData.taskDistribution.done, color: '#10b981' }
      ].filter(item => item.value > 0);

      // Convert project status to chart format
      const projectStatusData = [
        { name: 'Active', value: analyticsData.projectStatus.active, color: '#3b82f6' },
        { name: 'On Hold', value: analyticsData.projectStatus.on_hold, color: '#f59e0b' },
        { name: 'Completed', value: analyticsData.projectStatus.completed, color: '#10b981' }
      ].filter(item => item.value > 0);

      // Convert task priority to chart format
      const priorityData = [
        { name: 'High', value: analyticsData.taskPriority.high, color: '#ef4444' },
        { name: 'Medium', value: analyticsData.taskPriority.medium, color: '#f59e0b' },
        { name: 'Low', value: analyticsData.taskPriority.low, color: '#10b981' }
      ].filter(item => item.value > 0);

      // Monthly progress (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        
        // Find projects and tasks for this month from projectAnalytics and taskAnalytics
        let monthProjects = 0;
        let monthTasks = 0;
        
        if (projectAnalytics) {
          monthProjects = projectAnalytics.filter((p: any) => {
            const createdAt = new Date(p.createdAt || Date.now());
            const monthStart = startOfMonth(date);
            const monthEnd = endOfMonth(date);
            return createdAt >= monthStart && createdAt <= monthEnd;
          }).length;
        }
        
        if (taskAnalytics) {
          // Flatten all tasks from all projects
          const allTasks = taskAnalytics.flatMap((p: any) => {
            return p.totalTasks || 0;
          });
          
          monthTasks = allTasks || 0;
        }

        monthlyData.push({
          month: format(date, 'MMM yyyy'),
          projects: monthProjects,
          tasks: monthTasks,
        });
      }

      return {
        totalProjects: analyticsData.summary.totalProjects,
        activeProjects: analyticsData.projectStatus.active,
        completedProjects: analyticsData.projectStatus.completed,
        totalTasks: analyticsData.summary.totalTasks,
        completedTasks: analyticsData.summary.completedTasks,
        pendingTasks: analyticsData.taskDistribution.todo,
        inProgressTasks: analyticsData.taskDistribution.in_progress,
        projectStatusData,
        taskStatusData,
        priorityData,
        monthlyData,
        completionRate: analyticsData.summary.completionRate,
        projectCompletionRate: analyticsData.projectStatus.completed / 
          (analyticsData.summary.totalProjects || 1) * 100,
      };
    } else {
      // Fallback to calculating from projects and tasks
      const projectsArray = Array.isArray(projects) ? projects : [];
      const tasksArray = Array.isArray(tasks) ? tasks : [];
      
      const totalProjects = projectsArray.length;
      const activeProjects = projectsArray.filter((p: any) => p.status === 'active').length;
      const completedProjects = projectsArray.filter((p: any) => p.status === 'completed').length;
      const totalTasks = tasksArray.length;
      const completedTasks = tasksArray.filter((t: any) => t.status === 'completed' || t.status === 'done').length;
      const pendingTasks = tasksArray.filter((t: any) => t.status === 'pending' || t.status === 'todo').length;
      const inProgressTasks = tasksArray.filter((t: any) => t.status === 'in_progress').length;

      // Project status distribution
      const projectStatusData = [
        { name: 'Active', value: activeProjects, color: '#3b82f6' },
        { name: 'Completed', value: completedProjects, color: '#10b981' },
        { name: 'Pending', value: totalProjects - activeProjects - completedProjects, color: '#f59e0b' }
      ].filter(item => item.value > 0);

      // Task status distribution
      const taskStatusData = [
        { name: 'Completed', value: completedTasks, color: '#10b981' },
        { name: 'In Progress', value: inProgressTasks, color: '#3b82f6' },
        { name: 'Pending', value: pendingTasks, color: '#f59e0b' }
      ].filter(item => item.value > 0);

      // Priority distribution
      const priorityData = [
        { name: 'High', value: tasksArray.filter((t: any) => t.priority === 'high').length, color: '#ef4444' },
        { name: 'Medium', value: tasksArray.filter((t: any) => t.priority === 'medium').length, color: '#f59e0b' },
        { name: 'Low', value: tasksArray.filter((t: any) => t.priority === 'low').length, color: '#10b981' }
      ].filter(item => item.value > 0);

      // Monthly progress (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        
        const monthProjects = projectsArray.filter((p: any) => {
          const createdAt = new Date(p.createdAt);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length;
        
        const monthTasks = tasksArray.filter((t: any) => {
          const createdAt = new Date(t.createdAt);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length;

        monthlyData.push({
          month: format(date, 'MMM yyyy'),
          projects: monthProjects,
          tasks: monthTasks,
        });
      }

      // Productivity metrics
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const projectCompletionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

      return {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        projectStatusData,
        taskStatusData,
        priorityData,
        monthlyData,
        completionRate,
        projectCompletionRate,
      };
    }
  }, [analyticsData, projectAnalytics, taskAnalytics, projects, tasks]);

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className={`flex items-center text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <TrendingUpIcon className="h-3 w-3 mr-1" /> : <TrendingDownIcon className="h-3 w-3 mr-1" />}
                {change}% from last month
              </div>
            )}
          </div>
          <div className={`p-2 rounded-lg ${
            title.includes('Project') ? 'bg-blue-500/10' :
            title.includes('Task') ? 'bg-green-500/10' :
            title.includes('Completion') ? 'bg-purple-500/10' : 'bg-gray-500/10'
          }`}>
            <Icon className={`h-5 w-5 ${
              title.includes('Project') ? 'text-blue-500' :
              title.includes('Task') ? 'text-green-500' :
              title.includes('Completion') ? 'text-purple-500' : 'text-gray-500'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color || entry.fill }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const isLoading = isAnalyticsLoading || isProjectAnalyticsLoading || isTaskAnalyticsLoading;

  return (
    <MainLayout title="Analytics">
      <div className="p-4 lg:p-6" data-testid="analytics-page">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-1">Project Analytics</h2>
          <p className="text-sm text-muted-foreground">Insights into your team's productivity and project progress</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Projects"
            value={analytics.totalProjects}
            icon={FolderIcon}
            data-testid="stat-total-projects"
          />
          <StatCard
            title="Active Projects"
            value={analytics.activeProjects}
            icon={ActivityIcon}
            data-testid="stat-active-projects"
          />
          <StatCard
            title="Total Tasks"
            value={analytics.totalTasks}
            icon={CheckCircleIcon}
            data-testid="stat-total-tasks"
          />
          <StatCard
            title="Task Completion"
            value={`${analytics.completionRate.toFixed(1)}%`}
            icon={TrendingUpIcon}
            data-testid="stat-completion-rate"
          />
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3Icon className="h-5 w-5 mr-2" />
                Project Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Completion</span>
                  <span>{analytics.projectCompletionRate.toFixed(1)}%</span>
                </div>
                <Progress value={analytics.projectCompletionRate} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed Projects</span>
                  <Badge variant="secondary">{analytics.completedProjects}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Projects</span>
                  <Badge variant="default">{analytics.activeProjects}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Projects</span>
                  <Badge variant="outline">{analytics.totalProjects}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Task Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Task Completion</span>
                  <span>{analytics.completionRate.toFixed(1)}%</span>
                </div>
                <Progress value={analytics.completionRate} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                    Completed
                  </span>
                  <Badge variant="secondary">{analytics.completedTasks}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center">
                    <ActivityIcon className="h-4 w-4 mr-1 text-blue-500" />
                    In Progress
                  </span>
                  <Badge variant="default">{analytics.inProgressTasks}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1 text-yellow-500" />
                    Pending
                  </span>
                  <Badge variant="outline">{analytics.pendingTasks}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3Icon className="h-5 w-5 mr-2" />
                Monthly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} data-testid="monthly-activity-chart">
                <AreaChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="projects" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tasks" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Task Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2" />
                Task Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} data-testid="task-distribution-chart">
                <PieChart>
                  <Pie
                    data={analytics.taskStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.taskStatusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Project Status and Priority Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderIcon className="h-5 w-5 mr-2" />
                Project Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.projectStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250} data-testid="project-status-chart">
                  <PieChart>
                    <Pie
                      data={analytics.projectStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.projectStatusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  <div className="text-center">
                    <FolderIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No project data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircleIcon className="h-5 w-5 mr-2" />
                Task Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.priorityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250} data-testid="task-priority-chart">
                  <BarChart data={analytics.priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#f59e0b">
                      {analytics.priorityData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  <div className="text-center">
                    <AlertCircleIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No task priority data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}