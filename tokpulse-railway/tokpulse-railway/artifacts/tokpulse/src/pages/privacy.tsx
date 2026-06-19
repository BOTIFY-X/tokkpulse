import { Link } from "wouter";

const LAST_UPDATED = "June 19, 2025";

export default function Privacy() {
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
        <Link href="/terms">
          <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">Terms of Service →</span>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_ul]:text-muted-foreground [&_ul]:space-y-1.5 [&_li]:leading-relaxed">

          <section>
            <p className="text-lg text-foreground">
              TokPulse ("we", "us", "our") respects your privacy. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data when you use our platform at <strong className="text-primary">tokpulse.app</strong>.
            </p>
          </section>

          <section>
            <h2>1. Information We Collect</h2>
            <p>We collect the following categories of information:</p>
            <ul className="list-disc pl-6 mt-3">
              <li><strong className="text-foreground">Account Information:</strong> Your email address and name provided during registration via Clerk authentication.</li>
              <li><strong className="text-foreground">TikTok Public Profile Data:</strong> When you connect your TikTok account by providing your profile URL, we collect publicly available data including your display name, username, follower count, following count, video count, bio, and profile picture from your public TikTok page.</li>
              <li><strong className="text-foreground">TikTok Video Analytics:</strong> Publicly visible performance data for your videos — views, likes, comments, shares, thumbnails, and video titles — collected from your public profile.</li>
              <li><strong className="text-foreground">Growth Snapshots:</strong> We store daily snapshots of your follower and engagement counts to power your growth charts over time.</li>
              <li><strong className="text-foreground">Payment Information:</strong> When you subscribe to Premium, we store your payment proof image (screenshot) and transaction status. We do not store bank card numbers or any banking credentials.</li>
              <li><strong className="text-foreground">Push Notification Tokens:</strong> If you enable browser push notifications, we store your push subscription token to deliver alerts.</li>
              <li><strong className="text-foreground">Usage Data:</strong> Standard server logs (IP address, browser type, pages visited) retained for security and debugging purposes.</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Collect TikTok Data</h2>
            <p>TokPulse collects your TikTok analytics by reading <strong className="text-foreground">publicly available data</strong> from your TikTok profile page — the same information any visitor to your profile can see. We do not use TikTok's official API, we do not request your TikTok password or login, and we do not access private or restricted content. Only public accounts are supported. You initiate the data collection by providing your profile URL and can stop it at any time by disconnecting your account in Settings.</p>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 mt-3">
              <li>To provide analytics dashboards and growth charts for your TikTok account</li>
              <li>To power the AI content assistant with context about your niche</li>
              <li>To manage your subscription and verify payment</li>
              <li>To send push notifications you have opted into</li>
              <li>To improve the platform and fix bugs</li>
              <li>To communicate important service updates</li>
            </ul>
            <p className="mt-4">We do not sell your data to third parties. We do not use your data for advertising purposes.</p>
          </section>

          <section>
            <h2>4. Data Sharing</h2>
            <p>We share data only with the following service providers, strictly to operate TokPulse:</p>
            <ul className="list-disc pl-6 mt-3">
              <li><strong className="text-foreground">Clerk</strong> — User authentication and account management</li>
              <li><strong className="text-foreground">OpenAI</strong> — AI content generation (your niche and prompts are sent; no personally identifiable data is shared)</li>
              <li><strong className="text-foreground">Railway / Hosting Provider</strong> — Server infrastructure and database hosting</li>
            </ul>
            <p className="mt-4">We may disclose your data if required by law, court order, or to protect the rights and safety of TokPulse and its users.</p>
          </section>

          <section>
            <h2>5. Data Retention</h2>
            <p>We retain your data for as long as your account is active. If you delete your account or request data deletion, we will remove your personal data within 30 days. Growth snapshot history and analytics data are deleted alongside your account. Certain anonymised, aggregated data may be retained indefinitely for platform analytics.</p>
          </section>

          <section>
            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-3">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and all associated data</li>
              <li>Withdraw consent for push notifications at any time in your browser settings</li>
              <li>Disconnect your TikTok profile at any time from the Settings page</li>
            </ul>
            <p className="mt-4">To exercise any of these rights, contact us at <a href="mailto:katsonofficial001@gmail.com" className="text-primary hover:underline">katsonofficial001@gmail.com</a>.</p>
          </section>

          <section>
            <h2>7. Security</h2>
            <p>We take reasonable technical and organisational measures to protect your data, including encrypted data transmission (HTTPS), secure database hosting, and access controls. However, no internet service is 100% secure, and we cannot guarantee absolute security of your data.</p>
          </section>

          <section>
            <h2>8. Children's Privacy</h2>
            <p>TokPulse is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has created an account, please contact us and we will delete the account immediately.</p>
          </section>

          <section>
            <h2>9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top and notify active users via email or in-app notification for material changes. Continued use of TokPulse after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2>10. Contact Us</h2>
            <p>For any privacy-related questions, requests, or concerns, please reach out to us at <a href="mailto:katsonofficial001@gmail.com" className="text-primary hover:underline">katsonofficial001@gmail.com</a>. We aim to respond within 5 business days.</p>
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
