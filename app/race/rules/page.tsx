export default function RaceRulesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Official Competition Rules</h1>

      <div className="prose prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Competition Overview</h2>
          <p>
            Monthly skill-based productivity competition. Free to enter — included with Champion and Ultimate subscriptions.
            Prizes funded by Spaxio (company-funded promotion). Prize amounts vary by participant count.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Eligibility Requirements</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Must have active Champion or Ultimate subscription</li>
            <li>Must opt-in before race period ends</li>
            <li>Limited to one entry per user per race period</li>
            <li>Open to all subscribers (no geographic restrictions unless legally required)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. How to Enter</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Click &quot;Join This Month&apos;s Productivity Challenge&quot; button</li>
            <li>Review rules and prizes</li>
            <li>Confirm: &quot;I choose to participate in this month&apos;s productivity challenge&quot;</li>
            <li>No payment required — it&apos;s a subscriber benefit</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Scoring System (100% Skill-Based)</h2>
          <p>Winners determined solely by XP earned during race period. XP sources:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Course completion: 100-500 XP (based on difficulty)</li>
            <li>Quiz questions: 10-25 XP per correct answer</li>
            <li>Speed bonuses: 50 XP for completing courses ahead of schedule</li>
            <li>Daily study streaks: 20 XP per consecutive day</li>
          </ul>
          <p className="mt-4 font-semibold">NO random elements: No lucky draws, random multipliers, or chance-based scoring.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Tie-Breaker Rules</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>First tie-breaker: Earlier opt-in timestamp</li>
            <li>Second tie-breaker: Higher quiz accuracy percentage</li>
            <li>No random selection for ties</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Winner Determination</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Calculated automatically at end of race period (last day of month, 11:59 PM)</li>
            <li>Top 3 users by XP earned during race</li>
            <li>Winners notified via email within 48 hours</li>
            <li>Payouts processed within 7-10 business days</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Prizes</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Prize amounts set at beginning of each race period</li>
            <li>Funded entirely by Spaxio</li>
            <li>1st Place: $100-$500 (varies)</li>
            <li>2nd Place: $60-$300 (varies)</li>
            <li>3rd Place: $40-$200 (varies)</li>
            <li>Paid via Stripe payout, PayPal, or bank transfer (winner&apos;s choice)</li>
            <li>Winners responsible for applicable taxes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Subscription Requirement</h2>
          <p>
            Must maintain active Champion or Ultimate subscription throughout race.
            If subscription is cancelled during race, user is disqualified.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Disqualification</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Cheating, automated bots, or XP manipulation</li>
            <li>Multiple accounts or sharing accounts</li>
            <li>Violating platform Terms of Service</li>
            <li>Cancelling subscription during active race</li>
            <li>Platform reserves right to disqualify and forfeit prizes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Legal Disclaimers</h2>
          <p>
            This is a promotional competition for subscribers. No purchase necessary beyond existing subscription.
            Void where prohibited by law. Platform not responsible for technical failures.
            Rules may be updated with reasonable notice.
          </p>
        </section>
      </div>
    </div>
  );
}
