import { useCallback, useEffect, useState } from 'react'
import { Calendar, Clock, User } from 'lucide-react'
import api from '../../api/axios'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import { useAuthStore } from '../../../store/authStore'

const SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
]

const statusVariant = {
  PENDIENTE: 'pending',
  CONFIRMADA: 'confirmed',
  COMPLETADA: 'completed',
  CANCELADA: 'canceled',
}

const statusLabels = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
}

const filtrosEstado = [
  { label: 'Todos', value: 'Todos' },
  { label: 'Pendiente', value: 'PENDIENTE' },
  { label: 'Confirmada', value: 'CONFIRMADA' },
  { label: 'Completada', value: 'COMPLETADA' },
  { label: 'Cancelada', value: 'CANCELADA' },
]

const formatDate = (fecha) =>
  new Date(fecha).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

const formatTime = (fecha) =>
  new Date(fecha).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })

function DoctorAppointments() {
  const usuario = useAuthStore((s) => s.usuario)
  const medicoId = usuario?.medicoId ?? usuario?.medico?.id
  const [citas, setCitas] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModalReprogramar, setShowModalReprogramar] = useState(false)
  const [showModalCancelar, setShowModalCancelar] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState(null)
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [nuevaHora, setNuevaHora] = useState('')

  const fetchCitas = useCallback(
    async (estado = filtroEstado, fecha = filtroFecha) => {
      if (!medicoId) return

      try {
        setLoading(true)
        const params = {}
        if (estado !== 'Todos') params.estado = estado
        if (fecha) params.fecha = fecha

        const res = await api.get(`/doctor/${medicoId}/citas`, { params })
        setCitas(res.data)
      } finally {
        setLoading(false)
      }
    },
    [filtroEstado, filtroFecha, medicoId],
  )

  const handleEstadoClick = (estado) => {
    setFiltroEstado(estado)
    fetchCitas(estado, filtroFecha)
  }

  const handleFechaChange = (event) => {
    const fecha = event.target.value
    setFiltroFecha(fecha)
    fetchCitas(filtroEstado, fecha)
  }

  const abrirCancelar = (cita) => {
    setCitaSeleccionada(cita)
    setShowModalCancelar(true)
  }

  const confirmarCancelar = async () => {
    if (!citaSeleccionada) return

    await api.put(`/doctor/citas/${citaSeleccionada.id}/estado`, { estado: 'CANCELADA' })
    setShowModalCancelar(false)
    setCitaSeleccionada(null)
    fetchCitas()
  }

  const handleCancelar = async (id) => {
    if (!confirm('¿Cancelar esta cita?')) return

    await api.put(`/doctor/citas/${id}/estado`, { estado: 'CANCELADA' })
    fetchCitas()
  }

  const handleCompletar = async (id) => {
    if (!confirm('¿Marcar esta cita como completada?')) return

    await api.put(`/doctor/citas/${id}/estado`, { estado: 'COMPLETADA' })
    fetchCitas()
  }

  const handleOpenReprogramar = (cita) => {
    setCitaSeleccionada(cita)
    setNuevaFecha('')
    setNuevaHora('')
    setShowModalReprogramar(true)
  }

  const handleReprogramar = async () => {
    if (!nuevaFecha || !nuevaHora) {
      alert('Selecciona fecha y hora')
      return
    }

    await api.put(`/doctor/citas/${citaSeleccionada.id}/estado`, {
      estado: 'PENDIENTE',
      nuevaFecha: `${nuevaFecha}T${nuevaHora}:00`,
    })
    setShowModalReprogramar(false)
    setCitaSeleccionada(null)
    setNuevaFecha('')
    setNuevaHora('')
    fetchCitas()
  }

  useEffect(() => {
    fetchCitas()
  }, [fetchCitas])

  return (
    <div className="mx-auto max-w-[1120px]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A3A6B]">Mis Citas</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Revise la agenda diaria y gestione cambios visuales de sus próximas atenciones.
        </p>
      </div>

      <Card className="mb-5">
        {/* Filtros visuales por estado y fecha. */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {filtrosEstado.map((status) => (
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filtroEstado === status.value
                    ? 'bg-[#1A3A6B] text-white'
                    : 'bg-gray-100 text-[#6B7280] hover:bg-blue-50 hover:text-[#2563EB]'
                }`}
                key={status.value}
                onClick={() => handleEstadoClick(status.value)}
                type="button"
              >
                {status.label}
              </button>
            ))}
          </div>
          <div className="w-full xl:w-56">
            <Input onChange={handleFechaChange} type="date" value={filtroFecha} />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <Card>
            <p className="text-sm text-[#6B7280]">Cargando citas...</p>
          </Card>
        ) : citas.length ? (
          citas.map((cita) => (
            <Card className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between" key={cita.id}>
              <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-[210px_1fr_130px] md:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                    <Calendar className="h-6 w-6 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="font-bold capitalize text-[#111827]">{formatDate(cita.fecha)}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-[#6B7280]">
                      <Clock className="h-4 w-4" />
                      {formatTime(cita.fecha)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="flex items-center gap-2 font-bold text-[#111827]">
                    <User className="h-4 w-4 text-[#2563EB]" />
                    {cita.paciente.nombre} {cita.paciente.apellido}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#6B7280]">{cita.paciente.codigo}</p>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                    {cita.motivo || 'Sin motivo registrado'}
                  </p>
                </div>
                <Badge className="w-fit" variant={statusVariant[cita.estado]}>
                  {statusLabels[cita.estado] ?? cita.estado}
                </Badge>
              </div>

              {!['CANCELADA', 'COMPLETADA'].includes(cita.estado) && (
                <div className="flex gap-3">
                  <button
                    className="rounded-full bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                    onClick={() => handleCompletar(cita.id)}
                    type="button"
                  >
                    Completar
                  </button>
                  <button
                    className="rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
                    onClick={() => handleOpenReprogramar(cita)}
                    type="button"
                  >
                    Reprogramar
                  </button>
                  <button
                    className="rounded-full bg-red-50 px-4 py-3 text-sm font-semibold text-[#EF4444] transition hover:bg-red-100"
                    onClick={() => abrirCancelar(cita)}
                    type="button"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-sm text-[#6B7280]">
              No hay citas para los filtros seleccionados
            </p>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showModalReprogramar}
        onClose={() => setShowModalReprogramar(false)}
        title={`Reprogramar cita — ${citaSeleccionada?.paciente.nombre ?? ''}`}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#111827]">Nueva fecha</span>
            <Input onChange={(event) => setNuevaFecha(event.target.value)} type="date" value={nuevaFecha} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#111827]">Nuevo horario</span>
            <select
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-[#1A3A6B] outline-none transition focus:border-[#2563EB]"
              onChange={(event) => setNuevaHora(event.target.value)}
              value={nuevaHora}
            >
              <option value="">Seleccionar</option>
              {SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#6B7280]" onClick={() => setShowModalReprogramar(false)} type="button">
            Cancelar
          </button>
          <Button onClick={handleReprogramar} type="button">Confirmar</Button>
        </div>
      </Modal>
      <Modal
        isOpen={showModalCancelar}
        onClose={() => setShowModalCancelar(false)}
        title="Cancelar cita"
      >
        <p className="text-sm leading-6 text-[#6B7280]">
          ¿Estas seguro que quieres cancelar la cita de{' '}
          <span className="font-bold text-[#111827]">
            {citaSeleccionada?.paciente.nombre} {citaSeleccionada?.paciente.apellido}
          </span>
          ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#6B7280]"
            onClick={() => setShowModalCancelar(false)}
            type="button"
          >
            No, volver
          </button>
          <button
            className="rounded-full bg-red-50 px-5 py-3 font-semibold text-[#EF4444] transition hover:bg-red-100"
            onClick={confirmarCancelar}
            type="button"
          >
            Si, cancelar cita
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default DoctorAppointments
