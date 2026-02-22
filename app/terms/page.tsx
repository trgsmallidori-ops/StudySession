export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
      <div className="prose prose-invert max-w-none space-y-6">
        <p className="text-foreground/80">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance</h2>
          <p>
            By using StudySession, you agree to these terms. If you disagree, do not use the service.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
          <p>
            StudySession provides a gamified learning platform with calendar features, courses,
            and monthly competitions. Features may vary by subscription tier.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. User Conduct</h2>
          <p>
            You agree not to abuse the platform, cheat in competitions, share accounts,
            or violate any applicable laws. We reserve the right to terminate accounts.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Subscriptions</h2>
          <p>
            Subscriptions are billed per the selected plan. Cancellation follows our
            Refund Policy. We may change pricing with notice.
          </p>
          <p>
            You are never required to spend money beyond your chosen subscription to use any feature.
            The Ultimate subscription is not solely for races—it unlocks the site&apos;s full potential,
            including AI features, all courses, the calendar, and monthly competitions.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Monthly Competitions</h2>
          <p>
            The Monthly Productivity Challenge is entirely optional. By no means do you have to participate.
            It is a voluntary feature for users who have purchased the Champion or Ultimate subscription.
            No additional payment or entry fee is required from you—prizes are funded by Spaxio.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
          <p>
            StudySession and its content are owned by Spaxio. User-generated content remains
            yours, but you grant us a license to display it on the platform.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
          <p>
            Questions? Use the Contact page.
          </p>
        </section>
      </div>
    </div>
  );
}
