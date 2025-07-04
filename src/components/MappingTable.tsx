import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Download, Save, RotateCcw } from "lucide-react";
import { AccountMapping, FinancialCategories } from "@/types/financial";

interface MappingTableProps {
  mappings: AccountMapping[];
  onMappingUpdate: (mappings: AccountMapping[]) => void;
  onSave: () => void;
  onExport: () => void;
}

const HIGH_LEVEL_CATEGORIES = ["Assets", "Liabilities", "Equity", "Revenues", "Expenses"];

const SUB_CATEGORIES: Record<string, string[]> = {
  Assets: ["Current Assets", "Non-current Assets"],
  Liabilities: ["Current Liabilities", "Non-current Liabilities"],
  Equity: ["Share Capital", "Reserves", "Retained Earnings"],
  Revenues: ["Operating Revenue", "Other Income"],
  Expenses: ["Cost of Sales", "Operating Expenses", "Financial Costs", "Tax Expense"]
};

const DETAILED_CATEGORIES: Record<string, string[]> = {
  "Current Assets": [
    "Cash and cash equivalents",
    "Trade receivables (net)",
    "Other receivables",
    "Inventories",
    "Prepayments",
    "Financial assets (current)",
    "Current tax assets"
  ],
  "Non-current Assets": [
    "Property, plant and equipment",
    "Intangible assets",
    "Goodwill",
    "Right-of-use assets",
    "Investment property",
    "Investments in associates and joint ventures",
    "Financial assets (non-current)",
    "Contract assets",
    "Deferred tax assets",
    "Other non-current assets"
  ],
  "Current Liabilities": [
    "Trade payables",
    "Other payables",
    "Accrued expenses",
    "Contract liabilities",
    "Provisions",
    "Borrowings and other financial liabilities (current)",
    "Lease liabilities (current)",
    "Current tax liabilities"
  ],
  "Non-current Liabilities": [
    "Borrowings and other financial liabilities (non-current)",
    "Lease liabilities (non-current)",
    "Provisions",
    "Contract liabilities",
    "Deferred tax liabilities",
    "Other non-current liabilities"
  ],
  "Operating Revenue": [
    "Revenue from contracts with customers",
    "Service revenue",
    "Product sales",
    "Subscription revenue"
  ],
  "Other Income": [
    "Interest income",
    "Dividend income",
    "Gain on disposal of assets",
    "Foreign exchange gains"
  ],
  "Cost of Sales": [
    "Cost of goods sold",
    "Direct materials",
    "Direct labor",
    "Manufacturing overhead"
  ],
  "Operating Expenses": [
    "Selling & Marketing expenses",
    "General & Administrative expenses",
    "Research & Development",
    "Depreciation and amortization",
    "Employee benefits"
  ],
  "Financial Costs": [
    "Interest expense",
    "Bank charges",
    "Foreign exchange losses",
    "Impairment losses"
  ]
};

export const MappingTable = ({ mappings, onMappingUpdate, onSave, onExport }: MappingTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredMappings = useMemo(() => {
    return mappings.filter(mapping => {
      const matchesSearch = 
        mapping.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.accountDescription.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterCategory === "all" || mapping.highLevelCategory === filterCategory;
      
      return matchesSearch && matchesFilter;
    });
  }, [mappings, searchTerm, filterCategory]);

  const updateMapping = (accountNumber: string, field: keyof AccountMapping, value: string) => {
    const updatedMappings = mappings.map(mapping => {
      if (mapping.accountNumber === accountNumber) {
        const updated = { ...mapping, [field]: value };
        
        // Reset dependent fields when high-level category changes
        if (field === 'highLevelCategory') {
          updated.subCategory = '';
          updated.detailedCategory = '';
        } else if (field === 'subCategory') {
          updated.detailedCategory = '';
        }
        
        return updated;
      }
      return mapping;
    });
    
    onMappingUpdate(updatedMappings);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Assets": return "bg-financial-blue text-white";
      case "Liabilities": return "bg-financial-red text-white";
      case "Equity": return "bg-financial-green text-white";
      case "Revenues": return "bg-financial-green text-white";
      case "Expenses": return "bg-financial-red text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const resetMapping = (accountNumber: string) => {
    updateMapping(accountNumber, 'highLevelCategory', '');
    updateMapping(accountNumber, 'subCategory', '');
    updateMapping(accountNumber, 'detailedCategory', '');
  };

  const unmappedCount = mappings.filter(m => !m.highLevelCategory).length;
  const completionRate = ((mappings.length - unmappedCount) / mappings.length * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Account Classification Mapping</CardTitle>
              <p className="text-muted-foreground mt-1">
                Map accounts to financial statement categories
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={onSave} className="gap-2">
                <Save className="w-4 h-4" />
                Save Mappings
              </Button>
              <Button variant="outline" onClick={onExport} className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-semibold">{mappings.length - unmappedCount}</span> of{" "}
                <span className="font-semibold">{mappings.length}</span> accounts mapped
              </div>
              <Badge variant={unmappedCount === 0 ? "default" : "secondary"}>
                {completionRate}% Complete
              </Badge>
            </div>
            <div className="w-32 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {HIGH_LEVEL_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mapping table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Account #</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-40">High-level Category</TableHead>
                <TableHead className="w-48">Sub-category</TableHead>
                <TableHead className="w-56">Detailed Category</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMappings.map((mapping) => (
                <TableRow key={mapping.accountNumber}>
                  <TableCell className="font-mono text-sm">
                    {mapping.accountNumber}
                  </TableCell>
                  <TableCell className="max-w-0">
                    <div className="truncate" title={mapping.accountDescription}>
                      {mapping.accountDescription}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={mapping.highLevelCategory}
                      onValueChange={(value) => updateMapping(mapping.accountNumber, 'highLevelCategory', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {HIGH_LEVEL_CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded ${getCategoryColor(category)}`} />
                              {category}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={mapping.subCategory}
                      onValueChange={(value) => updateMapping(mapping.accountNumber, 'subCategory', value)}
                      disabled={!mapping.highLevelCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mapping.highLevelCategory && SUB_CATEGORIES[mapping.highLevelCategory]?.map(subCat => (
                          <SelectItem key={subCat} value={subCat}>
                            {subCat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={mapping.detailedCategory}
                      onValueChange={(value) => updateMapping(mapping.accountNumber, 'detailedCategory', value)}
                      disabled={!mapping.subCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mapping.subCategory && DETAILED_CATEGORIES[mapping.subCategory]?.map(detailCat => (
                          <SelectItem key={detailCat} value={detailCat}>
                            {detailCat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resetMapping(mapping.accountNumber)}
                      title="Reset mapping"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredMappings.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No accounts match your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};