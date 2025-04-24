import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("🌱 Seeding database...");
    
    // Create demo user if none exists
    const existingUsers = await db.select().from(schema.users);
    
    if (existingUsers.length === 0) {
      console.log("Creating demo user...");
      const [user] = await db.insert(schema.users).values({
        username: "alex_johnson",
        password: "password123", // In a real app, this would be hashed
        name: "Alex Johnson",
        email: "alex.j@example.com",
      }).returning();
      
      // Create accounts
      console.log("Creating bank accounts...");
      const [checkingAccount] = await db.insert(schema.accounts).values({
        userId: user.id,
        accountNumber: "1234829",
        accountType: "checking",
        balance: "12458.32",
        currency: "USD",
      }).returning();
      
      const [savingsAccount] = await db.insert(schema.accounts).values({
        userId: user.id,
        accountNumber: "7897635",
        accountType: "savings",
        balance: "8942.51",
        currency: "USD",
      }).returning();
      
      const [investmentAccount] = await db.insert(schema.accounts).values({
        userId: user.id,
        accountNumber: "4569214",
        accountType: "investment",
        balance: "3161.71",
        currency: "USD",
      }).returning();
      
      // Create transactions
      console.log("Creating transactions...");
      const transactions = [
        {
          accountId: checkingAccount.id,
          amount: "34.21",
          type: "debit",
          category: "shopping",
          description: "Online purchase",
          merchant: "Amazon",
          transactionDate: new Date("2023-09-28"),
        },
        {
          accountId: checkingAccount.id,
          amount: "2750.00",
          type: "credit",
          category: "salary",
          description: "Monthly salary deposit",
          merchant: "Salary Deposit",
          transactionDate: new Date("2023-09-25"),
        },
        {
          accountId: checkingAccount.id,
          amount: "5.40",
          type: "debit",
          category: "food",
          description: "Coffee",
          merchant: "Starbucks",
          transactionDate: new Date("2023-09-24"),
        },
        {
          accountId: checkingAccount.id,
          amount: "1200.00",
          type: "debit",
          category: "housing",
          description: "Monthly rent payment",
          merchant: "Rent Payment",
          transactionDate: new Date("2023-09-22"),
        },
        {
          accountId: checkingAccount.id,
          amount: "42.15",
          type: "debit",
          category: "gas",
          description: "Fuel",
          merchant: "Shell Gas",
          transactionDate: new Date("2023-09-20"),
        },
        {
          accountId: savingsAccount.id,
          amount: "12.38",
          type: "credit",
          category: "interest",
          description: "Monthly interest payment",
          merchant: "Interest Payment",
          transactionDate: new Date("2023-09-18"),
        },
      ];
      
      for (const transaction of transactions) {
        await db.insert(schema.transactions).values(transaction);
      }
      
      // Create upcoming payments
      console.log("Creating upcoming payments...");
      const upcomingPaymentsData = [
        {
          userId: user.id,
          accountId: checkingAccount.id,
          payee: "Electricity Bill",
          amount: "85.20",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          category: "utilities",
        },
        {
          userId: user.id,
          accountId: checkingAccount.id,
          payee: "Internet Bill",
          amount: "59.99",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          category: "utilities",
        },
        {
          userId: user.id,
          accountId: checkingAccount.id,
          payee: "Credit Card",
          amount: "420.00",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          category: "credit card",
        },
      ];
      
      for (const payment of upcomingPaymentsData) {
        await db.insert(schema.upcomingPayments).values(payment);
      }
      
      console.log("Seed completed successfully!");
    } else {
      console.log("Database already has users. Skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
