import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Calendar, Clock, Pill } from 'lucide-react'
import api from '../../api/axios'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { useAuthStore } from '../../../store/authStore'

const statusVariants = {
  Pendiente: 'pending',
  Tomado: 'taken',
  Saltado: 'skipped',
}

const formatDate = (fecha) =>
  new Date(fecha).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

const getEndDate = (medicamento) => {
  const inicio = medicamento.fechaInicio || medicamento.creadoEn
  if (!inicio || !medicamento.duracion) return null

  const date = new Date(inicio)
  const unidad = String(medicamento.unidadDuracion || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (unidad === 'semanas') date.setDate(date.getDate() + medicamento.duracion * 7)
  else if (unidad === 'meses') date.setMonth(date.getMonth() + medicamento.duracion)
  else date.setDate(date.getDate() + medicamento.duracion)

  return formatDate(date)
}

function PatientMedications() {
  const usuario = useAuthStore((s) => s.usuario)
  const pacienteId = usuario?.pacienteId ?? usuario?.paciente?.id
  const [medicamentos, setMedicamentos] = useState([])
  const [statuses, setStatuses] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchMedicamentos = useCallback(async () => {
    if (!pacienteId) {
      setMedicamentos([])
      setError('No se pudo identificar al paciente.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const res = await api.get(`/pacientes/${pacienteId}/medicamentos`)
      setMedicamentos(res.data)
      setStatuses((actual) =>
        res.data.reduce((accumulator, medicamento) => {
          accumulator[medicamento.id] = actual[medicamento.id] ?? 'Pendiente'
          return accumulator
        }, {}),
      )
    } catch (err) {
      setError(
        err.response?.data?.message ??
          'No se pudieron cargar los medicamentos activos.',
      )
    } finally {
      setLoading(false)
    }
  }, [pacienteId])

  useEffect(() => {
    fetchMedicamentos()
  }, [fetchMedicamentos])

  const alertaTexto = useMemo(() => {
    if (!medicamentos.length) return 'No tienes prescripciones activas por ahora.'
    const ultimo = medicamentos[0]
    return `Se asignó ${ultimo.nombre} ${ultimo.dosis}. ${ultimo.instrucciones || ''}`.trim()
  }, [medicamentos])

  if (loading) {
    return (
      <div className="mx-auto flex max-w-[1180px] items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#2563EB]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1180px]">
        <Card className="text-center">
          <p className="font-semibold text-[#111827]">{error}</p>
          <Button className="mt-5" onClick={fetchMedicamentos}>
            Reintentar
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
      <section>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1A3A6B]">Medicación</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Controle sus dosis, horarios y estado diario de medicamentos.
          </p>
        </div>

        <div className="space-y-4">
          {medicamentos.map((item) => {
            const endDate = getEndDate(item)

            return (
              <Card className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between" key={item.id}>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                    <Pill className="h-7 w-7 text-[#2563EB]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-[#111827]">{item.nombre}</h2>
                      <Badge variant="blue">{item.dosis}</Badge>
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm text-[#6B7280]">
                      <Clock className="h-4 w-4" />
                      {item.frecuencia || 'Frecuencia no registrada'}
                    </p>
                    {item.instrucciones && (
                      <p className="mt-1 text-sm text-[#6B7280]">{item.instrucciones}</p>
                    )}
                    <p className="mt-1 text-sm font-medium text-[#6B7280]">
                      {endDate ? `Termina: ${endDate}` : 'Duración no registrada'}
                    </p>
                  </div>
                </div>

                <div className="flex w-full flex-wrap gap-1 rounded-2xl bg-gray-100 p-1 lg:w-auto lg:rounded-full">
                  {['Pendiente', 'Tomado', 'Saltado'].map((status) => (
                    <button
                      className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition lg:flex-none ${
                        statuses[item.id] === status
                          ? `${statusVariants[status] === 'pending' ? 'bg-blue-100 text-blue-700' : statusVariants[status] === 'taken' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} shadow-sm`
                          : 'text-[#6B7280] hover:bg-white'
                      }`}
                      key={status}
                      onClick={() =>
                        setStatuses((current) => ({
                          ...current,
                          [item.id]: status,
                        }))
                      }
                      type="button"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </Card>
            )
          })}

          {!medicamentos.length && (
            <Card>
              <p className="text-sm text-[#6B7280]">Sin medicamentos activos.</p>
            </Card>
          )}
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
              {alertaTexto}
            </p>
          </Card>

          <Card>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
              <Calendar className="h-6 w-6 text-[#2563EB]" />
            </div>
            <h3 className="text-lg font-bold text-[#111827]">Siguientes Consultas</h3>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Revisa la sección de citas para confirmar tus próximos horarios.
            </p>
          </Card>
        </div>
      </aside>
    </div>
  )
}

export default PatientMedications
