import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, Stethoscope } from 'lucide-react'
import api from '../../api/axios'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { useAuthStore } from '../../../store/authStore'

const formatFecha = (fecha) =>
  new Date(fecha)
    .toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase()

const getDoctorLabel = (consulta) =>
  consulta.doctor === 'Clinica Luz'
    ? consulta.doctor
    : `Dr./Dra. ${consulta.doctor}`

function PatientHistory() {
  const usuario = useAuthStore((s) => s.usuario)
  const pacienteId = usuario?.pacienteId ?? usuario?.paciente?.id
  const [consultas, setConsultas] = useState([])
  const [openIndex, setOpenIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchHistorial = useCallback(async () => {
    if (!pacienteId) {
      setConsultas([])
      setError('No se pudo identificar al paciente.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const res = await api.get(`/pacientes/${pacienteId}/historial`)
      setConsultas(res.data)
      setOpenIndex(res.data.length ? 0 : -1)
    } catch (err) {
      setError(
        err.response?.data?.message ??
          'No se pudo cargar el historial clínico.',
      )
    } finally {
      setLoading(false)
    }
  }, [pacienteId])

  useEffect(() => {
    fetchHistorial()
  }, [fetchHistorial])

  if (loading) {
    return (
      <div className="mx-auto flex max-w-[1080px] items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#2563EB]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1080px]">
        <Card className="text-center">
          <p className="font-semibold text-[#111827]">{error}</p>
          <Button className="mt-5" onClick={fetchHistorial}>
            Reintentar
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1080px]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A3A6B]">Historial Clínico</h1>
        <p className="mt-2 text-sm text-[#6B7280]">Consultas recientes y tratamientos registrados.</p>
      </div>

      <div className="space-y-4">
        {consultas.map((consulta, index) => {
          const isOpen = openIndex === index

          return (
            <Card className="p-0" key={consulta.id}>
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
                      {formatFecha(consulta.fecha)}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-[#111827]">
                      {getDoctorLabel(consulta)} · {consulta.especialidad}
                    </h2>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      {consulta.motivo || 'Consulta médica registrada.'}
                    </p>
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
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#111827]">
                        {consulta.diagnostico || 'Sin diagnóstico registrado.'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                        Tratamiento
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#111827]">
                        {consulta.tratamiento || 'Sin tratamiento registrado.'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                        Receta Emitida
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#111827]">
                        {consulta.receta || 'Sin receta emitida.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )
        })}

        {!consultas.length && (
          <Card className="text-center">
            <p className="font-semibold text-[#111827]">
              Aún no tienes consultas médicas registradas.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default PatientHistory
