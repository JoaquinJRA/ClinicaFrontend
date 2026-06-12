import { Activity, CalendarCheck, PlusSquare, ShieldCheck } from "lucide-react";

function AuthLayout({ children, mode = "login" }) {
  const isRegister = mode === "register";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071426] text-[#0F172A]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.35),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(96,165,250,0.18),transparent_30%),linear-gradient(135deg,#071426_0%,#0D2442_42%,#F4F7FB_42%,#EEF3F8_100%)]" />
      <div className="absolute left-8 top-8 hidden h-32 w-32 rounded-full border border-white/10 md:block" />
      <div className="absolute bottom-10 left-[34%] hidden h-56 w-56 rounded-full border border-[#2563EB]/10 xl:block" />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[42%_58%]">
        <section className="relative flex min-h-[360px] flex-col justify-between overflow-hidden px-8 py-8 text-white md:px-12 lg:min-h-screen lg:py-12">
          <div className="absolute inset-x-8 top-24 h-px bg-white/15" />
          <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-24 translate-y-20 rounded-full bg-[#2563EB]/20 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-2xl shadow-blue-950/20">
              <PlusSquare className="h-7 w-7" strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">Clinica Luz</p>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-100/70">
                Portal medico
              </p>
            </div>
          </div>

          <div className="relative max-w-md py-12 lg:py-0">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-100">
              <ShieldCheck className="h-4 w-4" />
              Acceso seguro
            </div>
            <h1 className="max-w-sm text-5xl font-black leading-[0.95] tracking-tight md:text-6xl">
              Tu salud, en una cabina digital.
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-blue-50/80">
              Una entrada privada para pacientes, medicos y administradores:
              citas, diagnosticos, pagos y tratamientos conectados en un solo
              flujo.
            </p>
          </div>

          <div className="relative grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-[1.75rem] border border-white/12 bg-white/10 p-4 backdrop-blur">
              <CalendarCheck className="mb-4 h-6 w-6 text-blue-200" />
              <p className="text-2xl font-black">{isRegister ? "24/7" : "18"}</p>
              <p className="mt-1 text-xs text-blue-50/70">
                {isRegister ? "Verificacion protegida" : "Slots diarios"}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-white/12 bg-white/10 p-4 backdrop-blur">
              <Activity className="mb-4 h-6 w-6 text-blue-200" />
              <p className="text-2xl font-black">
                {isRegister ? "SMS" : "CL"}
              </p>
              <p className="mt-1 text-xs text-blue-50/70">
                {isRegister ? "Telefono validado" : "Historia clinica"}
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 md:px-10 lg:px-16">
          {children}
        </section>
      </div>
    </main>
  );
}

export default AuthLayout;
