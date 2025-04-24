import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Accounts table - represents different bank accounts of a user
export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  accountNumber: text("account_number").notNull().unique(),
  accountType: text("account_type").notNull(), // checking, savings, investment
  balance: real("balance").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Transactions table - represents money movements
export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(), // debit, credit
  category: text("category").notNull(), // food, transport, salary, etc.
  description: text("description").notNull(),
  merchant: text("merchant"),
  transactionDate: integer("transaction_date", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Upcoming payments/bills
export const upcomingPayments = sqliteTable("upcoming_payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  payee: text("payee").notNull(),
  amount: real("amount").notNull(),
  dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
  category: text("category").notNull(), // utilities, internet, credit card, etc.
  isAutomatic: integer("is_automatic", { mode: "boolean" }).notNull().default(false),
  isPaid: integer("is_paid", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  upcomingPayments: many(upcomingPayments),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
  transactions: many(transactions),
  upcomingPayments: many(upcomingPayments),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
}));

export const upcomingPaymentsRelations = relations(upcomingPayments, ({ one }) => ({
  user: one(users, { fields: [upcomingPayments.userId], references: [users.id] }),
  account: one(accounts, { fields: [upcomingPayments.accountId], references: [accounts.id] }),
}));

// Validation schemas
export const insertUserSchema = createInsertSchema(users, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
});

export const insertAccountSchema = createInsertSchema(accounts, {
  accountNumber: (schema) => schema.min(4, "Account number must be at least 4 characters"),
  accountType: (schema) => schema.refine(val => ['checking', 'savings', 'investment'].includes(val), {
    message: "Account type must be 'checking', 'savings', or 'investment'"
  }),
});

export const insertTransactionSchema = createInsertSchema(transactions, {
  type: (schema) => schema.refine(val => ['debit', 'credit'].includes(val), {
    message: "Transaction type must be 'debit' or 'credit'"
  }),
  description: (schema) => schema.min(2, "Description must be at least 2 characters"),
});

export const insertUpcomingPaymentSchema = createInsertSchema(upcomingPayments, {
  payee: (schema) => schema.min(2, "Payee must be at least 2 characters"),
  amount: (schema) => schema.refine(val => val > 0, {
    message: "Amount must be greater than 0"
  }),
});

// Type exports
export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type UpcomingPayment = typeof upcomingPayments.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertUpcomingPayment = z.infer<typeof insertUpcomingPaymentSchema>;
