import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import TopNavbar from "@/components/dashboard/top-navbar";
import WelcomeHeader from "@/components/dashboard/welcome-header";
import AccountsOverview from "@/components/dashboard/accounts-overview";
import FinancialChart from "@/components/ui/financial-chart";
import SpendingChart from "@/components/ui/spending-chart";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import TransferMoney from "@/components/dashboard/transfer-money";
import UpcomingPayments from "@/components/dashboard/upcoming-payments";
import { useMobile } from "@/hooks/use-mobile";
import { useLocation } from "wouter";
import { logout } from "@/services/auth";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  username: string;
  password: string;
  createdAt: Date;
}

interface Account {
  id: number;
  createdAt: Date;
  userId: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  isActive: boolean;
}

interface Transaction {
  id: number;
  type: string;
  createdAt: Date;
  accountId: number;
  amount: number;
  category: string;
  description: string;
  merchant: string | null;
  transactionDate: Date;
}

interface Payment {
  id: number;
  createdAt: Date;
  userId: number;
  accountId: number;
  payee: string;
  amount: number;
  dueDate: Date;
  category: string;
  isAutomatic: boolean;
  isPaid: boolean;
}

interface FinancialData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

interface SpendingCategory {
  id: number;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  value: number;
}

interface FinancialOverview {
  financialData: FinancialData[];
  summary: {
    income: number;
    expenses: number;
    savings: number;
    investments: number;
  };
}

export default function Dashboard() {
  const isMobile = useMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: userData, isLoading: isLoadingUser } = useQuery<User | null>({
    queryKey: ['/api/user'],
  });

  const { data: accountsData, isLoading: isLoadingAccounts } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: upcomingPaymentsData, isLoading: isLoadingPayments } = useQuery<Payment[]>({
    queryKey: ['/api/upcoming-payments'],
  });

  const { data: financialData, isLoading: isLoadingFinancial } = useQuery<FinancialOverview>({
    queryKey: ['/api/financial-overview'],
  });

  const { data: spendingData, isLoading: isLoadingSpending } = useQuery<{ categories: SpendingCategory[] }>({
    queryKey: ['/api/spending-analysis'],
  });

  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile unless menu is open */}
      <div className={`${isMobile ? (mobileMenuOpen ? 'block' : 'hidden') : 'block'} md:flex md:flex-shrink-0`}>
        <Sidebar 
          user={userData} 
          onLogout={handleLogout} 
          isOpen={!isMobile || mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <TopNavbar 
          onMenuClick={toggleMobileMenu} 
          isMobile={isMobile} 
          user={userData}
        />

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-neutral-50 p-4 sm:p-6">
          <div className="flex justify-between items-center p-4 bg-white shadow">
            <WelcomeHeader user={userData} accounts={accountsData} isLoading={isLoadingUser || isLoadingAccounts} />
          </div>
          
          <AccountsOverview accounts={accountsData} isLoading={isLoadingAccounts} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FinancialChart data={financialData} isLoading={isLoadingFinancial} />
            </div>
            <div className="lg:col-span-1">
              <RecentTransactions transactions={transactionsData} isLoading={isLoadingTransactions} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <TransferMoney accounts={accountsData} isLoading={isLoadingAccounts} />
            <SpendingChart data={spendingData} isLoading={isLoadingSpending} />
            <UpcomingPayments payments={upcomingPaymentsData} isLoading={isLoadingPayments} />
          </div>
        </main>
      </div>
    </div>
  );
}
