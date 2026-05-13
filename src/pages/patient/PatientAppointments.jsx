import { useState } from 'react'
import { CalendarDays, CheckCircle, CheckCircle2, Clock, User, X, XCircle } from 'lucide-react'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'

const monthDays = Array.from({ length: 30 }, (_, index) => index + 1)
const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const timeSlots = ['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM']

const stats = [
  { icon: Clock, value: '3', label: 'Pendiente', color: 'text-blue-700' },
  { icon: CheckCircle, value: '12', label: 'Confirmadas', color: 'text-green-700' },
  { icon: CheckCircle2, value: '45', label: 'Completadas', color: 'text-green-700' },
  { icon: XCircle, value: '2', label: 'Canceladas', color: 'text-red-700' },
]

function PatientAppointments() {
  const [viewMode, setViewMode] = useState('Mes')

  return (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <section className="min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1A3A6B] sm:text-3xl">Citas Medicas</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Consulte disponibilidad, horarios y estado de sus próximas atenciones.
          </p>
        </div>

        <Card>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-[#111827] sm:text-2xl">Abril 2026</h2>
            <div className="w-fit rounded-full bg-gray-100 p-1">
              {['Mes', 'Semana'].map((mode) => (
                <button
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    viewMode === mode ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#6B7280]'
                  }`}
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  type="button"
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Calendario visual del mes seleccionado. */}
          <div className="overflow-x-auto pb-2">
            <div className="grid min-w-[560px] grid-cols-7 gap-3">
              {weekDays.map((day) => (
                <div className="text-center text-xs font-bold text-gray-400" key={day}>
                  {day}
                </div>
              ))}
              {monthDays.map((day) => {
                const isSelected = day === 7
                const hasBlueDot = day === 3 || day === 8
                const hasRedDot = day === 14

                return (
                  <div className="flex h-14 flex-col items-center justify-center" key={day}>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                        isSelected ? 'bg-[#1A3A6B] text-white' : 'text-[#111827]'
                      }`}
                    >
                      {day}
                    </span>
                    <span
                      className={`mt-1 h-1.5 w-1.5 rounded-full ${
                        hasBlueDot ? 'bg-[#2563EB]' : hasRedDot ? 'bg-[#EF4444]' : 'bg-transparent'
                      }`}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Citas disponibles el 7 de Abril
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {timeSlots.map((slot) => (
                <button
                  className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                    slot === '10:30 AM'
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'bg-gray-100 text-[#6B7280] hover:bg-blue-50 hover:text-[#2563EB]'
                  }`}
                  key={slot}
                  type="button"
                >
                  {slot}
                </button>
              ))}
            </div>
            <Button className="mt-6 w-full">Agendar cita</Button>
          </div>
        </Card>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card className="flex items-center gap-4 p-5" key={stat.label}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111827]">{stat.value}</p>
                <p className="text-sm text-[#6B7280]">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <aside className="min-w-0">
        <h2 className="mb-4 text-xl font-bold text-[#1A3A6B]">Siguientes Citas</h2>
        <Card>
          {/* Tarjeta de próxima cita pendiente. */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <Badge variant="pending">PENDIENTE</Badge>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#2563EB]">
              Abril 14
            </span>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
              <CalendarDays className="h-6 w-6 text-[#2563EB]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-[#111827]">Consulta General</h3>
              <p className="mt-1 flex items-center gap-2 text-sm text-[#6B7280]">
                <User className="h-4 w-4 shrink-0" />
                <span>Dr. Marco / Medicina General</span>
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-[#6B7280]">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Esperando confirmación</span>
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              className="flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
              type="button"
            >
              Modificar
            </button>
            <button
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#EF4444] transition hover:bg-red-100"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </Card>
      </aside>
    </div>
  )
}

export default PatientAppointments
