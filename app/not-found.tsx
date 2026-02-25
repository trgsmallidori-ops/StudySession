import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center border border-white/10">
        <div className="w-14 h-14 rounded-full bg-accent-cyan/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-bold text-accent-cyan">404</span>
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Page not found</h1>
        <p className="text-foreground/70 text-sm mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex px-4 py-2.5 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40 hover:bg-accent-cyan/30 transition-colors font-medium"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
