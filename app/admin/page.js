'use client'
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-black italic">TAX<span className="text-[#39FF14]">MAD</span> ADMIN</h1>
      <div className="mt-10 bg-zinc-900 p-8 rounded-[40px] w-full max-w-md">
        <p className="text-zinc-400 mb-6">Panel de control de flotas</p>
        <button className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase">Monitorear GPS</button>
      </div>
    </div>
  )
}
