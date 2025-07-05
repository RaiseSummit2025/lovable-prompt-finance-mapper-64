import { AccountMapping } from "@/types/financial";

// Comprehensive IFRS-compliant financial structure
export const IFRS_STRUCTURE = {
  balanceSheet: {
    title: "📘 Balance Sheet",
    groups: {
      "Non-current Assets": [
        "Property, Plant and Equipment",
        "Right-of-Use Assets", 
        "Investment Property",
        "Intangible Assets",
        "Goodwill",
        "Investments in Associates and Joint Ventures",
        "Financial Assets (non-current)",
        "Contract Assets",
        "Deferred Tax Assets",
        "Other Non-current Assets"
      ],
      "Current Assets": [
        "Trade Receivables (net)",
        "Other Receivables",
        "Accrued Income", 
        "Inventories",
        "Prepayments",
        "Financial Assets (current)",
        "Current Tax Assets",
        "Cash and Cash Equivalents",
        "Assets Held for Sale"
      ],
      "Equity": [
        "Share Capital",
        "Share Premium",
        "Other Reserves",
        "Retained Earnings", 
        "Non-controlling Interests",
        "Revaluation Reserves",
        "Translation Reserves",
        "Hedging Reserves",
        "Fair Value through OCI Reserves"
      ],
      "Non-current Liabilities": [
        "Lease Liabilities (non-current)",
        "Provisions (non-current)",
        "Contract Liabilities",
        "Borrowings and Other Financial Liabilities (non-current)",
        "Deferred Tax Liabilities",
        "Other Non-current Liabilities"
      ],
      "Current Liabilities": [
        "Borrowings and Other Financial Liabilities (current)",
        "Lease Liabilities (current)",
        "Provisions (current)",
        "Contract Liabilities",
        "Trade Payables",
        "Other Payables",
        "Accrued Expenses",
        "Current Tax Liabilities",
        "Liabilities Related to Assets Held for Sale"
      ]
    }
  },
  incomeStatement: {
    title: "📙 Income Statement",
    groups: {
      "Revenue & Income": [
        "Revenues",
        "Other Operating Income",
        "Interest Income"
      ],
      "Costs & Expenses": [
        "Cost of Sales",
        "Selling Expenses",
        "Research & Development Expenses", 
        "General and Administrative Expenses",
        "Other Operating Expenses",
        "Depreciation & Amortization",
        "Interest Expense",
        "Income Tax Expense"
      ]
    }
  },
  cashFlowStatement: {
    title: "💰 Cash Flow Statement",
    groups: {
      "Operating Activities": [
        "Net Income",
        "Depreciation and Amortization",
        "Changes in Working Capital",
        "Provision Changes",
        "Other Operating Cash Flows"
      ],
      "Investing Activities": [
        "Capital Expenditures",
        "Acquisitions and Disposals",
        "Investment in Securities",
        "Other Investing Cash Flows"
      ],
      "Financing Activities": [
        "Proceeds from Borrowings",
        "Repayment of Borrowings",
        "Dividend Payments",
        "Share Issuance/Repurchase",
        "Other Financing Cash Flows"
      ]
    }
  }
};

// Smart initial categorization based on account description
export const getInitialCategory = (description: string): string => {
  const desc = description.toLowerCase();
  
  // Cash and equivalents
  if (desc.includes('cash') || desc.includes('bank')) return 'Cash and Cash Equivalents';
  
  // Receivables
  if (desc.includes('receivable') || desc.includes('debtor')) return 'Trade Receivables (net)';
  if (desc.includes('accrued income')) return 'Accrued Income';
  
  // Inventory
  if (desc.includes('inventory') || desc.includes('stock')) return 'Inventories';
  
  // Property and equipment
  if (desc.includes('property') || desc.includes('plant') || desc.includes('equipment') || desc.includes('machinery')) return 'Property, Plant and Equipment';
  if (desc.includes('right-of-use') || desc.includes('lease asset')) return 'Right-of-Use Assets';
  if (desc.includes('intangible') || desc.includes('software') || desc.includes('patent')) return 'Intangible Assets';
  if (desc.includes('goodwill')) return 'Goodwill';
  
  // Payables
  if (desc.includes('payable') || desc.includes('creditor')) return 'Trade Payables';
  if (desc.includes('accrued expense') || desc.includes('accrual')) return 'Accrued Expenses';
  
  // Borrowings and liabilities
  if (desc.includes('debt') || desc.includes('loan') || desc.includes('borrowing')) return 'Borrowings and Other Financial Liabilities (non-current)';
  if (desc.includes('lease liability')) return 'Lease Liabilities (non-current)';
  
  // Equity
  if (desc.includes('share capital') || desc.includes('capital stock')) return 'Share Capital';
  if (desc.includes('retained earnings') || desc.includes('accumulated')) return 'Retained Earnings';
  if (desc.includes('reserve')) return 'Other Reserves';
  
  // Revenue and income
  if (desc.includes('revenue') || desc.includes('sales') || desc.includes('income') && !desc.includes('expense')) return 'Revenues';
  
  // Expenses
  if (desc.includes('cost of sales') || desc.includes('cogs')) return 'Cost of Sales';
  if (desc.includes('depreciation') || desc.includes('amortization')) return 'Depreciation & Amortization';
  if (desc.includes('interest expense')) return 'Interest Expense';
  if (desc.includes('tax expense') || desc.includes('income tax')) return 'Income Tax Expense';
  if (desc.includes('expense') || desc.includes('cost')) return 'General and Administrative Expenses';
  
  // Default to Cash and Cash Equivalents for unmapped accounts
  return 'Cash and Cash Equivalents';
};

// Get confidence level for an account
export const getConfidence = (mapping: AccountMapping): "high" | "medium" | "low" => {
  if (!mapping.detailedCategory) return "low";
  
  // Mock confidence based on description and category alignment
  const desc = mapping.accountDescription.toLowerCase();
  const category = mapping.detailedCategory.toLowerCase();
  
  // High confidence for obvious matches
  if ((desc.includes('cash') && category.includes('current assets')) ||
      (desc.includes('revenue') && category.includes('revenue')) ||
      (desc.includes('payable') && category.includes('liabilities'))) {
    return "high";
  }
  
  // Low confidence for potential mismatches
  if ((desc.includes('equipment') && category.includes('current')) ||
      (desc.includes('revenue') && category.includes('expense'))) {
    return "low";
  }
  
  return "medium";
};
