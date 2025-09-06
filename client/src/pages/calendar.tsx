import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  FolderIcon
} from "lucide-react";
import { format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addMonths, 
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
  isToday,
  isBefore
} from "date-fns";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [filterType, setFilterType] = useState<"all" | "projects" | "tasks">("all");

  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks/my'],
  });

  // Generate calendar events from projects and tasks
  const events = useMemo(() => {
    const projectEvents = projects
      .filter((project: any) => project.deadline)
      .map((project: any) => ({
        id: `project-${project.id}`,
        title: project.name,
        date: parseISO(project.deadline),
        type: 'project',
        status: project.status,
        priority: project.priority,
        data: project
      }));

    const taskEvents = tasks
      .filter((task: any) => task.dueDate)
      .map((task: any) => ({
        id: `task-${task.id}`,
        title: task.title,
        date: parseISO(task.dueDate),
        type: 'task',
        status: task.status,
        priority: task.priority,
        project: task.project,
        data: task
      }));

    return [...projectEvents, ...taskEvents]
      .filter((event) => {
        if (filterType === "all") return true;
        return event.type === (filterType === "projects" ? "project" : "task");
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [projects, tasks, filterType]);

  // Calendar grid generation
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    return events
      .filter(event => event.date >= now && event.date <= nextWeek)
      .slice(0, 5);
  }, [events]);

  const stats = {
    totalEvents: events.length,
    projectDeadlines: events.filter(e => e.type === 'project').length,
    taskDueDates: events.filter(e => e.type === 'task').length,
    overdueEvents: events.filter(e => isBefore(e.date, new Date()) && e.status !== 'completed' && e.status !== 'done').length,
  };

  const getEventColor = (event: any) => {
    if (event.type === 'project') {
      switch (event.priority) {
        case 'high': return 'bg-red-500';
        case 'medium': return 'bg-yellow-500';
        case 'low': return 'bg-blue-500';
        default: return 'bg-gray-500';
      }
    } else {
      switch (event.priority) {
        case 'high': return 'bg-red-500';
        case 'medium': return 'bg-yellow-500';
        case 'low': return 'bg-green-500';
        default: return 'bg-gray-500';
      }
    }
  };

  return (
    <MainLayout title="Calendar">
      <div className="p-4 lg:p-6" data-testid="calendar-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-lg font-medium mb-1">Project Calendar</h2>
            <p className="text-sm text-muted-foreground">Track project deadlines and task due dates</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={filterType} onValueChange={(value: "all" | "projects" | "tasks") => setFilterType(value)}>
              <SelectTrigger className="w-32" data-testid="select-filter-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
              </SelectContent>
            </Select>
            <Select value={viewMode} onValueChange={(value: "month" | "week" | "day") => setViewMode(value)}>
              <SelectTrigger className="w-24" data-testid="select-view-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calendar Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card data-testid="stat-total-events">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold" data-testid="stat-value-total-events">
                    {stats.totalEvents}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Events</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-project-deadlines">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/10 rounded-lg mr-3">
                  <FolderIcon className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold" data-testid="stat-value-project-deadlines">
                    {stats.projectDeadlines}
                  </div>
                  <div className="text-sm text-muted-foreground">Project Deadlines</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-task-due-dates">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500/10 rounded-lg mr-3">
                  <ClockIcon className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold" data-testid="stat-value-task-due-dates">
                    {stats.taskDueDates}
                  </div>
                  <div className="text-sm text-muted-foreground">Task Due Dates</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-overdue-events">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-500/10 rounded-lg mr-3">
                  <AlertCircleIcon className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold" data-testid="stat-value-overdue-events">
                    {stats.overdueEvents}
                  </div>
                  <div className="text-sm text-muted-foreground">Overdue</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    {format(currentDate, "MMMM yyyy")}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                      data-testid="button-prev-month"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                      data-testid="button-today"
                    >
                      Today
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                      data-testid="button-next-month"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1" data-testid="calendar-grid">
                  {calendarDays.map(day => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isDayToday = isToday(day);
                    
                    return (
                      <div
                        key={day.toISOString()}
                        className={`p-2 min-h-[80px] border rounded-lg ${
                          isCurrentMonth ? 'bg-card' : 'bg-muted/50'
                        } ${isDayToday ? 'ring-2 ring-primary' : ''}`}
                        data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                      >
                        <div className={`text-sm ${
                          isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                        } ${isDayToday ? 'font-bold' : ''}`}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1 mt-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className="text-xs p-1 rounded truncate"
                              style={{ backgroundColor: `${getEventColor(event)}20` }}
                              data-testid={`event-${event.id}`}
                            >
                              <div className={`w-2 h-2 rounded-full inline-block mr-1 ${getEventColor(event)}`}></div>
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4" data-testid="upcoming-events-list">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg" data-testid={`upcoming-event-${event.id}`}>
                        <div className={`w-3 h-3 rounded-full mt-1 ${getEventColor(event)}`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm" data-testid="text-event-title">
                              {event.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {event.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {format(event.date, "MMM d, yyyy 'at' h:mm a")}
                          </p>
                          {event.project && (
                            <p className="text-xs text-muted-foreground">
                              Project: {event.project.name}
                            </p>
                          )}
                          <div className="flex items-center mt-2">
                            <Badge 
                              variant={event.priority === 'high' ? 'destructive' : event.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs mr-2"
                            >
                              {event.priority}
                            </Badge>
                            {event.status === 'completed' || event.status === 'done' ? (
                              <CheckCircleIcon className="h-3 w-3 text-green-500" />
                            ) : isBefore(event.date, new Date()) ? (
                              <AlertCircleIcon className="h-3 w-3 text-red-500" />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No upcoming events</p>
                    <p className="text-xs">Create projects and tasks with deadlines to see them here</p>
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