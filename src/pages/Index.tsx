import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "@/components/FileUpload";
import { PDFExtraction } from "@/components/PDFExtraction";
import { VisualMapping } from "@/components/VisualMapping";
import { FinancialStatements } from "@/components/FinancialStatements";
import { Dashboard } from "@/components/Dashboard";
import { UnderlyingData } from "@/components/UnderlyingData";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Upload, MapPin, BarChart3, AlertTriangle, Settings, FileText } from "lucide-react";
import { TrialBalanceEntry, AccountMapping, ValidationResult, FinancialStatement, DashboardMetrics } from "@/types/financial";
import { processPDFFile, convertPDFToTrialBalance, PDFExtractedData } from "@/services/pdf-processor";
import { cn } from "@/lib/utils";

const Index = () => {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [currentStep, setCurrentStep] = useState(1);
  const [rawData, setRawData] = useState<TrialBalanceEntry[]>([]);
  const [mappings, setMappings] = useState<AccountMapping[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileType, setUploadedFileType] = useState<'excel' | 'pdf' | null>(null);
  const [pdfData, setPdfData] = useState<PDFExtractedData | null>(null);
  
  const { toast } = useToast();

  // Mock data for demonstration
  const mockIncomeStatement: FinancialStatement = {
    type: 'income',
    period: '2024',
    data: [
      { category: 'Total Revenue', amount: 1000000, previousAmount: 850000, variance: 150000, variancePercent: 17.6 },
      { category: 'Gross Profit', amount: 400000, previousAmount: 340000, variance: 60000, variancePercent: 17.6 },
      { category: 'Net Income', amount: 150000, previousAmount: 120000, variance: 30000, variancePercent: 25.0 }
    ]
  };

  const mockBalanceSheet: FinancialStatement = {
    type: 'balance',
    period: '2024',
    data: [
      { category: 'Total Assets', amount: 2000000, previousAmount: 1800000, variance: 200000, variancePercent: 11.1 },
      { category: 'Total Liabilities', amount: 800000, previousAmount: 750000, variance: 50000, variancePercent: 6.7 },
      { category: 'Total Equity', amount: 1200000, previousAmount: 1050000, variance: 150000, variancePercent: 14.3 }
    ]
  };

  const mockCashFlowStatement: FinancialStatement = {
    type: 'cashflow',
    period: '2024',
    data: [
      { category: 'Operating Cash Flow', amount: 200000, previousAmount: 180000, variance: 20000, variancePercent: 11.1 },
      { category: 'Investing Cash Flow', amount: -50000, previousAmount: -40000, variance: -10000, variancePercent: 25.0 },
      { category: 'Financing Cash Flow', amount: -30000, previousAmount: -25000, variance: -5000, variancePercent: 20.0 }
    ]
  };

  const mockDashboardMetrics: DashboardMetrics = {
    totalAssets: 2000000,
    totalLiabilities: 800000,
    totalEquity: 1200000,
    totalRevenue: 1000000,
    totalExpenses: 850000,
    netIncome: 150000,
    workingCapital: 300000,
    currentRatio: 2.5,
    debtToEquity: 0.67
  };

  // Generate mock data if empty
  if (rawData.length === 0) {
    const mockRawData: TrialBalanceEntry[] = [
      { date: '2024-12-31', accountNumber: '1001', accountDescription: 'Cash and Cash Equivalents', debit: 500000, credit: 0, balance: 500000 },
      { date: '2024-12-31', accountNumber: '1200', accountDescription: 'Trade Receivables', debit: 300000, credit: 0, balance: 300000 },
      { date: '2024-12-31', accountNumber: '1500', accountDescription: 'Inventory', debit: 200000, credit: 0, balance: 200000 },
      { date: '2024-12-31', accountNumber: '2001', accountDescription: 'Property, Plant & Equipment', debit: 1000000, credit: 0, balance: 1000000 },
      { date: '2024-12-31', accountNumber: '3001', accountDescription: 'Trade Payables', debit: 0, credit: 150000, balance: -150000 },
      { date: '2024-12-31', accountNumber: '4001', accountDescription: 'Long-term Debt', debit: 0, credit: 650000, balance: -650000 },
      { date: '2024-12-31', accountNumber: '5001', accountDescription: 'Share Capital', debit: 0, credit: 1000000, balance: -1000000 },
      { date: '2024-12-31', accountNumber: '5002', accountDescription: 'Retained Earnings', debit: 0, credit: 200000, balance: -200000 },
      { date: '2024-12-31', accountNumber: '6001', accountDescription: 'Revenue', debit: 0, credit: 1000000, balance: -1000000 },
      { date: '2024-12-31', accountNumber: '7001', accountDescription: 'Cost of Goods Sold', debit: 600000, credit: 0, balance: 600000 },
      { date: '2024-12-31', accountNumber: '8001', accountDescription: 'Operating Expenses', debit: 250000, credit: 0, balance: 250000 }
    ];
    
    const mockMappings: AccountMapping[] = mockRawData.map(entry => ({
      accountNumber: entry.accountNumber,
      accountDescription: entry.accountDescription,
      highLevelCategory: '',
      subCategory: '',
      detailedCategory: ''
    }));
    
    setRawData(mockRawData);
    setMappings(mockMappings);
    setCurrentStep(4); // Skip to final step for demo
  }

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    console.log("Processing file:", file.name);
    
    try {
      if (file.type === 'application/pdf') {
        // Handle PDF upload
        setUploadedFileType('pdf');
        const extractedData = await processPDFFile(file);
        setPdfData(extractedData);
        
        // Convert PDF data to trial balance format for mapping
        const convertedData = convertPDFToTrialBalance(extractedData);
        setRawData(convertedData);
        
        // Generate initial mappings
        const uniqueAccounts = convertedData.reduce((acc, entry) => {
          if (!acc.find(item => item.accountNumber === entry.accountNumber)) {
            acc.push({
              accountNumber: entry.accountNumber,
              accountDescription: entry.accountDescription,
              highLevelCategory: '',
              subCategory: '',
              detailedCategory: ''
            });
          }
          return acc;
        }, [] as AccountMapping[]);
        
        setMappings(uniqueAccounts);
        setCurrentStep(2); // Go to PDF extraction review
        
        toast({
          title: "PDF processed successfully",
          description: `Extracted ${convertedData.length} line items from financial statements.`,
        });
      } else {
        // Handle Excel/CSV upload (existing logic)
        setUploadedFileType('excel');
        
        const mockRawData: TrialBalanceEntry[] = [
          { date: '2024-12-31', accountNumber: '1001', accountDescription: 'Cash and Cash Equivalents', debit: 500000, credit: 0, balance: 500000 },
          { date: '2024-12-31', accountNumber: '1200', accountDescription: 'Trade Receivables', debit: 300000, credit: 0, balance: 300000 },
          { date: '2024-12-31', accountNumber: '1500', accountDescription: 'Inventory', debit: 200000, credit: 0, balance: 200000 },
          { date: '2024-12-31', accountNumber: '2001', accountDescription: 'Property, Plant & Equipment', debit: 1000000, credit: 0, balance: 1000000 },
          { date: '2024-12-31', accountNumber: '3001', accountDescription: 'Trade Payables', debit: 0, credit: 150000, balance: -150000 },
          { date: '2024-12-31', accountNumber: '4001', accountDescription: 'Long-term Debt', debit: 0, credit: 650000, balance: -650000 },
          { date: '2024-12-31', accountNumber: '5001', accountDescription: 'Share Capital', debit: 0, credit: 1000000, balance: -1000000 },
          { date: '2024-12-31', accountNumber: '5002', accountDescription: 'Retained Earnings', debit: 0, credit: 200000, balance: -200000 },
        ];
        
        setRawData(mockRawData);
        
        // Generate initial mappings
        const uniqueAccounts = mockRawData.reduce((acc, entry) => {
          if (!acc.find(item => item.accountNumber === entry.accountNumber)) {
            acc.push({
              accountNumber: entry.accountNumber,
              accountDescription: entry.accountDescription,
              highLevelCategory: '',
              subCategory: '',
              detailedCategory: ''
            });
          }
          return acc;
        }, [] as AccountMapping[]);
        
        setMappings(uniqueAccounts);
        setCurrentStep(uploadedFileType === 'excel' ? 2 : 3); // Excel goes to validation, PDF skips to mapping
        
        toast({
          title: "File uploaded successfully",
          description: "Trial balance data has been processed.",
        });
      }
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "There was an error processing your file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidation = () => {
    // Mock validation logic
    const totalBalance = rawData.reduce((sum, entry) => sum + entry.balance, 0);
    const validation: ValidationResult = {
      isValid: Math.abs(totalBalance) < 0.01,
      errors: Math.abs(totalBalance) >= 0.01 ? ['Trial balance does not sum to zero'] : [],
      warnings: [],
      summary: {
        totalDebits: rawData.reduce((sum, entry) => sum + entry.debit, 0),
        totalCredits: rawData.reduce((sum, entry) => sum + entry.credit, 0),
        totalBalance: totalBalance,
        recordCount: rawData.length
      }
    };
    
    setValidationResult(validation);
    setCurrentStep(3);
  };

  const handleMappingSave = () => {
    setCurrentStep(4);
  };

  const handleMappingUpdate = (updatedMappings: AccountMapping[]) => {
    setMappings(updatedMappings);
  };

  const handleExport = (type: string) => {
    console.log(`Exporting ${type}...`);
  };

  const handleDataExport = (type: "raw" | "mapped") => {
    console.log(`Exporting ${type} data...`);
  };

  const steps = uploadedFileType === 'pdf' ? [
    { number: 1, title: "Upload PDF", description: "Import financial report PDF", icon: Upload },
    { number: 2, title: "Extract Data", description: "Parse financial statements", icon: FileText },
    { number: 3, title: "Map Accounts", description: "Classify accounts into categories", icon: MapPin },
    { number: 4, title: "Generate Reports", description: "Create financial statements", icon: BarChart3 }
  ] : [
    { number: 1, title: "Upload Data", description: "Import trial balance Excel file", icon: Upload },
    { number: 2, title: "Validate Data", description: "Check data integrity", icon: CheckCircle },
    { number: 3, title: "Map Accounts", description: "Classify accounts into categories", icon: MapPin },
    { number: 4, title: "Generate Reports", description: "Create financial statements", icon: BarChart3 }
  ];

  const completedSteps = currentStep - 1;
  const progressPercentage = (completedSteps / steps.length) * 100;
  const mappingProgress = mappings.length > 0 ? Math.round((mappings.filter(m => m.highLevelCategory).length / mappings.length) * 100) : 0;

  // Show setup flow if not completed
  if (currentStep < 4) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Financial Due Diligence Assistant
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform raw trial balance data into structured financial analysis ready for due diligence
            </p>
          </div>

          {/* Progress Steps */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Setup Progress</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Step {currentStep} of {steps.length}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={progressPercentage} className="w-full" />
                <div className="grid grid-cols-4 gap-4">
                  {steps.map((step, index) => {
                    const isCompleted = step.number < currentStep;
                    const isCurrent = step.number === currentStep;
                    const StepIcon = step.icon;
                    
                    return (
                      <div
                        key={step.number}
                        className={cn(
                          "flex flex-col items-center p-4 rounded-lg border smooth-transition hover-lift scale-animation",
                          isCompleted
                            ? 'bg-primary/10 border-primary text-primary'
                            : isCurrent
                            ? 'bg-muted border-primary/50 pulse-glow'
                            : 'bg-muted/50 border-muted text-muted-foreground'
                        )}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className={cn(
                          "p-2 rounded-full mb-2 smooth-transition",
                          isCompleted ? 'bg-primary text-white' : 'bg-muted'
                        )}>
                          <StepIcon className="w-4 h-4" />
                        </div>
                        <h3 className="font-semibold text-sm story-link">{step.title}</h3>
                        <p className="text-xs text-center">{step.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
            )}

            {currentStep === 2 && uploadedFileType === 'pdf' && pdfData && (
              <PDFExtraction 
                pdfData={pdfData}
                onProceedToMapping={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 2 && uploadedFileType === 'excel' && validationResult === null && (
              <Card>
                <CardHeader>
                  <CardTitle>Validate Trial Balance Data</CardTitle>
                  <CardDescription>
                    Verify data integrity before proceeding with mapping
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-4 rounded">
                        <div className="text-sm text-muted-foreground">Total Records</div>
                        <div className="text-2xl font-bold">{rawData.length}</div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded">
                        <div className="text-sm text-muted-foreground">Unique Accounts</div>
                        <div className="text-2xl font-bold">
                          {mappings.length}
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleValidation} className="w-full">
                      Validate Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && uploadedFileType === 'excel' && validationResult && (
              <Card>
                <CardHeader>
                  <CardTitle className={validationResult.isValid ? "text-green-600" : "text-red-600"}>
                    {validationResult.isValid ? "✓ Validation Passed" : "✗ Validation Failed"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {validationResult.errors.length > 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded">
                        <div className="font-semibold text-red-800">Errors:</div>
                        <ul className="list-disc list-inside text-red-700">
                          {validationResult.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted/50 p-3 rounded">
                        <div className="text-sm text-muted-foreground">Total Debits</div>
                        <div className="text-lg font-bold text-green-600">
                          ${validationResult.summary.totalDebits.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded">
                        <div className="text-sm text-muted-foreground">Total Credits</div>
                        <div className="text-lg font-bold text-red-600">
                          ${validationResult.summary.totalCredits.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded">
                        <div className="text-sm text-muted-foreground">Net Balance</div>
                        <div className={`text-lg font-bold ${Math.abs(validationResult.summary.totalBalance) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                          ${validationResult.summary.totalBalance.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded">
                        <div className="text-sm text-muted-foreground">Records</div>
                        <div className="text-lg font-bold">
                          {validationResult.summary.recordCount}
                        </div>
                      </div>
                    </div>
                    
                    {validationResult.isValid && (
                      <Button onClick={() => setCurrentStep(3)} className="w-full">
                        Proceed to Mapping
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <VisualMapping
                mappings={mappings}
                onMappingUpdate={handleMappingUpdate}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main application with sidebar navigation
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 mr-72"> {/* Account for sidebar width */}
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">
                Financial Due Diligence Assistant
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive financial analysis and mapping dashboard
              </p>
            </div>

            {/* Tab Content */}
            <div className="space-y-6 enter-animation">
              {currentTab === "dashboard" && (
                <div className="scale-animation">
                  <Dashboard metrics={mockDashboardMetrics} period="2024" />
                </div>
              )}

              {currentTab === "statements" && (
                <div className="scale-animation">
                  <FinancialStatements
                    incomeStatement={mockIncomeStatement}
                    balanceSheet={mockBalanceSheet}
                    cashFlowStatement={mockCashFlowStatement}
                    onExport={handleExport}
                  />
                </div>
              )}

              {currentTab === "mapping" && (
                <div className="scale-animation">
                  <VisualMapping
                    mappings={mappings}
                    onMappingUpdate={handleMappingUpdate}
                  />
                </div>
              )}

              {currentTab === "data" && (
                <div className="scale-animation">
                  <UnderlyingData
                    rawData={rawData}
                    mappings={mappings}
                    onExport={handleDataExport}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          mappingProgress={mappingProgress}
        />
      </div>
    </div>
  );
};

export default Index;