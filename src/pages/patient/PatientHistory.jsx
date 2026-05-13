import { useState } from 'react'
import { ChevronDown, Stethoscope } from 'lucide-react'
import Card from '../../components/Card'

const consultations = [
  {
    date: '07 Abril 2026',
    doctor: 'Dra. Luz Salazar',
    specialty: 'Medicina General',
    summary: 'Control preventivo con presión arterial estable.',
    diagnosis: 'Signos vitales dentro de rangos normales. No se evidencian síntomas agudos.',
    treatment: 'Mantener hidratación, sueño regular y actividad física moderada.',
    prescription: 'Paracetamol 500mg solo en caso de dolor leve.',
  },
  {
    date: '18 Marzo 2026',
    doctor: 'Dr. Marco Rivas',
    specialty: 'Neumología',
    summary: 'Seguimiento por antecedente de asma infantil.',
    diagnosis: 'Función respiratoria conservada, sin crisis recientes ni sibilancias activas.',
    treatment: 'Evitar exposición prolongada a polvo y cambios bruscos de temperatura.',
    prescription: 'Loratadina 10mg en caso de alergia estacional.',
  },
  {
    date: '02 Febrero 2026',
    doctor: 'Dra. Camila Torres',
    specialty: 'Gastroenterología',
    summary: 'Dolor abdominal leve asociado a alimentación irregular.',
    diagnosis: 'Cuadro compatible con gastritis leve sin signos de alarma.',
    treatment: 'Dieta blanda por 72 horas y control si persisten molestias.',
    prescription: 'Omeprazol 20mg por 7 días.',
  },
  {
    date: '12 Enero 2026',
    doctor: 'Dr. Luis Herrera',
    specialty: 'Traumatología',
    summary: 'Evaluación por molestia muscular posterior a ejercicio.',
    diagnosis: 'Contractura muscular leve en zona lumbar, sin limitación funcional severa.',
    treatment: 'Reposo relativo, calor local y estiramientos progresivos.',
    prescription: 'Ibuprofeno 400mg cada 12 horas por 3 días.',
  },
]

function PatientHistory() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="mx-auto max-w-[1080px]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A3A6B]">Historial Clínico</h1>
        <p className="mt-2 text-sm text-[#6B7280]">Consultas recientes y tratamientos registrados.</p>
      </div>

      {/* Acordeón de consultas históricas solo de lectura. */}
      <div className="space-y-4">
        {consultations.map((item, index) => {
          const isOpen = openIndex === index

          return (
            <Card className="p-0" key={item.date}>
              <button
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                type="button"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                    <Stethoscope className="h-6 w-6 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      {item.date}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-[#111827]">
                      {item.doctor} · {item.specialty}
                    </h2>
                    <p className="mt-1 text-sm text-[#6B7280]">{item.summary}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-[#6B7280] transition ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 px-6 py-5">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                        Diagnóstico
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#111827]">{item.diagnosis}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                        Tratamiento
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#111827]">{item.treatment}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                        Receta Emitida
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#111827]">{item.prescription}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default PatientHistory
