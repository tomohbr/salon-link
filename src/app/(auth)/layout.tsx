import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fffdfd', color: '#2a1a26' }}>
      <header className="px-6 py-6" style={{ borderBottom: '1px solid #e8dfd9' }}>
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="inline-flex items-baseline gap-3">
            <span className="text-xl font-bold tracking-wide" style={{ color: '#633f5a' }}>SalonLink</span>
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: '#8a7a82' }}>for Nail Salons</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        {children}
      </main>
      <footer className="py-6 px-6 text-center text-xs" style={{ color: '#8a7a82', borderTop: '1px solid #e8dfd9' }}>
        © 2026 SalonLink
      </footer>
    </div>
  );
}
