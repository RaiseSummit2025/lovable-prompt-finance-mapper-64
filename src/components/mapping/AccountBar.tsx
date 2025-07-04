import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, AlertTriangle, GripVertical, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AccountMapping } from "@/types/financial";
import { cn } from "@/lib/utils";

interface AccountBarProps {
  mapping: AccountMapping;
  onUpdate: (field: keyof AccountMapping, value: string) => void;
  confidence?: "high" | "medium" | "low";
  isDragging?: boolean;
}

export const AccountBar = ({ 
  mapping, 
  onUpdate, 
  confidence = "medium", 
  isDragging = false 
}: AccountBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const confidenceConfig = {
    high: { 
      color: "border-primary bg-primary/5",
      badge: "default" as const
    },
    medium: { 
      color: "border-yellow-500 bg-yellow-500/5",
      badge: "secondary" as const
    },
    low: { 
      color: "border-destructive bg-destructive/10",
      badge: "destructive" as const
    }
  }[confidence];

  // Mock past period data for demonstration
  const mockPastData = {
    previousPeriod: Math.floor(Math.random() * 1000000),
    variance: Math.floor(Math.random() * 100000) - 50000,
    trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-600" />;
      default: return <Minus className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "border rounded-lg p-3 mb-2 cursor-pointer transition-all duration-200", 
            "hover:shadow-md hover:scale-[1.01]",
            confidenceConfig.color,
            isDragging && "opacity-75 rotate-1 shadow-lg scale-105"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab hover:text-primary transition-colors" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{mapping.accountNumber}</span>
                    {confidence === "low" && (
                      <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
                    )}
                    <Badge 
                      variant={confidenceConfig.badge}
                      className="text-xs"
                    >
                      {confidence}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate" title={mapping.accountDescription}>
                    {mapping.accountDescription}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="p-1 hover:bg-muted shrink-0"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {isExpanded && (
              <div className="mt-3 pt-3 border-t space-y-3 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">High-level Category</label>
                    <Select 
                      value={mapping.highLevelCategory} 
                      onValueChange={(value) => onUpdate('highLevelCategory', value)}
                    >
                      <SelectTrigger className="h-8 transition-colors hover:border-primary/50">
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="Assets">Assets</SelectItem>
                        <SelectItem value="Liabilities">Liabilities</SelectItem>
                        <SelectItem value="Equity">Equity</SelectItem>
                        <SelectItem value="Revenues">Revenues</SelectItem>
                        <SelectItem value="Expenses">Expenses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Balance Information */}
                  <div>
                    <label className="text-xs text-muted-foreground">Current Period</label>
                    <div className="text-sm font-medium">
                      {formatCurrency(mockPastData.previousPeriod + mockPastData.variance)}
                    </div>
                  </div>
                </div>

                {/* Trend Analysis */}
                <div className="bg-muted/30 p-2 rounded text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Period Comparison</span>
                    {getTrendIcon(mockPastData.trend)}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Previous: {formatCurrency(mockPastData.previousPeriod)}</span>
                    <span className={cn(
                      "font-medium",
                      mockPastData.variance > 0 ? "text-green-600" : 
                      mockPastData.variance < 0 ? "text-red-600" : "text-muted-foreground"
                    )}>
                      {mockPastData.variance > 0 ? '+' : ''}{formatCurrency(mockPastData.variance)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-background border shadow-lg z-50">
          <div className="space-y-1">
            <div className="font-medium">{mapping.accountNumber}</div>
            <div className="text-xs text-muted-foreground max-w-48">
              {mapping.accountDescription}
            </div>
            <div className="text-xs border-t pt-1">
              <div>Current: {formatCurrency(mockPastData.previousPeriod + mockPastData.variance)}</div>
              <div>Previous: {formatCurrency(mockPastData.previousPeriod)}</div>
              <div className="flex items-center gap-1">
                Change: {getTrendIcon(mockPastData.trend)}
                <span className={cn(
                  mockPastData.variance > 0 ? "text-green-600" : 
                  mockPastData.variance < 0 ? "text-red-600" : "text-muted-foreground"
                )}>
                  {mockPastData.variance > 0 ? '+' : ''}{formatCurrency(mockPastData.variance)}
                </span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};