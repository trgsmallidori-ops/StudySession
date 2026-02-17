export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-invert max-w-none space-y-6">
        <p className="text-foreground/80">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide when registering (email, name), usage data,
            and payment information processed securely via Stripe. We use Supabase for
            authentication and data storage.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p>
            Your data is used to provide our services, process payments, send transactional
            emails, and improve the platform. We do not sell your personal information.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Data Storage & Security</h2>
          <p>
            Data is stored in Supabase (PostgreSQL) with Row Level Security. Stripe handles
            all payment data. We implement industry-standard security measures.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
          <p>
            We use Stripe (payments), Supabase (database & auth), OpenAI (AI parsing),
            and Gmail SMTP (email). Each has their own privacy policy.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Contact</h2>
          <p>
            For privacy questions, contact us via the Contact page.
          </p>
        </section>
      </div>
    </div>
  );
}
