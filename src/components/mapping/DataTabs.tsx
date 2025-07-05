import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AccountMapping, TrialBalanceEntry } from "@/types/financial";
import { getConfidence } from "./utils";

interface DataTabsProps {
  mappings: AccountMapping[];
  trialBalanceData?: TrialBalanceEntry[];
}

export const DataTabs = ({ mappings, trialBalanceData = [] }: DataTabsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDataTab, setActiveDataTab] = useState("original");

  // Mock trial balance data if not provided
  const mockTrialBalance: TrialBalanceEntry[] = mappings.map((mapping, index) => ({
    date: "2024-12-31",
    accountNumber: mapping.accountNumber,
    accountDescription: mapping.accountDescription,
    debit: Math.random() > 0.5 ? Math.floor(Math.random() * 100000) : 0,
    credit: Math.random() > 0.5 ? Math.floor(Math.random() * 100000) : 0,
    balance: Math.floor(Math.random() * 200000) - 100000
  }));

  const dataToShow = trialBalanceData.length > 0 ? trialBalanceData : mockTrialBalance;

  const filteredOriginalData = dataToShow.filter(item => 
    item.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.accountDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMappedData = mappings.filter(mapping => 
    mapping.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.accountDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getConfidenceBadge = (mapping: AccountMapping) => {
    const confidence = getConfidence(mapping);
    return (
      <Badge 
        variant={
          confidence === "high" ? "default" : 
          confidence === "medium" ? "secondary" : 
          "destructive"
        }
        className="text-xs"
      >
        {confidence}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Data Explorer</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Data Tabs */}
          <Tabs value={activeDataTab} onValueChange={setActiveDataTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="original">Original Trial Balance</TabsTrigger>
              <TabsTrigger value="mapped">Mapped with Classifications</TabsTrigger>
            </TabsList>

            <TabsContent value="original" className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-muted/50">
                      <TableRow>
                        <TableHead className="w-32">Account #</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right w-28">Debit</TableHead>
                        <TableHead className="text-right w-28">Credit</TableHead>
                        <TableHead className="text-right w-32">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOriginalData.map((item, index) => (
                        <TableRow key={`${item.accountNumber}-${index}`} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-sm">{item.accountNumber}</TableCell>
                          <TableCell className="max-w-xs truncate" title={item.accountDescription}>
                            {item.accountDescription}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {item.debit > 0 ? formatCurrency(item.debit) : "-"}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {item.credit > 0 ? formatCurrency(item.credit) : "-"}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {formatCurrency(item.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-3 bg-muted/30 border-t text-sm text-muted-foreground">
                  Showing {filteredOriginalData.length} of {dataToShow.length} accounts
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mapped" className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-muted/50">
                      <TableRow>
                        <TableHead className="w-32">Account #</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-40">IFRS Category</TableHead>
                        <TableHead className="w-32">High Level</TableHead>
                        <TableHead className="w-24">Confidence</TableHead>
                        <TableHead className="text-right w-32">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMappedData.map((mapping, index) => {
                        const originalData = dataToShow.find(d => d.accountNumber === mapping.accountNumber);
                        return (
                          <TableRow key={`${mapping.accountNumber}-${index}`} className="hover:bg-muted/30">
                            <TableCell className="font-mono text-sm">{mapping.accountNumber}</TableCell>
                            <TableCell className="max-w-xs truncate" title={mapping.accountDescription}>
                              {mapping.accountDescription}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {mapping.detailedCategory || (
                                  <span className="text-muted-foreground italic">Unmapped</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {mapping.highLevelCategory || "-"}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getConfidenceBadge(mapping)}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium">
                              {originalData ? formatCurrency(originalData.balance) : "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-3 bg-muted/30 border-t text-sm text-muted-foreground flex justify-between">
                  <span>Showing {filteredMappedData.length} of {mappings.length} accounts</span>
                  <span>
                    {mappings.filter(m => getConfidence(m) === "low").length} require review
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};
