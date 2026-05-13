import { useState } from 'react'
import { AlertTriangle, Calendar, Clock, Pill } from 'lucide-react'
import Badge from '../../components/Badge'
import Card from '../../components/Card'

const medications = [
  {
    name: 'Paracetamol',
    dose: '500 mg',
    schedule: '08:00 AM (Diario)',
    endDate: 'Termina: 7 de Abril, 2026',
    initialStatus: 'Pendiente',
  },
  {
    name: 'Loratadina',
    dose: '10 mg',
    schedule: '07:00 AM (Con Comidas)',
    endDate: 'Termina: 18 de Abril, 2026',
    initialStatus: 'Tomado',
  },
]

const statusVariants = {
  Pendiente: 'pending',
  Tomado: 'taken',
  Saltado: 'skipped',
}

function PatientMedications() {
  const [statuses, setStatuses] = useState(
    medications.reduce((accumulator, item) => {
      accumulator[item.name] = item.initialStatus
      return accumulator
    }, {}),
  )

  return (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
      <section>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1A3A6B]">Medicación</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Controle sus dosis, horarios y estado diario de medicamentos.
          </p>
        </div>

        {/* Lista de medicamentos activos con selector de estado visual. */}
        <div className="space-y-4">
          {medications.map((item) => (
            <Card className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between" key={item.name}>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                  <Pill className="h-7 w-7 text-[#2563EB]" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-[#111827]">{item.name}</h2>
                    <Badge variant="blue">{item.dose}</Badge>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-[#6B7280]">
                    <Clock className="h-4 w-4" />
                    {item.schedule}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#6B7280]">{item.endDate}</p>
                </div>
              </div>

              <div className="flex w-full flex-wrap gap-1 rounded-2xl bg-gray-100 p-1 lg:w-auto lg:rounded-full">
                {['Pendiente', 'Tomado', 'Saltado'].map((status) => (
                  <button
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition lg:flex-none ${
                      statuses[item.name] === status
                        ? `${statusVariants[status] === 'pending' ? 'bg-blue-100 text-blue-700' : statusVariants[status] === 'taken' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} shadow-sm`
                        : 'text-[#6B7280] hover:bg-white'
                    }`}
                    key={status}
                    onClick={() =>
                      setStatuses((current) => ({
                        ...current,
                        [item.name]: status,
                      }))
                    }
                    type="button"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <aside>
        <h2 className="mb-4 text-xl font-bold text-[#1A3A6B]">Alertas de Salud</h2>
        <div className="space-y-4">
          <Card>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <AlertTriangle className="h-6 w-6 text-[#EF4444]" />
            </div>
            <h3 className="text-lg font-bold text-[#111827]">Nueva Prescripción Médica</h3>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              La doctora encargada le asignó un nuevo medicamento.
            </p>
          </Card>

          <Card>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
              <Calendar className="h-6 w-6 text-[#2563EB]" />
            </div>
            <h3 className="text-lg font-bold text-[#111827]">Siguientes Consultas</h3>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Mañana a las 10:30 AM — Medicina General con la doctora Luz.
            </p>
          </Card>
        </div>
      </aside>
    </div>
  )
}

export default PatientMedications
