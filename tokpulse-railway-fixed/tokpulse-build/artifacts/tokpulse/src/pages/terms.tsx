import { Link } from "wouter";

const LAST_UPDATED = "June 19, 2025";

export default function Terms() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-5 border-b border-border/50 max-w-4xl mx-auto">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src={`${basePath}/logo.png`} alt="TokPulse" className="h-8 w-8" />
            <span className="text-xl font-bold text-primary">TokPulse</span>
          </div>
        </Link>
        <Link href="/privacy">
          <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">Privacy Policy →</span>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold mb-3">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_ul]:text-muted-foreground [&_ul]:space-y-1.5 [&_li]:leading-relaxed">

          <section>
            <p className="text-lg text-foreground">
              Welcome to TokPulse. By accessing or using our platform at <strong className="text-primary">tokpulse.app</strong>, you agree to be bound by these Terms of Service. Please read them carefully before using our services.
            </p>
          </section>

          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By creating an account or using TokPulse in any way, you confirm that you are at least 13 years of age (or the minimum age required in your jurisdiction), have read and understood these Terms, and agree to be legally bound by them. If you are using TokPulse on behalf of an organisation, you represent that you have the authority to bind that organisation.</p>
          </section>

          <section>
            <h2>2. Description of Services</h2>
            <p>TokPulse is a TikTok analytics and AI content assistant platform designed to help creators grow their audience, understand performance data, and generate content ideas. Our services include:</p>
            <ul className="list-disc pl-6 mt-3">
              <li>TikTok public profile analytics (followers, views, likes, comments, shares, growth)</li>
              <li>AI-powered content generation (captions, hashtags, viral ideas, 7-day content plans)</li>
              <li>AI chat assistant for creator guidance and strategy</li>
              <li>Premium subscription management via manual bank transfer</li>
              <li>Push notification alerts for milestone tracking</li>
            </ul>
          </section>

          <section>
            <h2>3. Account Registration</h2>
            <p>To access TokPulse, you must create an account using our authentication provider (Clerk). You agree to provide accurate, current, and complete information during registration and to update this information to keep it accurate. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorised access or security breach.</p>
          </section>

          <section>
            <h2>4. Subscription Plans & Payments</h2>
            <p>TokPulse offers two tiers:</p>
            <ul className="list-disc pl-6 mt-3">
              <li><strong className="text-foreground">Free Plan:</strong> Limited features available at no cost. Includes account connection and basic dashboard overview.</li>
              <li><strong className="text-foreground">Premium Plan:</strong> ₦2,000/month. Full analytics, AI assistant, growth charts, and all creator tools.</li>
            </ul>
            <p className="mt-4">Premium subscriptions are processed manually via bank transfer. You transfer ₦2,000 to OPay account <strong className="text-foreground">7077386130</strong> (Nankong Katnap), take a screenshot as proof, and upload it in the app. Access is activated within 24 hours of admin verification. We do not process refunds once premium access has been granted and activated. If payment proof is rejected as invalid, you may resubmit correct proof.</p>
          </section>

          <section>
            <h2>5. TikTok Data Collection</h2>
            <p>TokPulse collects your TikTok analytics by scraping publicly available data from your public TikTok profile page. This means:</p>
            <ul className="list-disc pl-6 mt-3">
              <li>Only <strong className="text-foreground">public</strong> TikTok accounts are supported. Private accounts cannot be tracked.</li>
              <li>We do not access your TikTok password, private messages, or any non-public data.</li>
              <li>You connect your account by providing your TikTok profile URL — no TikTok login is required.</li>
              <li>Data is refreshed when you click "Sync Stats" in the dashboard.</li>
              <li>You may disconnect your TikTok account at any time from the Settings page, which removes all collected data.</li>
            </ul>
            <p className="mt-4">By connecting your TikTok profile, you confirm that the profile belongs to you and that you consent to TokPulse collecting and storing its publicly available performance data.</p>
          </section>

          <section>
            <h2>6. AI-Generated Content</h2>
            <p>Our AI assistant (powered by OpenAI) generates captions, hashtags, and content ideas for informational and creative purposes only. TokPulse does not guarantee the accuracy, originality, or effectiveness of AI-generated content. You are solely responsible for reviewing, editing, and publishing any content you derive from our AI tools. You retain full ownership of any content you create using TokPulse.</p>
          </section>

          <section>
            <h2>7. Prohibited Uses</h2>
            <p>You agree not to use TokPulse to:</p>
            <ul className="list-disc pl-6 mt-3">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe the intellectual property rights of others</li>
              <li>Attempt to reverse-engineer, hack, or disrupt our services</li>
              <li>Create fake payment proofs or fraudulently claim premium access</li>
              <li>Connect a TikTok profile that does not belong to you</li>
              <li>Use automated bots to excessively query our API</li>
              <li>Harass, abuse, or harm other users or our team</li>
              <li>Violate TikTok's own Terms of Service</li>
            </ul>
          </section>

          <section>
            <h2>8. Data & Privacy</h2>
            <p>Your use of TokPulse is also governed by our <Link href="/privacy"><span className="text-primary hover:underline cursor-pointer">Privacy Policy</span></Link>, which is incorporated into these Terms by reference. We take reasonable measures to protect your data, but no internet transmission is 100% secure.</p>
          </section>

          <section>
            <h2>9. Intellectual Property</h2>
            <p>TokPulse, its logo, name, and all platform features are owned by TokPulse and protected by intellectual property laws. You may not copy, reproduce, or distribute any part of our platform without prior written consent. Your TikTok data remains the property of TikTok and you as the creator.</p>
          </section>

          <section>
            <h2>10. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at any time if you violate these Terms or engage in activity that we determine, in our sole discretion, to be harmful to our platform, users, or business. You may also delete your account at any time. Upon termination, your data will be deleted within 30 days.</p>
          </section>

          <section>
            <h2>11. Disclaimers & Limitation of Liability</h2>
            <p>TokPulse is provided "as is" without warranties of any kind. We do not guarantee that data scraped from TikTok will be 100% accurate or complete at all times, as TikTok may change its platform structure. We do not guarantee that the services will be uninterrupted or error-free, or that AI-generated content will meet your expectations. To the maximum extent permitted by law, TokPulse shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.</p>
          </section>

          <section>
            <h2>12. Changes to Terms</h2>
            <p>We may update these Terms from time to time. We will notify users of significant changes via in-app notification or email. Continued use of TokPulse after changes take effect constitutes your acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2>13. Governing Law</h2>
            <p>These Terms are governed by the laws of Nigeria. Any disputes shall be resolved through good-faith negotiation, and if unresolved, through the courts of Nigeria.</p>
          </section>

          <section>
            <h2>14. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:katsonofficial001@gmail.com" className="text-primary hover:underline">katsonofficial001@gmail.com</a>.</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/50 px-6 py-8 text-center text-sm text-muted-foreground">
        <p>© 2025 TokPulse. All rights reserved. ·{" "}
          <Link href="/terms"><span className="text-primary hover:underline cursor-pointer">Terms</span></Link>
          {" · "}
          <Link href="/privacy"><span className="text-primary hover:underline cursor-pointer">Privacy</span></Link>
        </p>
      </footer>
    </div>
  );
}
