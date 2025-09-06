import { Card, CardContent } from "@/components/ui/card";
import { FolderIcon, CheckCircleIcon, ClockIcon, ArchiveIcon } from "lucide-react";

interface ProjectStatsProps {
  stats: {
    total: number;
    active: number;
    onHold: number;
    completed: number;
  };
}

export default function ProjectStats({ stats }: ProjectStatsProps) {
  const statItems = [
    {
      name: "Total Projects",
      value: stats.total,
      icon: FolderIcon,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      name: "Active",
      value: stats.active,
      icon: CheckCircleIcon,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      name: "On Hold",
      value: stats.onHold,
      icon: ClockIcon,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      name: "Completed",
      value: stats.completed,
      icon: ArchiveIcon,
      color: "text-gray-500",
      bgColor: "bg-gray-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.name} data-testid={`stat-${item.name.toLowerCase().replace(' ', '-')}`}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className={`p-2 ${item.bgColor} rounded-lg mr-3`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-semibold" data-testid={`stat-value-${item.name.toLowerCase().replace(' ', '-')}`}>
                    {item.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{item.name}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
