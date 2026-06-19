import { Link } from "wouter";
import { motion } from "framer-motion";
import { Check, X, Zap, ArrowRight } from "lucide-react";

const FREE_FEATURES = [
  { label: "TikTok account connection", included: true },
  { label: "Basic dashboard overview", included: true },
  { label: "View top 3 videos", included: true },
  { label: "Community access", included: true },
  { label: "Deep analytics & charts", included: false },
  { label: "AI content assistant", included: false },
  { label: "Growth tracking (7d/30d/90d)", included: false },
  { label: "Viral ideas generator", included: false },
  { label: "Caption & hashtag AI", included: false },
];

const PREMIUM_FEATURES = [
  { label: "Everything in Free", included: true },
  { label: "Full analytics deep-dive", included: true },
  { label: "Growth charts (7d / 30d / 90d)", included: true },
  { label: "AI content assistant (chat)", included: true },
  { label: "Viral ideas generator", included: true },
  { label: "Caption & hashtag AI", included: true },
  { label: "Top videos performance table", included: true },
  { label: "Priority support", included: true },
  { label: "New features first", included: true },
];

export default function Plans() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-border/50 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <img src={`${basePath}/logo.png`} alt="TokPulse" className="h-8 w-8" />
          <span className="text-xl font-bold text-primary">TokPulse</span>
        </div>
        <Link href="/dashboard">
          <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            Skip for now →
          </span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-primary text-sm font-medium mb-4">
            <Zap className="w-4 h-4" /> Choose your plan
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Start free, go viral faster.
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl">
            TokPulse gives every creator the tools to understand their audience and grow. Upgrade anytime to unlock the full power.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative flex flex-col rounded-2xl border border-border bg-card p-8"
          >
            <div className="mb-6">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">Free</p>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-extrabold">₦0</span>
                <span className="text-muted-foreground mb-1">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">No credit card needed. Get started today.</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f.label} className="flex items-center gap-3">
                  {f.included ? (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className={f.included ? "text-foreground text-sm" : "text-muted-foreground/60 text-sm line-through"}>
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>

            <Link href="/dashboard">
              <span className="flex items-center justify-center w-full py-3 rounded-lg border border-border bg-muted hover:bg-muted/80 font-semibold transition-colors cursor-pointer text-sm">
                Continue with Free
              </span>
            </Link>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="relative flex flex-col rounded-2xl border-2 border-primary bg-card p-8 shadow-[0_0_40px_rgba(0,240,128,0.12)]"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </span>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Premium</p>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-extrabold">₦1,500</span>
                <span className="text-muted-foreground mb-1">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">~$1 USD/month. Manual OPay payment.</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f.label} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground text-sm">{f.label}</span>
                </li>
              ))}
            </ul>

            <Link href="/upgrade">
              <span className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors cursor-pointer shadow-[0_0_20px_rgba(0,240,128,0.25)] hover:shadow-[0_0_30px_rgba(0,240,128,0.4)] text-sm">
                Get Premium <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Payment note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-sm text-muted-foreground text-center max-w-md"
        >
          Premium is activated manually after you transfer ₦1,500 to OPay (7077386130 — Nankong Katnap) and upload your payment proof. Approved within 24 hours.
        </motion.p>
      </main>

      <footer className="px-6 py-6 border-t border-border/50 text-center text-sm text-muted-foreground">
        <p>
          By continuing, you agree to our{" "}
          <Link href="/terms"><span className="text-primary hover:underline cursor-pointer">Terms of Service</span></Link>
          {" "}and{" "}
          <Link href="/privacy"><span className="text-primary hover:underline cursor-pointer">Privacy Policy</span></Link>.
        </p>
      </footer>
    </div>
  );
}
