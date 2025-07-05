import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, MapPin } from "lucide-react";

interface MappingControlsProps {
  showAllAccounts: boolean;
  onToggleShowAll: () => void;
  visibleCount: number;
  totalCount: number;
}

export const MappingControls = ({
  showAllAccounts,
  onToggleShowAll,
  visibleCount,
  totalCount
}: MappingControlsProps) => {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Account Mapping & Classification
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Drag accounts between categories to adjust financial statement classification
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={showAllAccounts ? "default" : "outline"}
              size="sm"
              onClick={onToggleShowAll}
              className="gap-2"
            >
              {showAllAccounts ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showAllAccounts ? "All Accounts" : "Review Mode"}
            </Button>
            <div className="text-sm text-muted-foreground">
              {visibleCount} / {totalCount} shown
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-destructive rounded"></div>
            <span>Low Confidence - Needs Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Medium Confidence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span>High Confidence</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
