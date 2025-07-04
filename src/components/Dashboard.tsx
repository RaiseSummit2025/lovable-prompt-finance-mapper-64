import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Activity } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Area, AreaChart } from "recharts";
import { DashboardMetrics } from "@/types/financial";

interface DashboardProps {
  metrics: DashboardMetrics;
  period: string;
}

export const Dashboard = ({ metrics, period }: DashboardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRatio = (ratio: number) => {
    return ratio.toFixed(2);
  };

  const getHealthColor = (ratio: number, goodThreshold: number, excellentThreshold: number) => {
    if (ratio >= excellentThreshold) return "text-financial-green";
    if (ratio >= goodThreshold) return "text-financial-amber";
    return "text-financial-red";
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    description 
  }: { 
    title: string; 
    value: string; 
    icon: any; 
    trend?: number; 
    description?: string; 
  }) => (
    <Card className="hover:shadow-financial transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            {trend !== undefined && (
              <Badge 
                variant={trend >= 0 ? "default" : "destructive"}
                className="text-xs"
              >
                {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {Math.abs(trend).toFixed(1)}%
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const profitMargin = metrics.totalRevenue > 0 ? (metrics.netIncome / metrics.totalRevenue) * 100 : 0;
  const assetTurnover = metrics.totalAssets > 0 ? metrics.totalRevenue / metrics.totalAssets : 0;

  // Chart data
  const balanceSheetData = [
    { name: 'Assets', value: metrics.totalAssets, color: 'hsl(var(--financial-blue))' },
    { name: 'Liabilities', value: metrics.totalLiabilities, color: 'hsl(var(--financial-red))' },
    { name: 'Equity', value: metrics.totalEquity, color: 'hsl(var(--financial-green))' }
  ];

  const profitabilityData = [
    { name: 'Revenue', value: metrics.totalRevenue },
    { name: 'Expenses', value: metrics.totalExpenses },
    { name: 'Net Income', value: metrics.netIncome }
  ];

  const ratioData = [
    { name: 'Current Ratio', value: metrics.currentRatio, benchmark: 2.0 },
    { name: 'Debt/Equity', value: metrics.debtToEquity, benchmark: 0.5 },
    { name: 'Profit Margin %', value: profitMargin, benchmark: 15 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="gradient-financial text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Financial Dashboard</CardTitle>
          <p className="text-white/80">Period: {period}</p>
        </CardHeader>
      </Card>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Assets"
          value={formatCurrency(metrics.totalAssets)}
          icon={BarChart3}
          description="Total company assets"
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          icon={DollarSign}
          description="Total income generated"
        />
        <MetricCard
          title="Net Income"
          value={formatCurrency(metrics.netIncome)}
          icon={TrendingUp}
          description="Bottom line profit"
        />
        <MetricCard
          title="Working Capital"
          value={formatCurrency(metrics.workingCapital)}
          icon={Activity}
          description="Short-term liquidity"
        />
      </div>

      {/* Financial Ratios */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Ratios & Analysis</CardTitle>
          <p className="text-muted-foreground">
            Key performance indicators for financial health assessment
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Liquidity Ratios */}
            <div className="space-y-4">
              <h4 className="font-semibold text-primary">Liquidity Ratios</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="text-sm">Current Ratio</span>
                  <span className={`font-bold ${getHealthColor(metrics.currentRatio, 1.0, 2.0)}`}>
                    {formatRatio(metrics.currentRatio)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Good: ≥1.0, Excellent: ≥2.0
                </div>
              </div>
            </div>

            {/* Leverage Ratios */}
            <div className="space-y-4">
              <h4 className="font-semibold text-primary">Leverage Ratios</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="text-sm">Debt-to-Equity</span>
                  <span className={`font-bold ${getHealthColor(1 / (metrics.debtToEquity + 0.1), 0.3, 0.7)}`}>
                    {formatRatio(metrics.debtToEquity)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Good: ≤1.0, Excellent: ≤0.5
                </div>
              </div>
            </div>

            {/* Profitability Ratios */}
            <div className="space-y-4">
              <h4 className="font-semibold text-primary">Profitability Ratios</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="text-sm">Profit Margin</span>
                  <span className={`font-bold ${getHealthColor(profitMargin, 5, 15)}`}>
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Good: ≥5%, Excellent: ≥15%
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Sheet Composition */}
        <Card>
          <CardHeader>
            <CardTitle>Balance Sheet Composition</CardTitle>
            <p className="text-muted-foreground text-sm">Assets vs Liabilities & Equity</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={balanceSheetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {balanceSheetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), ""]}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {balanceSheetData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profitability Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Profitability Breakdown</CardTitle>
            <p className="text-muted-foreground text-sm">Revenue, Expenses & Net Income</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitabilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), ""]}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Financial Ratios Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Key Ratios vs Industry Benchmarks</CardTitle>
          <p className="text-muted-foreground">Performance against industry standards</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ratioData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
              <XAxis 
                type="number"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                width={100}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'benchmark' ? `${value.toFixed(2)} (Benchmark)` : value.toFixed(2),
                  name === 'benchmark' ? 'Industry Standard' : 'Current'
                ]}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="benchmark" fill="hsl(var(--muted-foreground) / 0.3)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Financial Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div>
              <h4 className="font-semibold text-financial-green mb-3">Strengths</h4>
              <div className="space-y-2">
                {metrics.currentRatio >= 2.0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-financial-green rounded-full"></div>
                    Excellent liquidity position
                  </div>
                )}
                {profitMargin >= 15 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-financial-green rounded-full"></div>
                    Strong profit margins
                  </div>
                )}
                {metrics.debtToEquity <= 0.5 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-financial-green rounded-full"></div>
                    Low debt levels
                  </div>
                )}
                {metrics.workingCapital > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-financial-green rounded-full"></div>
                    Positive working capital
                  </div>
                )}
              </div>
            </div>

            {/* Areas for Attention */}
            <div>
              <h4 className="font-semibold text-financial-red mb-3">Areas for Attention</h4>
              <div className="space-y-2">
                {metrics.currentRatio < 1.0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-financial-red rounded-full"></div>
                    Liquidity concerns
                  </div>
                )}
                {profitMargin < 5 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-financial-red rounded-full"></div>
                    Low profit margins
                  </div>
                )}
                {metrics.debtToEquity > 1.0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-financial-red rounded-full"></div>
                    High debt levels
                  </div>
                )}
                {metrics.workingCapital < 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-financial-red rounded-full"></div>
                    Negative working capital
                  </div>
                )}
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};