export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
      <div className="prose prose-invert max-w-none space-y-6">
        <p className="text-foreground/80">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Subscription Cancellations</h2>
          <p>
            You may cancel your subscription at any time. Access continues until the end
            of the current billing period. No refunds for partial periods.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Refund Requests</h2>
          <p>
            Refund requests within 7 days of initial purchase may be considered on a
            case-by-case basis. Contact us via the Contact page with your request.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Competition Prizes</h2>
          <p>
            Competition prizes are non-refundable once paid. Disputes must be raised
            within 7 days of race completion per the Competition Rules.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p>
            For refund inquiries, use the Contact page.
          </p>
        </section>
      </div>
    </div>
  );
}
