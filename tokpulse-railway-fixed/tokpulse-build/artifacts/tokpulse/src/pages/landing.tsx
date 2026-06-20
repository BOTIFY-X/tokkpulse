import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Zap, BrainCircuit, Check, Users, TrendingUp, Star } from "lucide-react";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Deep Analytics",
    desc: "Track engagement rates, growth velocity, and uncover exactly what makes your content pop. Charts for 7, 30, and 90 days.",
  },
  {
    icon: Zap,
    title: "Real-Time Pulse",
    desc: "Live data that pulses with energy. Don't wait for daily reports — see your performance the moment it happens.",
  },
  {
    icon: BrainCircuit,
    title: "AI Assistant",
    desc: "Generate high-converting captions, trending hashtags, and fresh viral content ideas in seconds.",
  },
  {
    icon: TrendingUp,
    title: "Growth Tracking",
    desc: "Watch your follower count climb with beautiful charts. Spot your breakout moments and replicate them.",
  },
];

const FREE_ITEMS = [
  "TikTok account connection",
  "Basic dashboard overview",
  "View top 3 videos",
];

const PREMIUM_ITEMS = [
  "Full analytics deep-dive",
  "Growth charts (7d / 30d / 90d)",
  "AI content assistant (chat)",
  "Viral ideas & hashtag generator",
  "Caption writer",
  "Top video performance table",
  "Priority support",
];

const TESTIMONIALS = [
  {
    name: "Chiamaka N.",
    handle: "@chiamaka_creates",
    quote: "TokPulse helped me 10x my engagement in 2 weeks. The AI captions are 🔥",
    stars: 5,
  },
  {
    name: "David O.",
    handle: "@davidovibes",
    quote: "Finally an analytics tool built for us. The growth charts showed me exactly when to post.",
    stars: 5,
  },
  {
    name: "Sade M.",
    handle: "@sade_style",
    quote: "The AI assistant literally writes better captions than me lol. Worth every naira.",
    stars: 5,
  },
];

export default function Landing() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <img src={`${basePath}/logo.png`} alt="TokPulse" className="h-8 w-8" />
          <span className="text-xl font-bold text-primary">TokPulse</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors cursor-pointer">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors cursor-pointer">Pricing</a>
          <Link href="/terms"><span className="hover:text-foreground transition-colors cursor-pointer">Terms</span></Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer px-3 py-2">Sign In</span>
          </Link>
          <Link href="/sign-up">
            <span className="text-sm font-bold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_16px_rgba(0,240,128,0.3)]">
              Get Started Free
            </span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-24 pb-20 md:pt-32 md:pb-28 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,240,128,0.12),transparent)]" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 rounded-full px-4 py-1.5 text-primary text-sm font-semibold mb-6"
        >
          <Users className="w-4 h-4" /> Built for Nigerian TikTok creators
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1]"
        >
          Your TikTok Command Center.{" "}
          <span className="text-primary">Supercharged.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-xl text-muted-foreground max-w-2xl leading-relaxed"
        >
          Track every like, comment, and share. Uncover viral trends. Generate AI captions that convert. Built for creators who mean business — starting at ₦2,000/month.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link href="/sign-up">
            <span className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_24px_rgba(0,240,128,0.35)] hover:shadow-[0_0_36px_rgba(0,240,128,0.5)]">
              Start for Free <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
          <a href="#pricing">
            <span className="flex items-center justify-center px-8 py-4 rounded-xl text-lg font-medium border border-border bg-card hover:bg-muted/60 transition-colors cursor-pointer">
              View Pricing
            </span>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <div className="flex -space-x-2">
            {["#00f080", "#00c8ff", "#ff5480", "#ffe040"].map((c, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-background" style={{ backgroundColor: c, opacity: 0.85 }} />
            ))}
          </div>
          <span>Trusted by 200+ Nigerian creators</span>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Everything you need to go viral</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">One platform for analytics, AI content, and growth strategy.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-[0_0_24px_rgba(0,240,128,0.06)] transition-all"
            >
              <f.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24 bg-card/30 border-y border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Simple, honest pricing</h2>
            <p className="text-muted-foreground text-lg">No hidden fees. No credit card tricks. Just ₦2,000/month.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="rounded-2xl border border-border bg-background p-8 flex flex-col">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Free</p>
              <div className="text-5xl font-extrabold mb-1">₦0</div>
              <p className="text-sm text-muted-foreground mb-8">Forever free. No card needed.</p>
              <ul className="space-y-3 flex-1 mb-8">
                {FREE_ITEMS.map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/sign-up">
                <span className="flex items-center justify-center w-full py-3 rounded-lg border border-border font-semibold text-sm hover:bg-muted/50 transition-colors cursor-pointer">
                  Get Started Free
                </span>
              </Link>
            </div>

            {/* Premium */}
            <div className="rounded-2xl border-2 border-primary bg-background p-8 flex flex-col relative shadow-[0_0_40px_rgba(0,240,128,0.1)]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">Best Value</span>
              </div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Premium</p>
              <div className="text-5xl font-extrabold mb-1">₦2,000</div>
              <p className="text-sm text-muted-foreground mb-8">Per month · ~$1.30 USD · OPay payment</p>
              <ul className="space-y-3 flex-1 mb-8">
                {PREMIUM_ITEMS.map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/sign-up">
                <span className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all cursor-pointer">
                  Get Premium <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Creators love TokPulse</h2>
          <p className="text-muted-foreground text-lg">Join hundreds of Nigerian creators already growing with us.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.handle}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground mb-4 leading-relaxed">"{t.quote}"</p>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-muted-foreground text-sm">{t.handle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-card/30 border-t border-border/50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold mb-4"
          >
            Ready to grow your TikTok? 🚀
          </motion.h2>
          <p className="text-muted-foreground text-lg mb-8">Join TokPulse free today. No credit card required.</p>
          <Link href="/sign-up">
            <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_24px_rgba(0,240,128,0.35)]">
              Create Free Account <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-border/50 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={`${basePath}/logo.png`} alt="TokPulse" className="h-6 w-6" />
            <span>© 2025 TokPulse. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/terms"><span className="hover:text-primary cursor-pointer transition-colors">Terms</span></Link>
            <Link href="/privacy"><span className="hover:text-primary cursor-pointer transition-colors">Privacy</span></Link>
            <a href="mailto:katsonofficial001@gmail.com" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
