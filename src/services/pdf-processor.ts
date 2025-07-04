import { TrialBalanceEntry } from "@/types/financial";

export interface PDFExtractedData {
  type: 'pdf';
  fileName: string;
  extractedData: {
    incomeStatement: PDFLineItem[];
    balanceSheet: PDFLineItem[];
    cashFlow: PDFLineItem[];
  };
  confidence: number;
  processingDate: string;
}

export interface PDFLineItem {
  description: string;
  period: string;
  amount: number;
  previousAmount?: number;
  category?: string;
  source: 'income' | 'balance' | 'cashflow';
}

// Mock PDF processing service - in production this would use actual PDF parsing
export const processPDFFile = async (file: File): Promise<PDFExtractedData> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock extracted data from a typical annual report
  const mockData: PDFExtractedData = {
    type: 'pdf',
    fileName: file.name,
    extractedData: {
      incomeStatement: [
        { description: 'Total Revenue', period: '2024', amount: 1000000, previousAmount: 850000, source: 'income' },
        { description: 'Cost of Goods Sold', period: '2024', amount: 600000, previousAmount: 510000, source: 'income' },
        { description: 'Gross Profit', period: '2024', amount: 400000, previousAmount: 340000, source: 'income' },
        { description: 'Operating Expenses', period: '2024', amount: 250000, previousAmount: 220000, source: 'income' },
        { description: 'Net Income', period: '2024', amount: 150000, previousAmount: 120000, source: 'income' }
      ],
      balanceSheet: [
        { description: 'Cash and Cash Equivalents', period: '2024', amount: 500000, previousAmount: 450000, source: 'balance' },
        { description: 'Trade Receivables', period: '2024', amount: 300000, previousAmount: 280000, source: 'balance' },
        { description: 'Inventory', period: '2024', amount: 200000, previousAmount: 190000, source: 'balance' },
        { description: 'Property, Plant & Equipment', period: '2024', amount: 1000000, previousAmount: 950000, source: 'balance' },
        { description: 'Total Assets', period: '2024', amount: 2000000, previousAmount: 1870000, source: 'balance' },
        { description: 'Trade Payables', period: '2024', amount: 150000, previousAmount: 140000, source: 'balance' },
        { description: 'Long-term Debt', period: '2024', amount: 650000, previousAmount: 680000, source: 'balance' },
        { description: 'Share Capital', period: '2024', amount: 1000000, previousAmount: 900000, source: 'balance' },
        { description: 'Retained Earnings', period: '2024', amount: 200000, previousAmount: 150000, source: 'balance' }
      ],
      cashFlow: [
        { description: 'Operating Cash Flow', period: '2024', amount: 200000, previousAmount: 180000, source: 'cashflow' },
        { description: 'Investing Cash Flow', period: '2024', amount: -50000, previousAmount: -40000, source: 'cashflow' },
        { description: 'Financing Cash Flow', period: '2024', amount: -30000, previousAmount: -25000, source: 'cashflow' },
        { description: 'Net Change in Cash', period: '2024', amount: 120000, previousAmount: 115000, source: 'cashflow' }
      ]
    },
    confidence: 0.85,
    processingDate: new Date().toISOString()
  };
  
  return mockData;
};

// Convert PDF extracted data to trial balance format for consistency
export const convertPDFToTrialBalance = (pdfData: PDFExtractedData): TrialBalanceEntry[] => {
  const entries: TrialBalanceEntry[] = [];
  let accountNumber = 1000;
  
  // Process all line items from all statements
  const allItems = [
    ...pdfData.extractedData.incomeStatement,
    ...pdfData.extractedData.balanceSheet,
    ...pdfData.extractedData.cashFlow
  ];
  
  allItems.forEach(item => {
    const isCredit = item.amount < 0 || 
                     item.description.toLowerCase().includes('revenue') ||
                     item.description.toLowerCase().includes('income') ||
                     item.description.toLowerCase().includes('liability') ||
                     item.description.toLowerCase().includes('equity') ||
                     item.description.toLowerCase().includes('capital');
    
    entries.push({
      date: item.period,
      accountNumber: accountNumber.toString(),
      accountDescription: item.description,
      debit: isCredit ? 0 : Math.abs(item.amount),
      credit: isCredit ? Math.abs(item.amount) : 0,
      balance: isCredit ? -Math.abs(item.amount) : Math.abs(item.amount)
    });
    
    accountNumber += 10;
  });
  
  return entries;
};