import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertAccountSchema, 
  insertTransactionSchema, 
  insertUpcomingPaymentSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix for all routes
  const apiPrefix = "/api";

  // User related routes
  app.get(`${apiPrefix}/user`, async (req, res) => {
    try {
      const user = await storage.getFirstUser();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send back the password!
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Accounts related routes
  app.get(`${apiPrefix}/accounts`, async (req, res) => {
    try {
      const accounts = await storage.getUserAccounts();
      return res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/accounts/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const account = await storage.getAccountById(parseInt(id));
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      return res.json(account);
    } catch (error) {
      console.error("Error fetching account:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Transactions related routes
  app.get(`${apiPrefix}/transactions`, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const transactions = await storage.getRecentTransactions(limit);
      return res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/accounts/:id/transactions`, async (req, res) => {
    try {
      const { id } = req.params;
      const accountId = parseInt(id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const transactions = await storage.getAccountTransactions(accountId, limit);
      return res.json(transactions);
    } catch (error) {
      console.error("Error fetching account transactions:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Transfer money between accounts
  app.post(`${apiPrefix}/transfers`, async (req, res) => {
    try {
      const schema = z.object({
        fromAccountId: z.string().min(1),
        toAccountId: z.string().min(1),
        amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0),
        notes: z.string().optional(),
      });

      const validatedData = schema.parse(req.body);
      const { fromAccountId, toAccountId, amount, notes } = validatedData;
      
      const result = await storage.transferMoney(
        parseInt(fromAccountId),
        toAccountId === "external" ? null : parseInt(toAccountId),
        parseFloat(amount),
        notes || ""
      );
      
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      
      console.error("Error processing transfer:", error);
      return res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Upcoming payments routes
  app.get(`${apiPrefix}/upcoming-payments`, async (req, res) => {
    try {
      const payments = await storage.getUpcomingPayments();
      return res.json(payments);
    } catch (error) {
      console.error("Error fetching upcoming payments:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/upcoming-payments/:id/pay`, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await storage.payBill(parseInt(id));
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error paying bill:", error);
      return res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Financial overview data for charts
  app.get(`${apiPrefix}/financial-overview`, async (req, res) => {
    try {
      const timeframe = req.query.timeframe || "30"; // Default to 30 days
      const data = await storage.getFinancialOverview(timeframe as string);
      return res.json(data);
    } catch (error) {
      console.error("Error fetching financial overview:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Spending analysis data for charts
  app.get(`${apiPrefix}/spending-analysis`, async (req, res) => {
    try {
      const timeframe = req.query.timeframe || "month"; // Default to current month
      const data = await storage.getSpendingAnalysis(timeframe as string);
      return res.json(data);
    } catch (error) {
      console.error("Error fetching spending analysis:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
