import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, daysUntil } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UpcomingPayment } from "@shared/schema";

interface UpcomingPaymentsProps {
  payments?: UpcomingPayment[] | null;
  isLoading?: boolean;
}

export default function UpcomingPayments({ payments, isLoading = false }: UpcomingPaymentsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const payBillMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      return await apiRequest("POST", `/api/upcoming-payments/${paymentId}/pay`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/upcoming-payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Payment successful",
        description: "Your bill has been paid successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment failed",
        description: error.message || "There was an error processing your payment.",
        variant: "destructive",
      });
    },
  });

  const handlePayNow = (paymentId: number) => {
    payBillMutation.mutate(paymentId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-3">
            {Array(3).fill(null).map((_, i) => (
              <div key={i} className="flex items-center p-2 bg-neutral-50 rounded-md">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-3 flex-1">
                  <Skeleton className="h-5 w-28 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-16 mb-1" />
                  <Skeleton className="h-4 w-14" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default payments if none provided
  const paymentsData = payments || [];

  return (
    <Card className="dashboard-card border border-neutral-100">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-700">Upcoming Payments</h3>
          <Button variant="link" className="text-primary text-sm font-medium hover:text-primary-dark">
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {paymentsData.map((payment) => (
            <div key={payment.id} className="flex items-center p-2 bg-neutral-50 rounded-md">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FBBC04] bg-opacity-10 flex items-center justify-center text-[#FBBC04]">
                <span className="material-icons text-sm">event</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-neutral-700">{payment.payee}</p>
                <p className="text-xs text-neutral-500">
                  Due in {daysUntil(payment.dueDate)} days
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-700">
                  {formatCurrency(parseFloat(payment.amount.toString()))}
                </p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-xs text-primary font-medium p-0 h-auto"
                  onClick={() => handlePayNow(payment.id)}
                  disabled={payBillMutation.isPending}
                >
                  Pay Now
                </Button>
              </div>
            </div>
          ))}
          
          {/* If no payments, show empty state */}
          {paymentsData.length === 0 && (
            <div className="text-center py-8">
              <span className="material-icons text-neutral-300 text-4xl mb-2">event_available</span>
              <p className="text-neutral-500">No upcoming payments</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
