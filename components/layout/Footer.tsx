import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="text-lg font-bold text-accent-cyan tracking-wider">
              CALEARNDER
            </span>
            <p className="mt-2 text-sm text-foreground/60">
              Gamified learning & calendar platform. Level up your productivity.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li><Link href="/calendar" className="hover:text-accent-cyan transition-colors">Calendar</Link></li>
              <li><Link href="/learn" className="hover:text-accent-cyan transition-colors">Learn</Link></li>
              <li><Link href="/race" className="hover:text-accent-cyan transition-colors">Race</Link></li>
              <li><Link href="/pricing" className="hover:text-accent-cyan transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li><Link href="/privacy" className="hover:text-accent-cyan transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-accent-cyan transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/refund" className="hover:text-accent-cyan transition-colors">Refund Policy</Link></li>
              <li><Link href="/race/rules" className="hover:text-accent-cyan transition-colors">Competition Rules</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li><Link href="/blog" className="hover:text-accent-cyan transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-accent-cyan transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-foreground/50">
          © {new Date().getFullYear()} Calearnder. Powered by Spaxio.
        </div>
      </div>
    </footer>
  );
}
