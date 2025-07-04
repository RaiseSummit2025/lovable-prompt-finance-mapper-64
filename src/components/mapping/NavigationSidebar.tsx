import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  FileText, 
  MapPin, 
  Database,
  TrendingUp,
  BarChart3,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  mappingStats?: {
    totalAccounts: number;
    reviewNeeded: number;
    completed: number;
  };
}

export const NavigationSidebar = ({ 
  activeSection, 
  onSectionChange, 
  mappingStats 
}: NavigationSidebarProps) => {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview & metrics"
    },
    {
      id: "mapping",
      label: "Mapping",
      icon: MapPin,
      description: "IFRS classification",
      badge: mappingStats?.reviewNeeded ? mappingStats.reviewNeeded : undefined,
      badgeVariant: "destructive" as const
    },
    {
      id: "statements",
      label: "Financial Statements",
      icon: FileText,
      description: "Balance Sheet & P&L"
    },
    {
      id: "analysis",
      label: "Financial Analysis",
      icon: TrendingUp,
      description: "Ratios & insights"
    },
    {
      id: "data",
      label: "Underlying Data",
      icon: Database,
      description: "Trial balance data"
    }
  ];

  return (
    <Card className="w-64 h-fit sticky top-6">
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground mb-4">
            Financial Due Diligence
          </h3>
          
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-3 text-left",
                activeSection === item.id && "bg-primary text-primary-foreground"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <div className="flex items-start gap-3 w-full">
                <item.icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge && (
                      <Badge variant={item.badgeVariant} className="text-xs ml-2">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs opacity-70 mt-0.5 truncate">
                    {item.description}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Mapping Progress */}
        {activeSection === "mapping" && mappingStats && (
          <div className="mt-6 pt-4 border-t space-y-3">
            <h4 className="font-medium text-sm">Mapping Progress</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Accounts</span>
                <span className="font-medium">{mappingStats.totalAccounts}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium text-primary">{mappingStats.completed}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Need Review</span>
                <span className="font-medium text-destructive">{mappingStats.reviewNeeded}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(mappingStats.completed / mappingStats.totalAccounts) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium text-sm mb-3">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-muted/30 rounded">
              <BarChart3 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xs font-medium">Balance</div>
              <div className="text-xs text-muted-foreground">Sheet</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <DollarSign className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xs font-medium">P&L</div>
              <div className="text-xs text-muted-foreground">Statement</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};