import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency with proper symbol and locale
export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date to a readable format
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Format account number to show only last 4 digits
export function formatAccountNumber(accountNumber: string): string {
  if (!accountNumber) return "";
  return `**** ${accountNumber.slice(-4)}`;
}

// Calculate days until date
export function daysUntil(dateString: string | Date): number {
  const targetDate = new Date(dateString);
  const today = new Date();
  
  // Reset time part for accurate day calculation
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Get transaction icon based on category
export function getTransactionIcon(category: string): string {
  switch (category.toLowerCase()) {
    case 'food':
    case 'restaurant':
      return 'fastfood';
    case 'shopping':
      return 'shopping_cart';
    case 'transport':
    case 'travel':
      return 'directions_car';
    case 'housing':
    case 'rent':
      return 'home';
    case 'utilities':
      return 'power';
    case 'healthcare':
      return 'local_hospital';
    case 'education':
      return 'school';
    case 'entertainment':
      return 'movie';
    case 'salary':
    case 'income':
      return 'payments';
    case 'interest':
      return 'account_balance';
    case 'transfer':
      return 'swap_horiz';
    case 'gas':
      return 'local_gas_station';
    default:
      return 'attach_money';
  }
}
