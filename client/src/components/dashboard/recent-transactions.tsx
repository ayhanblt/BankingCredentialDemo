import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getTransactionIcon } from "@/lib/utils";
import type { Transaction } from "@shared/schema";

interface RecentTransactionsProps {
  transactions?: Transaction[] | null;
  isLoading?: boolean;
}

export default function RecentTransactions({ transactions, isLoading = false }: RecentTransactionsProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-3">
            {Array(5).fill(null).map((_, i) => (
              <div key={i} className="flex items-center p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-3 flex-1">
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-16 mb-1" />
                  <Skeleton className="h-4 w-10" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default transactions if none provided
  const transactionsData = transactions || [];

  const getTransactionColor = (type: string, category: string) => {
    if (type === 'credit') {
      return 'bg-secondary bg-opacity-10 text-secondary';
    }
    return 'bg-primary-light bg-opacity-10 text-primary';
  }

  const getAmountDisplay = (amount: number | string, type: string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return (
      <p className={`text-sm font-medium ${type === 'credit' ? 'text-secondary' : 'text-destructive'}`}>
        {type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(numAmount))}
      </p>
    );
  }

  return (
    <Card className="dashboard-card border border-neutral-100 h-full">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-700">Recent Transactions</h3>
          <Button variant="link" className="text-primary text-sm font-medium hover:text-primary-dark">
            See All
          </Button>
        </div>
        <div className="overflow-y-auto custom-scrollbar h-[350px]">
          <div className="space-y-3">
            {transactionsData.map((transaction) => (
              <div key={transaction.id} className="flex items-center p-2 hover:bg-neutral-50 rounded-md transition duration-150 ease-in-out">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getTransactionColor(transaction.type, transaction.category)} flex items-center justify-center`}>
                  <span className="material-icons text-sm">{getTransactionIcon(transaction.category)}</span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-neutral-700">{transaction.merchant || transaction.description}</p>
                  <p className="text-xs text-neutral-500">{formatDate(transaction.transactionDate)}</p>
                </div>
                <div className="text-right">
                  {getAmountDisplay(transaction.amount, transaction.type)}
                  <p className="text-xs text-neutral-500">{transaction.type === 'credit' ? 'Credit' : 'Debit'}</p>
                </div>
              </div>
            ))}
            
            {/* If no transactions, show empty state */}
            {transactionsData.length === 0 && (
              <div className="text-center py-8">
                <span className="material-icons text-neutral-300 text-4xl mb-2">receipt_long</span>
                <p className="text-neutral-500">No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
