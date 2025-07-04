import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, FileText, MapPin, Database, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  mappingProgress?: number;
}

const sidebarTabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, description: "Key metrics & analysis" },
  { id: "statements", label: "Financial Statements", icon: FileText, description: "P&L, Balance Sheet, Cash Flow" },
  { id: "mapping", label: "Mapping", icon: MapPin, description: "Account classification", highlight: true },
  { id: "data", label: "Underlying Data", icon: Database, description: "Raw & processed data" },
];

export const Sidebar = ({ currentTab, onTabChange, mappingProgress = 0 }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Card className={cn(
      "fixed right-0 top-0 h-full z-50 smooth-transition border-l shadow-lg animate-slide-in-right",
      collapsed ? "w-16" : "w-72"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="enter-animation">
                <h3 className="font-semibold text-primary">Due Diligence</h3>
                <p className="text-xs text-muted-foreground">Navigation</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 p-0 hover-scale"
            >
              {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-2">
          <div className="space-y-2">
            {sidebarTabs.map((tab, index) => {
              const isActive = currentTab === tab.id;
              const Icon = tab.icon;

              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-auto p-3 relative smooth-transition hover-lift",
                    collapsed && "px-2 justify-center",
                    tab.highlight && !isActive && "border border-primary/20 pulse-glow",
                    isActive && "scale-animation"
                  )}
                  onClick={() => onTabChange(tab.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0 smooth-transition", 
                      tab.highlight && !isActive && "text-primary"
                    )} />
                    {!collapsed && (
                      <div className="flex-1 text-left min-w-0 enter-animation">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{tab.label}</span>
                          {tab.id === "mapping" && mappingProgress > 0 && (
                            <Badge variant="secondary" className="text-xs scale-animation">
                              {mappingProgress}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {tab.description}
                        </p>
                      </div>
                    )}
                  </div>
                  {tab.highlight && !collapsed && (
                    <div className="absolute right-2 top-2 w-2 h-2 bg-primary rounded-full pulse-glow" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Progress indicator for mapping */}
        {!collapsed && mappingProgress > 0 && (
          <div className="p-4 border-t enter-animation">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mapping Progress</span>
                <span className="font-medium">{mappingProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full smooth-transition"
                  style={{ width: `${mappingProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};