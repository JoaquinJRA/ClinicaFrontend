import { useState } from 'react'
import { Plus, Search, Trash2, User } from 'lucide-react'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'

const activePrescriptions = [
  { medicine: 'Paracetamol', dose: '500 mg', frequency: 'Cada 8 horas', remaining: '5 días restantes' },
  { medicine: 'Loratadina', dose: '10 mg', frequency: 'Una vez al día', remaining: '12 días restantes' },
]

function DoctorPrescriptions() {
  const [medicineRows, setMedicineRows] = useState([{ id: 1 }])

  const addMedicineRow = () => {
    setMedicineRows((currentRows) => [...currentRows, { id: currentRows.length + 1 }])
  }

  return (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
      <section className="min-w-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1A3A6B]">Prescripciones Médicas</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Emita recetas visuales para el paciente seleccionado.
          </p>
        </div>

        <Card className="mb-5">
          {/* Búsqueda visual de paciente. */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <Input className="pl-12" placeholder="Buscar paciente por ID o nombre" />
          </div>
        </Card>

        <Card className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <User className="h-7 w-7 text-[#2563EB]" />
          </div>
          <div>
            <p className="text-lg font-bold text-[#111827]">Carlos García</p>
            <p className="text-sm font-semibold text-[#6B7280]">#CL8924</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Formulario de nueva prescripción
          </h2>

          <div className="mt-5 space-y-5">
            {medicineRows.map((row, index) => (
              <div className="rounded-2xl bg-gray-50 p-4" key={row.id}>
                <p className="mb-4 text-sm font-bold text-[#1A3A6B]">Medicamento {index + 1}</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-semibold text-[#111827]">Medicamento</span>
                    <Input placeholder="Paracetamol" />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-semibold text-[#111827]">Dosis</span>
                    <Input placeholder="500 mg" />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-semibold text-[#111827]">Frecuencia</span>
                    <Input placeholder="Cada 8 horas" />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-semibold text-[#111827]">Fecha inicio</span>
                    <Input type="date" />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-semibold text-[#111827]">Duración</span>
                    <div className="grid grid-cols-[1fr_130px] gap-3">
                      <Input placeholder="7" type="number" />
                      <select className="w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none">
                        <option>Días</option>
                        <option>Semanas</option>
                      </select>
                    </div>
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-semibold text-[#111827]">
                      Instrucciones adicionales
                    </span>
                    <Input placeholder="Tomar después de alimentos" />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
              onClick={addMedicineRow}
              type="button"
            >
              <Plus className="h-5 w-5" />
              Agregar otro medicamento
            </button>
            <Button type="button">Emitir Prescripción →</Button>
          </div>
        </Card>
      </section>

      <aside className="min-w-0">
        <h2 className="mb-4 text-xl font-bold text-[#1A3A6B]">Prescripciones activas</h2>
        <div className="space-y-4">
          {activePrescriptions.map((item) => (
            <Card className="flex items-start justify-between gap-4" key={item.medicine}>
              <div>
                <h3 className="text-lg font-bold text-[#111827]">{item.medicine}</h3>
                <p className="mt-1 text-sm text-[#6B7280]">{item.dose} · {item.frequency}</p>
                <Badge className="mt-4" variant="blue">{item.remaining}</Badge>
              </div>
              <button
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#EF4444] transition hover:bg-red-100"
                type="button"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </Card>
          ))}
        </div>
      </aside>
    </div>
  )
}

export default DoctorPrescriptions
