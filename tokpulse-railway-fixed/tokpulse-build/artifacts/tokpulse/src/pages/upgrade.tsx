import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useInitiatePayment, useUploadPaymentProof, useGetMySubscription } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Upload, AlertCircle, Zap, BarChart2, BrainCircuit, TrendingUp, Hash, Video } from "lucide-react";

const PREMIUM_FEATURES = [
  { icon: BarChart2, label: "Full analytics deep-dive" },
  { icon: TrendingUp, label: "Growth charts (7d / 30d / 90d / All)" },
  { icon: BrainCircuit, label: "AI content assistant (chat)" },
  { icon: Hash, label: "Viral ideas & hashtag generator" },
  { icon: Video, label: "Caption writer for every video" },
  { icon: Zap, label: "Priority support" },
];

export default function Upgrade() {
  const { data: sub } = useGetMySubscription();
  const initPayment = useInitiatePayment();
  const uploadProof = useUploadPaymentProof();
  const { toast } = useToast();

  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleInit = () => {
    initPayment.mutate({ data: { currency: "NGN" } }, {
      onSuccess: (data) => {
        setPaymentId(data.id);
      }
    });
  };

  const handleUpload = () => {
    if (!file || !paymentId) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      uploadProof.mutate({ data: { paymentId, proofImageBase64: base64, fileName: file.name } }, {
        onSuccess: () => {
          toast({ title: "Submitted!", description: "Payment proof uploaded. Admin will activate your account within 24 hours." });
          setPaymentId(null);
          setFile(null);
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const isPremium = sub?.plan === "premium" && sub?.status === "active";
  const pendingPayment = sub?.latestPayment?.status === "pending" || sub?.latestPayment?.status === "proof_submitted";

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Upgrade to Premium</h1>
          <p className="text-muted-foreground mt-1">Unlock everything TokPulse has to offer.</p>
        </div>

        {isPremium && (
          <div className="bg-primary/10 text-primary p-6 rounded-xl border border-primary/30 flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="text-lg font-bold">You're Premium! 🎉</h3>
              <p className="text-sm opacity-80">Your subscription is active{sub?.expiresAt ? ` until ${new Date(sub.expiresAt).toLocaleDateString()}` : ""}.</p>
            </div>
          </div>
        )}

        {pendingPayment && !isPremium && (
          <div className="bg-yellow-500/10 text-yellow-400 p-6 rounded-xl border border-yellow-500/30 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="text-lg font-bold">Payment Under Review</h3>
              <p className="text-sm opacity-80">Your proof is submitted and pending admin approval — usually within 24 hours.</p>
            </div>
          </div>
        )}

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-3">
          {PREMIUM_FEATURES.map(f => (
            <div key={f.label} className="flex items-center gap-2.5 bg-card border border-border rounded-xl p-3.5">
              <f.icon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm">{f.label}</span>
            </div>
          ))}
        </div>

        {!isPremium && !pendingPayment && (
          <Card className="border-primary/30 bg-card shadow-lg shadow-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="text-xl">Premium Plan</span>
                <span className="text-3xl font-extrabold text-primary">₦2,000<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <p className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Payment Instructions</p>
                <ol className="list-decimal pl-5 space-y-2 text-muted-foreground text-sm">
                  <li>Transfer <strong className="text-foreground">₦2,000</strong> to this account:</li>
                </ol>
                <div className="p-4 bg-muted rounded-xl text-sm font-mono space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank</span>
                    <span className="font-bold">OPay</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account</span>
                    <span className="font-bold tracking-widest">7077386130</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-bold">Nankong Katnap</span>
                  </div>
                </div>
                <ol className="list-decimal pl-5 space-y-2 text-muted-foreground text-sm" start={2}>
                  <li>Screenshot the successful transfer confirmation.</li>
                  <li>Click below and upload the screenshot as proof.</li>
                </ol>
              </div>

              {!paymentId ? (
                <Button
                  onClick={handleInit}
                  disabled={initPayment.isPending}
                  className="w-full text-base h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  I've made the transfer
                </Button>
              ) : (
                <div className="space-y-4 p-4 border border-primary/40 rounded-xl bg-primary/5">
                  <h4 className="font-bold text-primary flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Upload Your Proof
                  </h4>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="bg-muted border-border cursor-pointer"
                  />
                  <Button
                    onClick={handleUpload}
                    disabled={!file || uploadProof.isPending}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadProof.isPending ? "Submitting…" : "Submit Proof"}
                  </Button>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Access is activated within 24 hours after admin verifies your payment.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
