import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { AccountMapping } from "@/types/financial";
import { getConfidence } from "./utils";

interface MappingProgressIndicatorProps {
  mappings: AccountMapping[];
}

export const MappingProgressIndicator = ({ mappings }: MappingProgressIndicatorProps) => {
  const stats = {
    total: mappings.length,
    high: mappings.filter(m => getConfidence(m) === "high").length,
    medium: mappings.filter(m => getConfidence(m) === "medium").length,
    low: mappings.filter(m => getConfidence(m) === "low").length,
    unmapped: mappings.filter(m => !m.detailedCategory).length
  };

  const completionRate = Math.round(((stats.high + stats.medium) / stats.total) * 100);
  const reviewRate = Math.round((stats.low / stats.total) * 100);

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Mapping Progress</h4>
              <span className="text-sm font-medium text-primary">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-sm font-medium text-green-700 dark:text-green-400">
                  {stats.high + stats.medium}
                </div>
                <div className="text-xs text-green-600 dark:text-green-500">Mapped</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <div>
                <div className="text-sm font-medium text-red-700 dark:text-red-400">
                  {stats.low}
                </div>
                <div className="text-xs text-red-600 dark:text-red-500">Need Review</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  {stats.medium}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-500">Medium Conf.</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
              <CheckCircle className="w-4 h-4 text-yellow-600" />
              <div>
                <div className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  {stats.high}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-500">High Conf.</div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="pt-3 border-t">
            <h5 className="text-xs font-medium text-muted-foreground mb-2">Categories</h5>
            <div className="flex flex-wrap gap-1">
              {Object.entries(
                mappings.reduce((acc, mapping) => {
                  if (mapping.detailedCategory) {
                    acc[mapping.detailedCategory] = (acc[mapping.detailedCategory] || 0) + 1;
                  }
                  return acc;
                }, {} as Record<string, number>)
              ).map(([category, count]) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {count}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};