import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { AccountMapping } from "@/types/financial";
import { CategoryDropZone } from "./mapping/CategoryDropZone";
import { MappingControls } from "./mapping/MappingControls";
import { NavigationSidebar } from "./mapping/NavigationSidebar";
import { DataTabs } from "./mapping/DataTabs";
import { MappingProgressIndicator } from "./mapping/MappingProgressIndicator";
import { QuickActions } from "./mapping/QuickActions";
import { AdvancedFilters } from "./mapping/AdvancedFilters";
import { IFRS_STRUCTURE, getInitialCategory, getConfidence } from "./mapping/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

interface VisualMappingProps {
  mappings: AccountMapping[];
  onMappingUpdate: (mappings: AccountMapping[]) => void;
}

export const VisualMapping = ({ mappings, onMappingUpdate }: VisualMappingProps) => {
  const [activeTab, setActiveTab] = useState("balance-sheet");
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [activeSection, setActiveSection] = useState("mapping");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showDataTabs, setShowDataTabs] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredMappings, setFilteredMappings] = useState<AccountMapping[]>(mappings);

  // Auto-assign some accounts to categories for demo if they're empty
  const initializeMappings = () => {
    const updatedMappings = mappings.map(mapping => {
      if (!mapping.detailedCategory) {
        return { ...mapping, detailedCategory: getInitialCategory(mapping.accountDescription) };
      }
      return mapping;
    });
    
    if (mappings.some(m => !m.detailedCategory)) {
      onMappingUpdate(updatedMappings);
    }
  };

  // Initialize mappings on first load
  useEffect(() => {
    initializeMappings();
  }, []);

  // Update filtered mappings when base mappings change
  useEffect(() => {
    setFilteredMappings(mappings);
  }, [mappings]);

  // Filter mappings based on confidence
  const visibleMappings = useMemo(() => {
    const baseData = filteredMappings.length > 0 ? filteredMappings : mappings;
    return baseData.filter(mapping => {
      if (showAllAccounts) return true;
      const confidence = getConfidence(mapping);
      return confidence === "low" || !mapping.detailedCategory;
    });
  }, [filteredMappings, mappings, showAllAccounts]);

  // Calculate mapping statistics
  const mappingStats = useMemo(() => {
    const totalAccounts = mappings.length;
    const reviewNeeded = mappings.filter(m => getConfidence(m) === "low").length;
    const completed = mappings.filter(m => m.detailedCategory && getConfidence(m) !== "low").length;
    
    return {
      totalAccounts,
      reviewNeeded,
      completed
    };
  }, [mappings]);

  const updateMapping = (accountNumber: string, field: keyof AccountMapping, value: string) => {
    const updatedMappings = mappings.map(mapping => {
      if (mapping.accountNumber === accountNumber) {
        return { ...mapping, [field]: value };
      }
      return mapping;
    });
    onMappingUpdate(updatedMappings);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const accountNumber = draggableId;
    const newCategory = destination.droppableId;
    
    updateMapping(accountNumber, 'detailedCategory', newCategory);
  };

  const getMappingsToShow = () => showAllAccounts ? 
    (filteredMappings.length > 0 ? filteredMappings : mappings) : 
    visibleMappings;

  return (
    <div className="flex gap-6 min-h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">IFRS Mapping & Classification</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDataTabs(!showDataTabs)}
              className="gap-2"
            >
              {showDataTabs ? "Hide" : "Show"} Data
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2"
            >
              {showSidebar ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mb-6">
            <AdvancedFilters
              mappings={mappings}
              onFilterChange={setFilteredMappings}
              isExpanded={showFilters}
              onToggleExpanded={() => setShowFilters(!showFilters)}
            />
          </div>
        )}

        {/* Data Tabs */}
        {showDataTabs && (
          <div className="mb-6">
            <DataTabs mappings={filteredMappings.length > 0 ? filteredMappings : mappings} />
          </div>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-6">
            {/* Header Controls */}
            <MappingControls
              showAllAccounts={showAllAccounts}
              onToggleShowAll={() => setShowAllAccounts(!showAllAccounts)}
              visibleCount={getMappingsToShow().length}
              totalCount={mappings.length}
            />

            {/* Statement Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="balance-sheet" className="gap-2">
                  {IFRS_STRUCTURE.balanceSheet.title}
                </TabsTrigger>
                <TabsTrigger value="income-statement" className="gap-2">
                  {IFRS_STRUCTURE.incomeStatement.title}
                </TabsTrigger>
                <TabsTrigger value="cash-flow" className="gap-2">
                  {IFRS_STRUCTURE.cashFlowStatement.title}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="balance-sheet" className="mt-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Assets Column */}
                  <Card className="border-l-4 border-l-primary">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary">Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <CategoryDropZone 
                        groupTitle="Non-current Assets"
                        categories={IFRS_STRUCTURE.balanceSheet.groups["Non-current Assets"]}
                        statement="balance-sheet"
                        mappings={getMappingsToShow()}
                        onUpdate={updateMapping}
                        getConfidence={getConfidence}
                      />
                      <CategoryDropZone 
                        groupTitle="Current Assets"
                        categories={IFRS_STRUCTURE.balanceSheet.groups["Current Assets"]}
                        statement="balance-sheet"
                        mappings={getMappingsToShow()}
                        onUpdate={updateMapping}
                        getConfidence={getConfidence}
                      />
                    </CardContent>
                  </Card>

                  {/* Liabilities & Equity Column */}
                  <Card className="border-l-4 border-l-secondary">
                    <CardHeader>
                      <CardTitle className="text-lg text-secondary-foreground">Liabilities & Equity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <CategoryDropZone 
                        groupTitle="Equity"
                        categories={IFRS_STRUCTURE.balanceSheet.groups["Equity"]}
                        statement="balance-sheet"
                        mappings={getMappingsToShow()}
                        onUpdate={updateMapping}
                        getConfidence={getConfidence}
                      />
                      <CategoryDropZone 
                        groupTitle="Non-current Liabilities"
                        categories={IFRS_STRUCTURE.balanceSheet.groups["Non-current Liabilities"]}
                        statement="balance-sheet"
                        mappings={getMappingsToShow()}
                        onUpdate={updateMapping}
                        getConfidence={getConfidence}
                      />
                      <CategoryDropZone 
                        groupTitle="Current Liabilities"
                        categories={IFRS_STRUCTURE.balanceSheet.groups["Current Liabilities"]}
                        statement="balance-sheet"
                        mappings={getMappingsToShow()}
                        onUpdate={updateMapping}
                        getConfidence={getConfidence}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="income-statement" className="mt-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Revenue & Income */}
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="text-lg text-green-700 dark:text-green-400">Revenue & Income</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <CategoryDropZone 
                        groupTitle="Revenue & Income"
                        categories={IFRS_STRUCTURE.incomeStatement.groups["Revenue & Income"]}
                        statement="income-statement"
                        mappings={getMappingsToShow()}
                        onUpdate={updateMapping}
                        getConfidence={getConfidence}
                      />
                    </CardContent>
                  </Card>

                  {/* Costs & Expenses */}
                  <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <CardTitle className="text-lg text-red-700 dark:text-red-400">Costs & Expenses</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <CategoryDropZone 
                        groupTitle="Costs & Expenses"
                        categories={IFRS_STRUCTURE.incomeStatement.groups["Costs & Expenses"]}
                        statement="income-statement"
                        mappings={getMappingsToShow()}
                        onUpdate={updateMapping}
                        getConfidence={getConfidence}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="cash-flow" className="mt-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Operating Activities */}
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-700 dark:text-blue-400">Operating Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <CategoryDropZone 
                        groupTitle="Operating Activities"
                        categories={IFRS_STRUCTURE.cashFlowStatement.groups["Operating Activities"]}
                        statement="cash-flow"
                        mappings={getMappingsToShow()}
                        onUpdate={updateMapping}
                        getConfidence={getConfidence}
                      />
                    </CardContent>
                  </Card>

                  {/* Investing Activities */}
                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                      <CardTitle className="text-lg text-purple-700 dark:text-purple-400">Investing Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <CategoryDropZone 
                        groupTitle="Investing Activities"
                        categories={IFRS_STRUCTURE.cashFlowStatement.groups["Investing Activities"]}
                        statement="cash-flow"
                        mappings={getMappingsToShow()}
                        onUpdate={updateMapping}
                        getConfidence={getConfidence}
                      />
                    </CardContent>
                  </Card>

                  {/* Financing Activities */}
                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader>
                      <CardTitle className="text-lg text-orange-700 dark:text-orange-400">Financing Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <CategoryDropZone 
                        groupTitle="Financing Activities"
                        categories={IFRS_STRUCTURE.cashFlowStatement.groups["Financing Activities"]}
                        statement="cash-flow"
                        mappings={getMappingsToShow()}
                        onUpdate={updateMapping}
                        getConfidence={getConfidence}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DragDropContext>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 flex-shrink-0 space-y-6">
          <NavigationSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            mappingStats={mappingStats}
          />
          <MappingProgressIndicator mappings={mappings} />
          <QuickActions 
            mappings={mappings} 
            onMappingUpdate={onMappingUpdate}
          />
        </div>
      )}
    </div>
  );
};
