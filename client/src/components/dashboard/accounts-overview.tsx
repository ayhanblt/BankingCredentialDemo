import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { formatCurrency, formatAccountNumber } from "@/lib/utils";
import type { Account } from "@shared/schema";

interface AccountsOverviewProps {
  accounts?: Account[] | null;
  isLoading?: boolean;
}

export default function AccountsOverview({ accounts, isLoading = false }: AccountsOverviewProps) {
  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(null).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
                <div className="mb-3">
                  <Skeleton className="h-7 w-28 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="h-5 w-14" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Default accounts if none provided
  const accountsData = accounts || [];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-700">Your Accounts</h2>
        <Button variant="link" className="text-primary text-sm font-medium hover:text-primary-dark">
          View All
          <span className="material-icons text-sm ml-1">arrow_forward</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accountsData.map((account) => (
          <Card key={account.id} className="dashboard-card border border-neutral-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-600">
                  {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <MoreHorizontal className="h-5 w-5 text-neutral-400" />
                </Button>
              </div>
              <div className="mb-3">
                <p className="text-xl font-semibold text-neutral-800">
                  {formatCurrency(parseFloat(account.balance.toString()))}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatAccountNumber(account.accountNumber)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button variant="link" className="text-primary hover:text-primary-dark text-sm font-medium p-0 h-auto">
                    Details
                  </Button>
                  <Button variant="link" className="text-primary hover:text-primary-dark text-sm font-medium p-0 h-auto">
                    Transfer
                  </Button>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-primary-light bg-opacity-10 text-primary border-0">
                    {account.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
