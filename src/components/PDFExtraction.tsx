import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { FileText, CheckCircle, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { PDFExtractedData, PDFLineItem } from "@/services/pdf-processor";

interface PDFExtractionProps {
  pdfData: PDFExtractedData;
  onProceedToMapping: () => void;
}

export const PDFExtraction = ({ pdfData, onProceedToMapping }: PDFExtractionProps) => {
  const confidenceColor = pdfData.confidence >= 0.8 ? "text-green-600" : 
                          pdfData.confidence >= 0.6 ? "text-yellow-600" : "text-red-600";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderLineItemTable = (items: PDFLineItem[], title: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Current Year</th>
                <th className="text-right py-2">Previous Year</th>
                <th className="text-right py-2">Change</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const change = item.previousAmount ? item.amount - item.previousAmount : 0;
                const changePercent = item.previousAmount ? 
                  Math.round((change / Math.abs(item.previousAmount)) * 100) : 0;
                
                return (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-2 font-medium">{item.description}</td>
                    <td className="text-right py-2">{formatCurrency(item.amount)}</td>
                    <td className="text-right py-2">
                      {item.previousAmount ? formatCurrency(item.previousAmount) : '-'}
                    </td>
                    <td className="text-right py-2">
                      {item.previousAmount && (
                        <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(change)} ({changePercent >= 0 ? '+' : ''}{changePercent}%)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const totalItems = pdfData.extractedData.incomeStatement.length + 
                     pdfData.extractedData.balanceSheet.length + 
                     pdfData.extractedData.cashFlow.length;

  return (
    <div className="space-y-6">
      {/* Extraction Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>PDF Extraction Complete</CardTitle>
                <CardDescription>
                  Extracted financial data from {pdfData.fileName}
                </CardDescription>
              </div>
            </div>
            <Badge variant={pdfData.confidence >= 0.8 ? "default" : "secondary"}>
              <CheckCircle className="w-3 h-3 mr-1" />
              {Math.round(pdfData.confidence * 100)}% Confidence
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Line Items</div>
              <div className="text-2xl font-bold">{totalItems}</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Income Statement</div>
              <div className="text-2xl font-bold">{pdfData.extractedData.incomeStatement.length}</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Balance Sheet</div>
              <div className="text-2xl font-bold">{pdfData.extractedData.balanceSheet.length}</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Cash Flow</div>
              <div className="text-2xl font-bold">{pdfData.extractedData.cashFlow.length}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Extraction Confidence</span>
              <span className={confidenceColor}>
                {Math.round(pdfData.confidence * 100)}%
              </span>
            </div>
            <Progress value={pdfData.confidence * 100} className="w-full" />
          </div>

          {pdfData.confidence < 0.8 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Low confidence extraction - please review the mapped data carefully
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracted Data Preview */}
      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income">Income Statement</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>
        
        <TabsContent value="income" className="space-y-4">
          {renderLineItemTable(pdfData.extractedData.incomeStatement, "Income Statement")}
        </TabsContent>
        
        <TabsContent value="balance" className="space-y-4">
          {renderLineItemTable(pdfData.extractedData.balanceSheet, "Balance Sheet")}
        </TabsContent>
        
        <TabsContent value="cashflow" className="space-y-4">
          {renderLineItemTable(pdfData.extractedData.cashFlow, "Cash Flow Statement")}
        </TabsContent>
      </Tabs>

      {/* Action Button */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Ready for Account Mapping</h3>
              <p className="text-muted-foreground">
                The extracted data will be automatically mapped to standard chart of accounts categories
              </p>
            </div>
            <Button onClick={onProceedToMapping} className="w-full max-w-md">
              <DollarSign className="w-4 h-4 mr-2" />
              Proceed to Account Mapping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
