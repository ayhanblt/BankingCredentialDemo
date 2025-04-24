import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAccountNumber } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Account } from "@shared/schema";

interface TransferMoneyProps {
  accounts?: Account[] | null;
  isLoading?: boolean;
}

const transferSchema = z.object({
  fromAccountId: z.string().min(1, { message: "Please select source account" }),
  toAccountId: z.string().min(1, { message: "Please select destination account" }),
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be greater than 0",
  }),
  notes: z.string().optional(),
});

type TransferFormValues = z.infer<typeof transferSchema>;

export default function TransferMoney({ accounts, isLoading = false }: TransferMoneyProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccountId: "",
      toAccountId: "",
      amount: "",
      notes: "",
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (data: TransferFormValues) => {
      return await apiRequest("POST", "/api/transfers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Transfer successful",
        description: "Your money has been transferred successfully.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Transfer failed",
        description: error.message || "There was an error processing your transfer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransferFormValues) => {
    // Prevent transferring to the same account
    if (data.fromAccountId === data.toAccountId) {
      toast({
        title: "Invalid transfer",
        description: "Source and destination accounts cannot be the same.",
        variant: "destructive",
      });
      return;
    }
    
    transferMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-7 w-32 mb-4" />
          <Skeleton className="h-5 w-full mb-1" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-5 w-full mb-1" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-5 w-full mb-1" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-5 w-full mb-1" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Default accounts if none provided
  const accountsData = accounts || [];

  return (
    <Card className="dashboard-card border border-neutral-100">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold text-neutral-700 mb-4">Transfer Money</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="fromAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Account</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accountsData.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} 
                          {" "}({formatAccountNumber(account.accountNumber)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="toAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Account</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accountsData.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                          {" "}({formatAccountNumber(account.accountNumber)})
                        </SelectItem>
                      ))}
                      <SelectItem value="external">External Account</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                      $
                    </span>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="0.00"
                        className="pl-7"
                        type="number"
                        step="0.01"
                        min="0.01"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Add a note" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark"
              disabled={transferMutation.isPending}
            >
              {transferMutation.isPending ? "Processing..." : "Transfer Now"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
