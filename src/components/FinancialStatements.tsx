import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import { FinancialStatement, FinancialStatementLine } from "@/types/financial";

interface FinancialStatementsProps {
  incomeStatement: FinancialStatement;
  balanceSheet: FinancialStatement;
  cashFlowStatement: FinancialStatement;
  onExport: (statementType: string) => void;
}

export const FinancialStatements = ({ 
  incomeStatement, 
  balanceSheet, 
  cashFlowStatement, 
  onExport 
}: FinancialStatementsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="w-4 h-4 text-financial-green" />;
    if (variance < 0) return <TrendingDown className="w-4 h-4 text-financial-red" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const StatementTable = ({ statement, title }: { statement: FinancialStatement; title: string }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onExport(statement.type)}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Line Item</TableHead>
              <TableHead className="text-right">Current Period</TableHead>
              <TableHead className="text-right">Previous Period</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead className="text-right">Variance %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statement.data.map((line, index) => (
              <TableRow key={index} className={line.subCategory ? "pl-4" : ""}>
                <TableCell className={`${line.subCategory ? "pl-8 text-muted-foreground" : "font-medium"}`}>
                  {line.category}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(line.amount)}
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {line.previousAmount ? formatCurrency(line.previousAmount) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {line.variance !== undefined && (
                    <div className="flex items-center justify-end gap-2">
                      {getVarianceIcon(line.variance)}
                      <span className="font-mono">
                        {formatCurrency(Math.abs(line.variance))}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {line.variancePercent !== undefined && (
                    <Badge 
                      variant={line.variancePercent >= 0 ? "default" : "destructive"}
                      className="font-mono"
                    >
                      {formatPercentage(line.variancePercent)}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Statements</CardTitle>
          <p className="text-muted-foreground">
            Auto-generated from classified trial balance data
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="income" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income">Income Statement</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow Statement</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <StatementTable 
            statement={incomeStatement} 
            title="Income Statement (Profit & Loss)" 
          />
          
          {/* Income Statement Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue vs Expenses Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={[
                    { name: 'Current', Revenue: incomeStatement.data.find(l => l.category.includes('Revenue'))?.amount || 0, Expenses: (incomeStatement.data.find(l => l.category.includes('Revenue'))?.amount || 0) - (incomeStatement.data.find(l => l.category.includes('Net'))?.amount || 0) },
                    { name: 'Previous', Revenue: incomeStatement.data.find(l => l.category.includes('Revenue'))?.previousAmount || 0, Expenses: (incomeStatement.data.find(l => l.category.includes('Revenue'))?.previousAmount || 0) - (incomeStatement.data.find(l => l.category.includes('Net'))?.previousAmount || 0) }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), ""]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Area type="monotone" dataKey="Revenue" stackId="1" stroke="hsl(var(--financial-green))" fill="hsl(var(--financial-green) / 0.3)" />
                    <Area type="monotone" dataKey="Expenses" stackId="2" stroke="hsl(var(--financial-red))" fill="hsl(var(--financial-red) / 0.3)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-financial-green">
                      {formatCurrency(incomeStatement.data.find(l => l.category.includes('Revenue'))?.amount || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">
                      {formatCurrency(incomeStatement.data.find(l => l.category.includes('Gross'))?.amount || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Gross Profit</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(incomeStatement.data.find(l => l.category.includes('Net'))?.amount || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Net Income</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          <StatementTable 
            statement={balanceSheet} 
            title="Balance Sheet (Statement of Financial Position)" 
          />
          
          {/* Balance Sheet Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assets vs Liabilities & Equity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { 
                      name: 'Current Year', 
                      Assets: balanceSheet.data.find(l => l.category === 'Total Assets')?.amount || 0,
                      Liabilities: balanceSheet.data.find(l => l.category === 'Total Liabilities')?.amount || 0,
                      Equity: balanceSheet.data.find(l => l.category === 'Total Equity')?.amount || 0
                    },
                    { 
                      name: 'Previous Year', 
                      Assets: balanceSheet.data.find(l => l.category === 'Total Assets')?.previousAmount || 0,
                      Liabilities: balanceSheet.data.find(l => l.category === 'Total Liabilities')?.previousAmount || 0,
                      Equity: balanceSheet.data.find(l => l.category === 'Total Equity')?.previousAmount || 0
                    }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), ""]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="Assets" fill="hsl(var(--financial-blue))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Liabilities" fill="hsl(var(--financial-red))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Equity" fill="hsl(var(--financial-green))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Position Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-financial-blue">
                      {formatCurrency(balanceSheet.data.find(l => l.category === 'Total Assets')?.amount || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Assets</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-financial-red">
                      {formatCurrency(balanceSheet.data.find(l => l.category === 'Total Liabilities')?.amount || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Liabilities</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-financial-green">
                      {formatCurrency(balanceSheet.data.find(l => l.category === 'Total Equity')?.amount || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Equity</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <StatementTable 
            statement={cashFlowStatement} 
            title="Cash Flow Statement (Indirect Method)" 
          />
          
          {/* Key metrics for Cash Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cash Flow Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-financial-green">
                    {formatCurrency(cashFlowStatement.data.find(l => l.category.includes('Operating'))?.amount || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Operating Cash Flow</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-financial-blue">
                    {formatCurrency(cashFlowStatement.data.find(l => l.category.includes('Investing'))?.amount || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Investing Cash Flow</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-financial-red">
                    {formatCurrency(cashFlowStatement.data.find(l => l.category.includes('Financing'))?.amount || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Financing Cash Flow</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};