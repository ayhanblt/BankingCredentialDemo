import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import type { User, Account } from "@shared/schema";

interface WelcomeHeaderProps {
  user?: User | null;
  accounts?: Account[] | null;
  isLoading?: boolean;
}

export default function WelcomeHeader({ user, accounts, isLoading = false }: WelcomeHeaderProps) {
  if (isLoading) {
    return (
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-80 mb-4" />
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-5 w-36" />
              </div>
              <Skeleton className="h-10 w-32 mt-4 sm:mt-0" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate total balance from accounts
  const totalBalance = accounts?.reduce((total, account) => {
    return total + parseFloat(account.balance.toString());
  }, 0) || 0;

  // Get first name
  const firstName = user?.name?.split(' ')[0] || "User";

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-neutral-700">Welcome back, {firstName}</h1>
      <p className="text-neutral-500 mt-1">Here's your financial overview for today.</p>
      <div className="mt-4 bg-white rounded-md shadow-sm p-4 border border-neutral-100">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">Current balance</p>
            <p className="text-2xl font-semibold text-neutral-800">
              {formatCurrency(totalBalance)}
            </p>
            <p className="text-sm text-secondary flex items-center mt-1">
              <span className="material-icons text-sm mr-1">arrow_upward</span>
              +2.4% since last month
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center">
              <span className="material-icons text-sm mr-1">add</span>
              New Transfer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
