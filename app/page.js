import Link from 'next/link'

export const metadata = {
  title: 'TaxMad | Tu taxi premium en Madrid',
  description: 'Solicita tu servicio de taxi en Madrid de forma rápida y segura.',
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-6xl font-black italic tracking-tighter mb-2 header-gradient">TAXMAD</h1>
      <p className="text-zinc-500 mb-12 text-sm uppercase tracking-[0.2em]">Movilidad Premium 2026</p>
      
      <div className="grid gap-4 w-full max-w-sm">
        <Link 
          href="/client" 
          className="p-6 bg-neon-blue text-black text-center rounded-2xl font-black uppercase hover:scale-[1.02] transition-all"
        >
          Solicitar un Taxi
        </Link>
        <Link 
          href="/drivers" 
          className="p-6 bg-zinc-900 text-white text-center rounded-2xl font-black uppercase border border-zinc-800 hover:border-zinc-500 transition-all"
        >
          Acceso Conductores
        </Link>
      </div>

      <footer className="mt-20 text-[10px] text-zinc-700">
        © 2026 TAXMAD - Madrid
      </footer>
    </main>
  );
}
