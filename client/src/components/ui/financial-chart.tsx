import { useState } from "react";
import { 
  Area, 
  AreaChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface FinancialData {
  month: string;
  income: number;
  expenses: number;
}

interface FinancialChartProps {
  data?: {
    financialData: FinancialData[];
    summary?: {
      income: number;
      expenses: number;
      savings: number;
      investments: number;
    };
  } | null;
  isLoading?: boolean;
}

export default function FinancialChart({ data, isLoading = false }: FinancialChartProps) {
  const [timeframe, setTimeframe] = useState("30");
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-9 w-36" />
          </div>
          <Skeleton className="h-[250px] w-full" />
          <div className="grid grid-cols-4 gap-4 mt-4 text-center">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.financialData || [];
  const summary = data?.summary || {
    income: 6240,
    expenses: 4130,
    savings: 1840,
    investments: 2510
  };

  return (
    <Card className="dashboard-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-700">Financial Overview</h3>
          <Select defaultValue={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                tick={{fontSize: 12}}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{fontSize: 12}}
                tickFormatter={(value) => `$${value}`}
                axisLine={false}
                tickLine={false}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip 
                formatter={(value) => [`${formatCurrency(Number(value))}`, undefined]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1}
                fill="url(#colorIncome)" 
                strokeWidth={2}
                name="Income"
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stroke="hsl(var(--destructive))" 
                fillOpacity={1}
                fill="url(#colorExpenses)" 
                strokeWidth={2}
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mt-4 text-center">
          <div>
            <p className="text-xs text-neutral-500">Income</p>
            <p className="text-sm font-semibold text-neutral-800">
              {formatCurrency(summary.income)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Expenses</p>
            <p className="text-sm font-semibold text-neutral-800">
              {formatCurrency(summary.expenses)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Savings</p>
            <p className="text-sm font-semibold text-neutral-800">
              {formatCurrency(summary.savings)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Investments</p>
            <p className="text-sm font-semibold text-neutral-800">
              {formatCurrency(summary.investments)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
