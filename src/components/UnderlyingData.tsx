import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search, Filter, Eye } from "lucide-react";
import { TrialBalanceEntry, AccountMapping } from "@/types/financial";

interface UnderlyingDataProps {
  rawData: TrialBalanceEntry[];
  mappings: AccountMapping[];
  onExport: (type: "raw" | "mapped") => void;
}

export const UnderlyingData = ({ rawData, mappings, onExport }: UnderlyingDataProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");

  // Get unique periods from raw data
  const uniquePeriods = [...new Set(rawData.map(entry => entry.date))].sort();

  // Filter raw data based on search and period
  const filteredRawData = rawData.filter(entry => {
    const matchesSearch = 
      entry.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.accountDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPeriod = filterPeriod === "all" || entry.date === filterPeriod;
    
    return matchesSearch && matchesPeriod;
  });

  // Create mapped data by enriching raw data with mapping info
  const mappedData = filteredRawData.map(entry => {
    const mapping = mappings.find(m => m.accountNumber === entry.accountNumber);
    return {
      ...entry,
      highLevelCategory: mapping?.highLevelCategory || "",
      subCategory: mapping?.subCategory || "",
      detailedCategory: mapping?.detailedCategory || "",
      mappingStatus: mapping?.highLevelCategory ? "Mapped" : "Unmapped"
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const RawDataTable = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Original Trial Balance Data</CardTitle>
            <p className="text-muted-foreground text-sm">
              Raw data as imported from Excel file
            </p>
          </div>
          <Button onClick={() => onExport("raw")} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Raw Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
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
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                {uniquePeriods.map(period => (
                  <SelectItem key={period} value={period}>{period}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-muted/50 p-3 rounded">
              <div className="text-sm text-muted-foreground">Total Records</div>
              <div className="text-2xl font-bold">{filteredRawData.length}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded">
              <div className="text-sm text-muted-foreground">Unique Accounts</div>
              <div className="text-2xl font-bold">
                {new Set(filteredRawData.map(e => e.accountNumber)).size}
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded">
              <div className="text-sm text-muted-foreground">Total Debits</div>
              <div className="text-2xl font-bold text-financial-green">
                {formatCurrency(filteredRawData.reduce((sum, e) => sum + e.debit, 0))}
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded">
              <div className="text-sm text-muted-foreground">Total Credits</div>
              <div className="text-2xl font-bold text-financial-red">
                {formatCurrency(filteredRawData.reduce((sum, e) => sum + e.credit, 0))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Account #</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRawData.slice(0, 100).map((entry, index) => (
                  <TableRow key={`${entry.accountNumber}-${entry.date}-${index}`}>
                    <TableCell className="font-mono text-sm">{entry.date}</TableCell>
                    <TableCell className="font-mono text-sm">{entry.accountNumber}</TableCell>
                    <TableCell className="max-w-64 truncate" title={entry.accountDescription}>
                      {entry.accountDescription}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(entry.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRawData.length > 100 && (
            <div className="text-center p-4 text-muted-foreground">
              Showing first 100 records of {filteredRawData.length} total records
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const MappedDataTable = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Mapped Trial Balance Data</CardTitle>
            <p className="text-muted-foreground text-sm">
              Original data enriched with classification mappings
            </p>
          </div>
          <Button onClick={() => onExport("mapped")} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Mapped Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Mapping Status Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-financial-green/10 border border-financial-green/20 p-3 rounded">
              <div className="text-sm text-muted-foreground">Mapped Records</div>
              <div className="text-2xl font-bold text-financial-green">
                {mappedData.filter(e => e.mappingStatus === "Mapped").length}
              </div>
            </div>
            <div className="bg-financial-red/10 border border-financial-red/20 p-3 rounded">
              <div className="text-sm text-muted-foreground">Unmapped Records</div>
              <div className="text-2xl font-bold text-financial-red">
                {mappedData.filter(e => e.mappingStatus === "Unmapped").length}
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded">
              <div className="text-sm text-muted-foreground">Completion Rate</div>
              <div className="text-2xl font-bold">
                {((mappedData.filter(e => e.mappingStatus === "Mapped").length / mappedData.length) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Mapped Data Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Account #</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>High-Level</TableHead>
                  <TableHead>Sub-Category</TableHead>
                  <TableHead>Detailed</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappedData.slice(0, 100).map((entry, index) => (
                  <TableRow key={`${entry.accountNumber}-${entry.date}-${index}`}>
                    <TableCell className="font-mono text-sm">{entry.date}</TableCell>
                    <TableCell className="font-mono text-sm">{entry.accountNumber}</TableCell>
                    <TableCell className="max-w-48 truncate" title={entry.accountDescription}>
                      {entry.accountDescription}
                    </TableCell>
                    <TableCell>
                      {entry.highLevelCategory && (
                        <Badge variant="secondary" className="text-xs">
                          {entry.highLevelCategory}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-32 truncate" title={entry.subCategory}>
                      {entry.subCategory}
                    </TableCell>
                    <TableCell className="max-w-32 truncate" title={entry.detailedCategory}>
                      {entry.detailedCategory}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(entry.balance)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={entry.mappingStatus === "Mapped" ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {entry.mappingStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {mappedData.length > 100 && (
            <div className="text-center p-4 text-muted-foreground">
              Showing first 100 records of {mappedData.length} total records
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Underlying Data
          </CardTitle>
          <p className="text-muted-foreground">
            View and audit the original and processed data
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="raw" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="raw">Original Excel Data</TabsTrigger>
          <TabsTrigger value="mapped">Mapped Data</TabsTrigger>
        </TabsList>

        <TabsContent value="raw">
          <RawDataTable />
        </TabsContent>

        <TabsContent value="mapped">
          <MappedDataTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};
