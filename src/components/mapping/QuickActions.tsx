import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wand2, 
  RotateCcw, 
  Download, 
  Upload, 
  CheckCircle,
  AlertTriangle,
  Zap
} from "lucide-react";
import { AccountMapping } from "@/types/financial";
import { getConfidence, getInitialCategory } from "./utils";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
  mappings: AccountMapping[];
  onMappingUpdate: (mappings: AccountMapping[]) => void;
}

export const QuickActions = ({ mappings, onMappingUpdate }: QuickActionsProps) => {
  const { toast } = useToast();

  const handleAutoMap = () => {
    const updatedMappings = mappings.map(mapping => {
      if (!mapping.detailedCategory) {
        return { 
          ...mapping, 
          detailedCategory: getInitialCategory(mapping.accountDescription),
          highLevelCategory: getHighLevelFromDetailed(getInitialCategory(mapping.accountDescription))
        };
      }
      return mapping;
    });
    
    onMappingUpdate(updatedMappings);
    toast({
      title: "Auto-mapping completed",
      description: `Mapped ${updatedMappings.filter(m => m.detailedCategory).length} accounts automatically`,
    });
  };

  const handleResetMapping = () => {
    const resetMappings = mappings.map(mapping => ({
      ...mapping,
      detailedCategory: "",
      highLevelCategory: "",
      subCategory: ""
    }));
    
    onMappingUpdate(resetMappings);
    toast({
      title: "Mapping reset",
      description: "All account mappings have been cleared",
      variant: "destructive"
    });
  };

  const handleApproveHighConfidence = () => {
    const updatedMappings = mappings.map(mapping => {
      if (getConfidence(mapping) === "high" && !mapping.highLevelCategory) {
        return {
          ...mapping,
          highLevelCategory: getHighLevelFromDetailed(mapping.detailedCategory)
        };
      }
      return mapping;
    });
    
    onMappingUpdate(updatedMappings);
    toast({
      title: "High confidence mappings approved",
      description: "All high confidence mappings have been validated",
    });
  };

  const getHighLevelFromDetailed = (detailedCategory: string): string => {
    const assetCategories = [
      "Property, Plant and Equipment", "Right-of-Use Assets", "Investment Property",
      "Intangible Assets", "Goodwill", "Investments in Associates and Joint Ventures",
      "Financial Assets (non-current)", "Contract Assets", "Deferred Tax Assets",
      "Other Non-current Assets", "Trade Receivables (net)", "Other Receivables",
      "Accrued Income", "Inventories", "Prepayments", "Financial Assets (current)",
      "Current Tax Assets", "Cash and Cash Equivalents", "Assets Held for Sale"
    ];
    
    const liabilityCategories = [
      "Lease Liabilities (non-current)", "Provisions (non-current)", "Contract Liabilities",
      "Borrowings and Other Financial Liabilities (non-current)", "Deferred Tax Liabilities",
      "Other Non-current Liabilities", "Borrowings and Other Financial Liabilities (current)",
      "Lease Liabilities (current)", "Provisions (current)", "Trade Payables",
      "Other Payables", "Accrued Expenses", "Current Tax Liabilities",
      "Liabilities Related to Assets Held for Sale"
    ];
    
    const equityCategories = [
      "Share Capital", "Share Premium", "Other Reserves", "Retained Earnings",
      "Non-controlling Interests", "Revaluation Reserves", "Translation Reserves",
      "Hedging Reserves", "Fair Value through OCI Reserves"
    ];
    
    const revenueCategories = ["Revenues", "Other Operating Income", "Interest Income"];
    const expenseCategories = [
      "Cost of Sales", "Selling Expenses", "Research & Development Expenses",
      "General and Administrative Expenses", "Other Operating Expenses",
      "Depreciation & Amortization", "Interest Expense", "Income Tax Expense"
    ];

    if (assetCategories.includes(detailedCategory)) return "Assets";
    if (liabilityCategories.includes(detailedCategory)) return "Liabilities";
    if (equityCategories.includes(detailedCategory)) return "Equity";
    if (revenueCategories.includes(detailedCategory)) return "Revenues";
    if (expenseCategories.includes(detailedCategory)) return "Expenses";
    
    return "";
  };

  const stats = {
    total: mappings.length,
    mapped: mappings.filter(m => m.detailedCategory).length,
    needReview: mappings.filter(m => getConfidence(m) === "low").length,
    highConfidence: mappings.filter(m => getConfidence(m) === "high").length
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={handleAutoMap}
            className="gap-2 h-auto p-3"
            disabled={stats.mapped === stats.total}
          >
            <Wand2 className="w-4 h-4" />
            <div className="text-left">
              <div className="font-medium">Auto-Map</div>
              <div className="text-xs opacity-70">AI suggestions</div>
            </div>
          </Button>
          
          <Button 
            onClick={handleApproveHighConfidence}
            variant="outline"
            className="gap-2 h-auto p-3"
            disabled={stats.highConfidence === 0}
          >
            <CheckCircle className="w-4 h-4" />
            <div className="text-left">
              <div className="font-medium">Approve High</div>
              <div className="text-xs opacity-70">{stats.highConfidence} items</div>
            </div>
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 justify-start"
          >
            <Download className="w-4 h-4" />
            Export Mapping Template
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 justify-start"
          >
            <Upload className="w-4 h-4" />
            Import Previous Mapping
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="pt-3 border-t">
          <Button 
            onClick={handleResetMapping}
            variant="outline" 
            size="sm" 
            className="gap-2 justify-start w-full text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All Mappings
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mapped:</span>
              <span className="font-medium">{stats.mapped}/{stats.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Review:</span>
              <span className="font-medium text-destructive">{stats.needReview}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};