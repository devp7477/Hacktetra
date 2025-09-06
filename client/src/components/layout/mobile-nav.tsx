import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FolderIcon,
  ListTodo,
  UsersIcon,
  UserIcon,
} from "lucide-react";

const navigation = [
  { name: "Projects", href: "/projects", icon: FolderIcon },
  { name: "Tasks", href: "/my-tasks", icon: ListTodo },
  { name: "Team", href: "/team", icon: UsersIcon },
  { name: "Profile", href: "/profile", icon: UserIcon },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2">
      <div className="flex items-center justify-around">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || location.startsWith(item.href + "/");
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center p-2 h-auto",
                  isActive && "text-primary"
                )}
                data-testid={`mobile-nav-${item.name.toLowerCase()}`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
