import { PlusSquare } from 'lucide-react'

function AuthLayout({ children }) {
  return (
    <main className="grid h-screen min-h-[720px] grid-cols-[40%_60%] overflow-hidden bg-[#F3F4F6] font-sans">
      {/* Panel visual de marca para las pantallas de autenticacion. */}
      <section className="relative flex h-full items-end overflow-hidden bg-[#1A3A6B] px-12 py-14 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(26,58,107,0.96),rgba(15,31,61,0.86)),url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[#0F1F3D]/25" />
        <div className="relative max-w-sm">
          <div className="mb-6 flex items-center gap-3">
            <PlusSquare className="h-10 w-10" strokeWidth={2.4} />
            <span className="text-3xl font-bold tracking-tight">Clínica Luz</span>
          </div>
          <p className="text-xl font-medium leading-relaxed text-white/90">
            Donde la medicina moderna se une al máximo confort. Acceda a su portal pacientes.
          </p>
        </div>
      </section>

      <section className="flex h-full items-center justify-center px-16 py-10">
        {children}
      </section>
    </main>
  )
}

export default AuthLayout
