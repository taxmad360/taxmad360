export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-black italic tracking-tighter mb-12 header-gradient">TAXMAD</h1>
      
      <div className="grid gap-6 w-full max-w-sm">
        <a 
          href="/client" 
          className="p-6 bg-neon-blue text-black text-center rounded-2xl font-black uppercase hover:opacity-90 transition-opacity"
        >
          Soy Cliente
        </a>
        <a 
          href="/drivers" 
          className="p-6 bg-zinc-900 text-white text-center rounded-2xl font-black uppercase border border-zinc-800 hover:bg-zinc-800 transition-colors"
        >
          Soy Conductor
        </a>
      </div>
    </main>
  );
}
