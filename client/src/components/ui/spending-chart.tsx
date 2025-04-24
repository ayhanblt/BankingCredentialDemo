import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface SpendingCategory {
  name: string;
  value: number;
  color: string;
}

interface SpendingChartProps {
  data?: {
    categories: SpendingCategory[];
  } | null;
  isLoading?: boolean;
}

export default function SpendingChart({ data, isLoading = false }: SpendingChartProps) {
  const [timeframe, setTimeframe] = useState("month");

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-9 w-36" />
          </div>
          <Skeleton className="h-[200px] w-full rounded-full" />
        </CardContent>
      </Card>
    );
  }

  // Default data if none provided
  const spendingData = data?.categories || [
    { name: "Housing", value: 35, color: "hsl(var(--primary))" },
    { name: "Food", value: 20, color: "hsl(var(--secondary))" },
    { name: "Transport", value: 15, color: "hsl(var(--chart-4))" },
    { name: "Entertainment", value: 10, color: "hsl(var(--destructive))" },
    { name: "Utilities", value: 12, color: "hsl(var(--primary-light))" },
    { name: "Other", value: 8, color: "hsl(var(--muted-foreground))" },
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-neutral-200 shadow-sm rounded-md">
          <p className="text-sm font-medium">{`${data.name}: ${data.value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="dashboard-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-700">Spending Analysis</h3>
          <Select defaultValue={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="This Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={spendingData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                innerRadius={40}
                dataKey="value"
              >
                {spendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
