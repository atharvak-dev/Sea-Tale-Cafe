'use client'
import Image from 'next/image'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-seatale-cream font-display relative overflow-hidden flex flex-col">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230A2342' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Header Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">

        {/* Logo Section */}
        <div className="mb-12 text-center animate-fade-in">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-seatale-secondary shadow-2xl mb-6 relative">
            <Image
              src="/logo.jpg"
              alt="Sea Tale Café"
              fill
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-seatale-primary tracking-wide mb-2">Sea Tale Café</h1>
          <p className="text-seatale-secondary uppercase tracking-[0.2em] text-sm">Maritime Dining Experience</p>
        </div>

        {/* Role Selection Cards */}
        <div className="w-full max-w-md space-y-6 animate-slide-up">

          {/* Customer Card */}
          <Link href="/customer" className="block group">
            <div className="bg-seatale-primary rounded-2xl p-1 shadow-xl transition-transform transform group-hover:scale-[1.02] active:scale-95">
              <div className="bg-seatale-primary border-2 border-dashed border-seatale-secondary/30 rounded-xl p-6 flex items-center gap-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                  <span className="text-9xl">🍽️</span>
                </div>
                <div className="w-16 h-16 rounded-full bg-seatale-cream/10 flex items-center justify-center text-3xl border border-seatale-secondary/50 text-seatale-secondary">
                  🍽️
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-seatale-cream mb-1">Customer</h2>
                  <p className="text-seatale-secondary/80 text-sm font-sans">Browse menu & order food</p>
                </div>
                <div className="ml-auto text-seatale-secondary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Staff Card */}
          <Link href="/receptionist/login" className="block group">
            <div className="bg-seatale-light rounded-2xl p-1 shadow-xl transition-transform transform group-hover:scale-[1.02] active:scale-95 border-2 border-seatale-secondary/20">
              <div className="bg-seatale-light border-2 border-dashed border-seatale-secondary/30 rounded-xl p-6 flex items-center gap-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-1/4 translate-y-1/4">
                  <span className="text-9xl">⚓</span>
                </div>
                <div className="w-16 h-16 rounded-full bg-seatale-primary/5 flex items-center justify-center text-3xl border border-seatale-secondary/50 text-seatale-primary">
                  ⚓
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-seatale-primary mb-1">Staff Login</h2>
                  <p className="text-seatale-primary/70 text-sm font-sans">Manage orders & kitchen</p>
                </div>
                <div className="ml-auto text-seatale-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </div>
          </Link>

        </div>
      </div>

      {/* Footer Info */}
      <div className="p-6 text-center relative z-10">
        <p className="text-seatale-primary/40 text-xs font-sans">© 2024 Sea Tale Café. All rights reserved.</p>
      </div>
    </div>
  )
}