import { db } from "@db";
import { eq, and, desc, asc, lt, lte, gte, between, sum, sql, gt } from "drizzle-orm";
import {
  users,
  accounts,
  transactions,
  upcomingPayments,
  type User,
  type Account,
  type Transaction,
  type UpcomingPayment
} from "@shared/schema";

class StorageService {
  async getFirstUser(): Promise<User | undefined> {
    const [user] = await db.select().from(users).limit(1);
    return user;
  }

  async getUserAccounts(userId?: number): Promise<Account[]> {
    if (!userId) {
      // If no userId provided, get accounts for first user
      const [firstUser] = await db.select().from(users).limit(1);
      userId = firstUser?.id;
    }

    if (!userId) return [];

    return db.select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .orderBy(desc(accounts.createdAt));
  }

  async getAccountById(accountId: number): Promise<Account | undefined> {
    const [account] = await db.select()
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .limit(1);
    
    return account;
  }

  async getRecentTransactions(limit = 10): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .orderBy(desc(transactions.transactionDate))
      .limit(limit);
  }

  async getAccountTransactions(accountId: number, limit = 10): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.transactionDate))
      .limit(limit);
  }

  async getUpcomingPayments(): Promise<UpcomingPayment[]> {
    return db.select()
      .from(upcomingPayments)
      .where(eq(upcomingPayments.isPaid, false))
      .orderBy(asc(upcomingPayments.dueDate));
  }

  /**
   * Transfer money between accounts or to external account
   */
  async transferMoney(
    fromAccountId: number,
    toAccountId: number | null, // null means external account
    amount: number,
    notes: string
  ) {
    // Start transaction
    return await db.transaction(async (tx) => {
      // Verify source account exists
      const [fromAccount] = await tx.select()
        .from(accounts)
        .where(eq(accounts.id, fromAccountId))
        .limit(1);
      
      if (!fromAccount) {
        throw new Error("Source account not found");
      }
      
      // Check if source account has sufficient funds
      if (parseFloat(fromAccount.balance.toString()) < amount) {
        throw new Error("Insufficient funds");
      }
      
      // Deduct from source account
      await tx.update(accounts)
        .set({ 
          balance: sql`${accounts.balance} - ${amount}` 
        })
        .where(eq(accounts.id, fromAccountId));
      
      // Record debit transaction
      await tx.insert(transactions).values({
        accountId: fromAccountId,
        amount: amount.toString(),
        type: "debit",
        category: "transfer",
        description: notes || "Transfer",
        merchant: toAccountId ? "Internal Transfer" : "External Transfer",
      });
      
      // If transferring to internal account, add to destination
      if (toAccountId) {
        await tx.update(accounts)
          .set({ 
            balance: sql`${accounts.balance} + ${amount}` 
          })
          .where(eq(accounts.id, toAccountId));
        
        // Record credit transaction
        await tx.insert(transactions).values({
          accountId: toAccountId,
          amount: amount.toString(),
          type: "credit",
          category: "transfer",
          description: notes || "Transfer",
          merchant: "Internal Transfer",
        });
      }
      
      return { success: true, message: "Transfer completed successfully" };
    });
  }

  /**
   * Process payment for an upcoming bill
   */
  async payBill(paymentId: number) {
    return await db.transaction(async (tx) => {
      // Find the payment
      const [payment] = await tx.select()
        .from(upcomingPayments)
        .where(eq(upcomingPayments.id, paymentId))
        .limit(1);
      
      if (!payment) {
        throw new Error("Payment not found");
      }
      
      if (payment.isPaid) {
        throw new Error("Payment already processed");
      }
      
      // Verify account exists and has sufficient funds
      const [account] = await tx.select()
        .from(accounts)
        .where(eq(accounts.id, payment.accountId))
        .limit(1);
      
      if (!account) {
        throw new Error("Account not found");
      }
      
      const paymentAmount = parseFloat(payment.amount.toString());
      
      if (parseFloat(account.balance.toString()) < paymentAmount) {
        throw new Error("Insufficient funds");
      }
      
      // Deduct from account
      await tx.update(accounts)
        .set({ 
          balance: sql`${accounts.balance} - ${paymentAmount}` 
        })
        .where(eq(accounts.id, payment.accountId));
      
      // Record transaction
      await tx.insert(transactions).values({
        accountId: payment.accountId,
        amount: paymentAmount.toString(),
        type: "debit",
        category: payment.category,
        description: `Payment to ${payment.payee}`,
        merchant: payment.payee,
      });
      
      // Mark payment as paid
      await tx.update(upcomingPayments)
        .set({ 
          isPaid: true 
        })
        .where(eq(upcomingPayments.id, paymentId));
      
      return { success: true, message: "Payment processed successfully" };
    });
  }

  /**
   * Get financial overview data for charts
   */
  async getFinancialOverview(timeframe: string) {
    // Mock data for financial overview
    const financialData = [
      { month: 'January', income: 4200, expenses: 3800 },
      { month: 'February', income: 5100, expenses: 4100 },
      { month: 'March', income: 5300, expenses: 3900 },
      { month: 'April', income: 6100, expenses: 4200 },
      { month: 'May', income: 6240, expenses: 4130 },
      { month: 'June', income: 6500, expenses: 4300 },
    ];

    // Summary values
    const summary = {
      income: 6240,
      expenses: 4130,
      savings: 1840,
      investments: 2510
    };

    return { financialData, summary };
  }

  /**
   * Get spending analysis data for charts
   */
  async getSpendingAnalysis(timeframe: string) {
    // Mock data for spending categories
    const categories = [
      { name: 'Housing', value: 35, color: 'hsl(var(--primary))' },
      { name: 'Food', value: 20, color: 'hsl(var(--secondary))' },
      { name: 'Transport', value: 15, color: 'hsl(var(--chart-4))' },
      { name: 'Entertainment', value: 10, color: 'hsl(var(--destructive))' },
      { name: 'Utilities', value: 12, color: 'hsl(var(--primary-light))' },
      { name: 'Other', value: 8, color: 'hsl(var(--muted-foreground))' },
    ];

    return { categories };
  }
}

export const storage = new StorageService();
