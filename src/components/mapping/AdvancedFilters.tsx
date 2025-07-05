import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Filter, 
  X, 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { AccountMapping } from "@/types/financial";
import { getConfidence, IFRS_STRUCTURE } from "./utils";

interface AdvancedFiltersProps {
  mappings: AccountMapping[];
  onFilterChange: (filteredMappings: AccountMapping[]) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export interface FilterCriteria {
  searchTerm: string;
  confidenceLevel: string[];
  mappingStatus: string[];
  statementType: string[];
  balanceRange: {
    min: number | null;
    max: number | null;
  };
  categories: string[];
}

export const AdvancedFilters = ({ 
  mappings, 
  onFilterChange, 
  isExpanded, 
  onToggleExpanded 
}: AdvancedFiltersProps) => {
  const [filters, setFilters] = useState<FilterCriteria>({
    searchTerm: "",
    confidenceLevel: [],
    mappingStatus: [],
    statementType: [],
    balanceRange: { min: null, max: null },
    categories: []
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Get all unique categories from IFRS structure
  const allCategories = [
    ...Object.values(IFRS_STRUCTURE.balanceSheet.groups).flat(),
    ...Object.values(IFRS_STRUCTURE.incomeStatement.groups).flat(),
    ...Object.values(IFRS_STRUCTURE.cashFlowStatement.groups).flat()
  ];

  const applyFilters = (newFilters: FilterCriteria) => {
    let filtered = [...mappings];

    // Search term filter
    if (newFilters.searchTerm) {
      const searchLower = newFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(mapping => 
        mapping.accountNumber.toLowerCase().includes(searchLower) ||
        mapping.accountDescription.toLowerCase().includes(searchLower) ||
        mapping.detailedCategory?.toLowerCase().includes(searchLower)
      );
    }

    // Confidence level filter
    if (newFilters.confidenceLevel.length > 0) {
      filtered = filtered.filter(mapping => 
        newFilters.confidenceLevel.includes(getConfidence(mapping))
      );
    }

    // Mapping status filter
    if (newFilters.mappingStatus.length > 0) {
      filtered = filtered.filter(mapping => {
        const isMapped = !!mapping.detailedCategory;
        return newFilters.mappingStatus.includes(isMapped ? "mapped" : "unmapped");
      });
    }

    // Categories filter
    if (newFilters.categories.length > 0) {
      filtered = filtered.filter(mapping => 
        mapping.detailedCategory && newFilters.categories.includes(mapping.detailedCategory)
      );
    }

    // Balance range filter (mock implementation)
    if (newFilters.balanceRange.min !== null || newFilters.balanceRange.max !== null) {
      filtered = filtered.filter(mapping => {
        const mockBalance = Math.floor(Math.random() * 1000000);
        const min = newFilters.balanceRange.min || 0;
        const max = newFilters.balanceRange.max || Infinity;
        return mockBalance >= min && mockBalance <= max;
      });
    }

    onFilterChange(filtered);

    // Count active filters
    let count = 0;
    if (newFilters.searchTerm) count++;
    if (newFilters.confidenceLevel.length > 0) count++;
    if (newFilters.mappingStatus.length > 0) count++;
    if (newFilters.categories.length > 0) count++;
    if (newFilters.balanceRange.min !== null || newFilters.balanceRange.max !== null) count++;
    
    setActiveFiltersCount(count);
  };

  const updateFilter = (key: keyof FilterCriteria, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const toggleArrayFilter = (key: keyof FilterCriteria, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    const emptyFilters: FilterCriteria = {
      searchTerm: "",
      confidenceLevel: [],
      mappingStatus: [],
      statementType: [],
      balanceRange: { min: null, max: null },
      categories: []
    };
    setFilters(emptyFilters);
    applyFilters(emptyFilters);
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              Advanced Filters
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs gap-1"
              >
                <X className="w-3 h-3" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpanded}
              className="p-1"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts, descriptions, categories..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Confidence Level */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Confidence Level</Label>
              <div className="space-y-2">
                {["high", "medium", "low"].map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`confidence-${level}`}
                      checked={filters.confidenceLevel.includes(level)}
                      onCheckedChange={() => toggleArrayFilter("confidenceLevel", level)}
                    />
                    <Label 
                      htmlFor={`confidence-${level}`} 
                      className="text-sm capitalize cursor-pointer"
                    >
                      {level} Confidence
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Mapping Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Mapping Status</Label>
              <div className="space-y-2">
                {[
                  { value: "mapped", label: "Mapped" },
                  { value: "unmapped", label: "Unmapped" }
                ].map((status) => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={filters.mappingStatus.includes(status.value)}
                      onCheckedChange={() => toggleArrayFilter("mappingStatus", status.value)}
                    />
                    <Label 
                      htmlFor={`status-${status.value}`} 
                      className="text-sm cursor-pointer"
                    >
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Balance Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Balance Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min amount"
                value={filters.balanceRange.min || ""}
                onChange={(e) => updateFilter("balanceRange", {
                  ...filters.balanceRange,
                  min: e.target.value ? Number(e.target.value) : null
                })}
              />
              <Input
                type="number"
                placeholder="Max amount"
                value={filters.balanceRange.max || ""}
                onChange={(e) => updateFilter("balanceRange", {
                  ...filters.balanceRange,
                  max: e.target.value ? Number(e.target.value) : null
                })}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">IFRS Categories</Label>
            <Select onValueChange={(value) => toggleArrayFilter("categories", value)}>
              <SelectTrigger className="bg-background border shadow-lg z-50">
                <SelectValue placeholder="Select categories to filter..." />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50 max-h-48 overflow-y-auto">
                {allCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {filters.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.categories.map((category) => (
                  <Badge 
                    key={category} 
                    variant="secondary" 
                    className="text-xs cursor-pointer"
                    onClick={() => toggleArrayFilter("categories", category)}
                  >
                    {category}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="pt-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing results based on {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
