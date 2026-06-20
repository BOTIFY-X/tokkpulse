import { useGetAdminStats, useGetAdminPendingPayments, useApprovePayment, useRejectPayment } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { setAuthTokenGetter } from "@workspace/api-client-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLocation("/admin");
    } else {
      setAuthTokenGetter(() => Promise.resolve(token));
    }
  }, [setLocation]);

  const { data: stats } = useGetAdminStats();
  const { data: pending, refetch } = useGetAdminPendingPayments();
  const approve = useApprovePayment();
  const reject = useRejectPayment();

  const handleApprove = (id: number) => {
    approve.mutate({ paymentId: id }, { onSuccess: () => refetch() });
  };
  const handleReject = (id: number) => {
    reject.mutate({ paymentId: id }, { onSuccess: () => refetch() });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Users</p><p className="text-2xl font-bold">{stats.totalUsers}</p></CardContent></Card>
            <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Premium Users</p><p className="text-2xl font-bold text-primary">{stats.premiumUsers}</p></CardContent></Card>
            <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Pending Payments</p><p className="text-2xl font-bold text-yellow-500">{stats.pendingPayments}</p></CardContent></Card>
            <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold text-green-500">₦{stats.totalRevenue.toLocaleString()}</p></CardContent></Card>
          </div>
        )}

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {pending && pending.length > 0 ? (
              <div className="space-y-4">
                {pending.map(p => (
                  <div key={p.id} className="flex flex-col md:flex-row items-center justify-between p-4 border border-border rounded-lg bg-muted/20">
                    <div>
                      <p className="font-bold">{p.userEmail}</p>
                      <p className="text-sm text-muted-foreground">Amount: {p.currency} {p.amount}</p>
                      {p.proofImageUrl && (
                        <a href={p.proofImageUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm block mt-2">
                          View Proof Screenshot
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10" onClick={() => handleApprove(p.id)} disabled={approve.isPending}>Approve</Button>
                      <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => handleReject(p.id)} disabled={reject.isPending}>Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No pending payments.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}