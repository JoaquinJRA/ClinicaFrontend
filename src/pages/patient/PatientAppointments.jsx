import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  CalendarDays,
  CheckCircle,
  CheckCircle2,
  Clock,
  User,
  X,
  XCircle,
} from 'lucide-react'
import api from '../../api/axios'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Modal from '../../components/Modal'
import { useAuthStore } from '../../../store/authStore'

const weekDays = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
const ESTADOS_ACTIVOS = ['PENDIENTE', 'CONFIRMADA']
const ESTADO_BADGE_VARIANTS = {
  PENDIENTE: 'pending',
  CONFIRMADA: 'confirmed',
  COMPLETADA: 'completed',
  CANCELADA: 'canceled',
}

const getDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatAppointmentDate = (fecha) =>
  new Date(fecha).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })

const isPastSlotToday = (selectedDate, time) => {
  const today = new Date()
  if (selectedDate !== getDateKey(today)) return false

  const [hours, minutes] = time.split(':').map(Number)
  const slotMinutes = hours * 60 + minutes
  const nowMinutes = today.getHours() * 60 + today.getMinutes()

  return slotMinutes < nowMinutes
}

function PatientAppointments() {
  const usuario = useAuthStore((s) => s.usuario)
  const pacienteId = usuario?.pacienteId ?? usuario?.paciente?.id
  const today = new Date()
  const todayKey = getDateKey(today)
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [monthData, setMonthData] = useState({})
  const [slots, setSlots] = useState([])
  const [citasPaciente, setCitasPaciente] = useState([])
  const [especialidadId, setEspecialidadId] = useState(1)
  const [especialidades, setEspecialidades] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showEspecialidadModal, setShowEspecialidadModal] = useState(false)
  const [showNoDoctorsModal, setShowNoDoctorsModal] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [citaToCancel, setCitaToCancel] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [citaToEdit, setCitaToEdit] = useState(null)
  const [editEspecialidadId, setEditEspecialidadId] = useState(1)
  const [editDate, setEditDate] = useState('')
  const [editSlot, setEditSlot] = useState(null)
  const [editSlots, setEditSlots] = useState([])
  const [editLoadingSlots, setEditLoadingSlots] = useState(false)
  const [editMotivo, setEditMotivo] = useState('')

  const fetchMes = useCallback(
    async (year, month) => {
      const res = await api.get('/citas/disponibilidad-mes', {
        params: { year, month: month + 1, especialidadId },
      })
      setMonthData(res.data)
    },
    [especialidadId],
  )

  const fetchCitasPaciente = useCallback(async () => {
    if (!pacienteId) return

    const res = await api.get(`/citas/paciente/${pacienteId}`)
    setCitasPaciente(res.data)
  }, [pacienteId])

  const fetchEspecialidades = useCallback(async () => {
    const res = await api.get('/citas/especialidades')
    setEspecialidades(res.data)

    if (res.data.length && !res.data.some((item) => item.id === especialidadId)) {
      setEspecialidadId(res.data[0].id)
    }
  }, [especialidadId])

  const fetchSlots = useCallback(
    async (fecha, nextEspecialidadId = especialidadId) => {
      try {
        setLoadingSlots(true)
        const res = await api.get('/citas/slots-disponibles', {
          params: { fecha, especialidadId: nextEspecialidadId },
        })
        setSlots(res.data)
      } finally {
        setLoadingSlots(false)
      }
    },
    [especialidadId],
  )

  const fetchEditSlots = useCallback(async (fecha, nextEspecialidadId) => {
    if (!fecha || fecha < todayKey) {
      setEditSlots([])
      return
    }

    try {
      setEditLoadingSlots(true)
      const res = await api.get('/citas/slots-disponibles', {
        params: { fecha, especialidadId: nextEspecialidadId },
      })
      setEditSlots(res.data)
    } finally {
      setEditLoadingSlots(false)
    }
  }, [todayKey])

  const handleDayClick = (fecha) => {
    if (fecha < todayKey) return

    setSelectedDate(fecha)
    setSelectedSlot(null)
    setSlots([])
    setShowEspecialidadModal(true)
  }

  const handleEspecialidadSelect = async (id) => {
    if (!selectedDate) {
      setShowEspecialidadModal(false)
      return
    }

    setSelectedSlot(null)
    setSlots([])
    setShowNoDoctorsModal(false)
    setEspecialidadId(id)
    setShowEspecialidadModal(false)

    const res = await api.get('/citas/disponibilidad-mes', {
      params: { year: currentYear, month: currentMonth + 1, especialidadId: id },
    })
    setMonthData(res.data)

    if (res.data[selectedDate]?.totalSlots === 0) {
      setShowNoDoctorsModal(true)
      return
    }

    await fetchSlots(selectedDate, id)
  }

  const handleConfirmarCita = async () => {
    if (!pacienteId || !selectedDate || !selectedSlot) return

    try {
      await api.post('/citas', {
        pacienteId,
        medicoId: selectedSlot.medicoId,
        fecha: `${selectedDate}T${selectedSlot.time}:00`,
        motivo,
      })

      setShowModal(false)
      toast.success('¡Cita agendada!')
      await fetchMes(currentYear, currentMonth)
      await fetchCitasPaciente()
      setSelectedDate(null)
      setSelectedSlot(null)
      setMotivo('')
      setSlots([])
    } catch (err) {
      if (err.response?.status === 409) {
        alert('Horario no disponible, elige otro')
        return
      }
      toast.error(
        err.response?.data?.message ?? 'No se pudo agendar la cita.',
      )
    }
  }

  const handleCancelarCita = (cita) => {
    setCitaToCancel(cita)
    setShowCancelModal(true)
  }

  const handleConfirmarCancelacion = async () => {
    if (!citaToCancel) return

    await api.put(`/citas/${citaToCancel.id}/estado`, { estado: 'CANCELADA' })
    setShowCancelModal(false)
    setCitaToCancel(null)
    await fetchCitasPaciente()
    await fetchMes(currentYear, currentMonth)
  }

  const handleConfirmarEstadoCita = async (cita) => {
    try {
      const res = await api.put(`/citas/${cita.id}/estado`, {
        estado: 'CONFIRMADA',
      })
      toast.success(
        res.data?.smsEnviado
          ? 'Cita confirmada. Se envio un SMS al paciente.'
          : 'Cita confirmada.',
      )
      await fetchCitasPaciente()
      await fetchMes(currentYear, currentMonth)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'No se pudo confirmar la cita.')
    }
  }

  const handleOpenEdit = (cita) => {
    const fecha = cita.fecha.slice(0, 10)
    const nextEspecialidadId = cita.medico.especialidad.id

    setCitaToEdit(cita)
    setEditEspecialidadId(nextEspecialidadId)
    setEditDate(fecha)
    setEditSlot(null)
    setEditMotivo(cita.motivo ?? '')
    setShowEditModal(true)
    fetchEditSlots(fecha, nextEspecialidadId)
  }

  const handleEditEspecialidadChange = (id) => {
    setEditEspecialidadId(id)
    setEditSlot(null)
    fetchEditSlots(editDate, id)
  }

  const handleEditDateChange = (fecha) => {
    setEditDate(fecha)
    setEditSlot(null)
    fetchEditSlots(fecha, editEspecialidadId)
  }

  const handleConfirmarEdicion = async () => {
    if (!citaToEdit || !editDate || !editSlot) return

    try {
      await api.put(`/citas/${citaToEdit.id}`, {
        medicoId: editSlot.medicoId,
        fecha: `${editDate}T${editSlot.time}:00`,
        motivo: editMotivo,
      })

      toast.success('Cita modificada correctamente.')
      setShowEditModal(false)
      setCitaToEdit(null)
      setEditSlot(null)
      await fetchCitasPaciente()
      await fetchMes(currentYear, currentMonth)
    } catch (err) {
      if (err.response?.status === 409) {
        alert('Horario no disponible, elige otro')
        return
      }
      toast.error(err.response?.data?.message ?? 'No se pudo modificar la cita.')
    }
  }

  const handleMonthChange = (direction) => {
    const nextDate = new Date(currentYear, currentMonth + direction, 1)
    const nextYear = nextDate.getFullYear()
    const nextMonth = nextDate.getMonth()

    setCurrentYear(nextYear)
    setCurrentMonth(nextMonth)
    setSelectedDate(null)
    setSelectedSlot(null)
    setSlots([])
    fetchMes(nextYear, nextMonth)
  }

  useEffect(() => {
    fetchMes(currentYear, currentMonth)
  }, [currentYear, currentMonth, fetchMes])

  useEffect(() => {
    fetchEspecialidades()
  }, [fetchEspecialidades])

  useEffect(() => {
    fetchCitasPaciente()
  }, [fetchCitasPaciente])

  const especialidadActual =
    especialidades.find((item) => item.id === especialidadId)?.nombre ??
    'Especialidad'
  const monthTitle = new Date(currentYear, currentMonth, 1).toLocaleString(
    'es-PE',
    { month: 'long' },
  )
  const monthDays = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOffset = new Date(currentYear, currentMonth, 1).getDay()
  const calendarCells = [
    ...Array.from({ length: firstDayOffset }, (_, index) => ({
      key: `empty-${index}`,
      empty: true,
    })),
    ...Array.from({ length: monthDays }, (_, index) => {
      const day = index + 1
      const fecha = getDateKey(new Date(currentYear, currentMonth, day))

      return { key: fecha, day, fecha }
    }),
  ]

  const visibleSlots = selectedDate
    ? slots.filter((slot) => !isPastSlotToday(selectedDate, slot.time))
    : []
  const noDoctoresDisponibles =
    Boolean(selectedDate) &&
    !loadingSlots &&
    monthData[selectedDate]?.totalSlots === 0

  const citasActivas = citasPaciente.filter((cita) =>
    ESTADOS_ACTIVOS.includes(cita.estado),
  )

  const stats = [
    {
      icon: Clock,
      value: citasPaciente.filter((cita) => cita.estado === 'PENDIENTE')
        .length,
      label: 'Pendiente',
      color: 'text-blue-700',
    },
    {
      icon: CheckCircle,
      value: citasPaciente.filter((cita) => cita.estado === 'CONFIRMADA')
        .length,
      label: 'Confirmadas',
      color: 'text-green-700',
    },
    {
      icon: CheckCircle2,
      value: citasPaciente.filter((cita) => cita.estado === 'COMPLETADA')
        .length,
      label: 'Completadas',
      color: 'text-green-700',
    },
    {
      icon: XCircle,
      value: citasPaciente.filter((cita) => cita.estado === 'CANCELADA')
        .length,
      label: 'Canceladas',
      color: 'text-red-700',
    },
  ]

  return (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <section className="min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1A3A6B] sm:text-3xl">
            Citas Medicas
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Consulte disponibilidad, horarios y estado de sus próximas
            atenciones.
          </p>
        </div>

        <Card>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-[#1A3A6B] transition hover:bg-blue-50"
                onClick={() => handleMonthChange(-1)}
                type="button"
              >
                ←
              </button>
              <h2 className="text-xl font-bold capitalize text-[#111827] sm:text-2xl">
                {monthTitle} {currentYear}
              </h2>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-[#1A3A6B] transition hover:bg-blue-50"
                onClick={() => handleMonthChange(1)}
                type="button"
              >
                →
              </button>
            </div>
          </div>

          {/* Calendario visual del mes seleccionado. */}
          <div className="overflow-x-auto pb-2">
            <div className="grid min-w-[560px] grid-cols-7 gap-3">
              {weekDays.map((day) => (
                <div
                  className="text-center text-xs font-bold text-gray-400"
                  key={day}
                >
                  {day}
                </div>
              ))}
              {calendarCells.map((cell) => {
                if (cell.empty) {
                  return <div className="h-14" key={cell.key} />
                }

                const isToday = cell.fecha === todayKey
                const isSelected = cell.fecha === selectedDate
                const hasBlueDot =
                  monthData[cell.fecha]?.hasAvailable === true
                const hasRedDot = citasPaciente.some((cita) =>
                  cita.fecha.startsWith(cell.fecha),
                )
                const isPastDay = cell.fecha < todayKey

                return (
                  <button
                    className={`flex h-14 flex-col items-center justify-center ${
                      isPastDay ? 'cursor-not-allowed opacity-40' : ''
                    }`}
                    disabled={isPastDay}
                    key={cell.key}
                    onClick={() => handleDayClick(cell.fecha)}
                    type="button"
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                        isSelected
                          ? 'bg-[#2563EB] text-white shadow-sm'
                          : isToday
                            ? 'bg-[#1A3A6B] text-white'
                            : 'text-[#111827]'
                      }`}
                    >
                      {cell.day}
                    </span>
                    <span
                      className={`mt-1 h-1.5 w-1.5 rounded-full ${
                        hasRedDot
                          ? 'bg-[#EF4444]'
                          : hasBlueDot
                            ? 'bg-[#2563EB]'
                            : 'bg-transparent'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          {selectedDate && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Citas disponibles el{' '}
                {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                  'es-PE',
                  { day: 'numeric', month: 'long' },
                )}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {loadingSlots ? (
                  <p className="col-span-full text-sm text-[#6B7280]">
                    Cargando horarios...
                  </p>
                ) : (
                  <>
                    {visibleSlots.length && !noDoctoresDisponibles ? (
                      visibleSlots.map((slot) => (
                        <button
                          className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                            selectedSlot?.time === slot.time
                              ? 'bg-[#1A3A6B] text-white shadow-sm'
                              : 'bg-gray-100 text-[#6B7280] hover:bg-blue-50 hover:text-[#2563EB]'
                          } ${!slot.available ? 'cursor-not-allowed opacity-50' : ''}`}
                          disabled={!slot.available}
                          key={slot.time}
                          onClick={() => setSelectedSlot(slot)}
                          type="button"
                        >
                          {slot.time}
                        </button>
                      ))
                    ) : !noDoctoresDisponibles ? (
                      <div className="col-span-full rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-[#6B7280]">
                        No hay horarios disponibles para este dia.
                      </div>
                    ) : (
                      <div className="col-span-full rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-[#6B7280]">
                        Selecciona otra fecha o cambia de especialidad.
                      </div>
                    )}
                  </>
                )}
              </div>
              <Button
                className="mt-6 w-full"
                disabled={!selectedSlot || noDoctoresDisponibles}
                onClick={() => setShowModal(true)}
              >
                Agendar cita
              </Button>
            </div>
          )}
        </Card>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card className="flex items-center gap-4 p-5" key={stat.label}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111827]">
                  {stat.value}
                </p>
                <p className="text-sm text-[#6B7280]">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <aside className="min-w-0">
        <h2 className="mb-4 text-xl font-bold text-[#1A3A6B]">
          Siguientes Citas
        </h2>
        <div className="space-y-4">
          {citasActivas.length ? (
            citasActivas.map((cita) => (
              <Card key={cita.id}>
                {/* Tarjeta de próxima cita pendiente. */}
                <div className="mb-5 flex items-center justify-between gap-3">
                  <Badge variant={ESTADO_BADGE_VARIANTS[cita.estado]}>
                    {cita.estado}
                  </Badge>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#2563EB]">
                    {formatAppointmentDate(cita.fecha)}
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                    <CalendarDays className="h-6 w-6 text-[#2563EB]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-[#111827]">
                      {cita.medico.especialidad.nombre}
                    </h3>
                    <p className="mt-1 flex items-center gap-2 text-sm text-[#6B7280]">
                      <User className="h-4 w-4 shrink-0" />
                      <span>
                        Dr. {cita.medico.usuario.nombre}{' '}
                        {cita.medico.usuario.apellido} /{' '}
                        {cita.medico.especialidad.nombre}
                      </span>
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-[#6B7280]">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>{cita.motivo || 'Sin motivo registrado'}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  {cita.estado === 'PENDIENTE' && (
                    <button
                      className="flex-1 rounded-full bg-blue-50 px-4 py-3 text-sm font-semibold text-[#2563EB] transition hover:bg-blue-100"
                      onClick={() => handleConfirmarEstadoCita(cita)}
                      type="button"
                    >
                      Confirmar cita
                    </button>
                  )}
                  <button
                    className="flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
                    onClick={() => handleOpenEdit(cita)}
                    type="button"
                  >
                    Modificar
                  </button>
                  <button
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#EF4444] transition hover:bg-red-100"
                    onClick={() => handleCancelarCita(cita)}
                    type="button"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-sm text-[#6B7280]">
                No tienes citas pendientes o confirmadas.
              </p>
            </Card>
          )}
        </div>
      </aside>

      <Modal
        isOpen={showEspecialidadModal}
        onClose={() => setShowEspecialidadModal(false)}
        title="Elegir especialidad"
      >
        <div className="space-y-3">
          <p className="text-sm text-[#6B7280]">
            Selecciona la especialidad para esta cita.
          </p>
          <div className="grid gap-3">
            {especialidades.map((especialidad) => (
              <button
                className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  especialidad.id === especialidadId
                    ? 'bg-[#1A3A6B] text-white shadow-sm'
                    : 'bg-gray-100 text-[#1A3A6B] hover:bg-blue-50'
                }`}
                key={especialidad.id}
                onClick={() => handleEspecialidadSelect(especialidad.id)}
                type="button"
              >
                {especialidad.nombre}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showNoDoctorsModal}
        onClose={() => setShowNoDoctorsModal(false)}
        title="Sin doctores disponibles"
      >
        <div className="space-y-5">
          <div className="rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-[#1A3A6B]">
            No hay doctores disponibles en esta especialidad por el momento.
          </div>
          <p className="text-sm leading-6 text-[#6B7280]">
            Puedes elegir otra fecha para la cita o cambiar la especialidad.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1"
              onClick={() => {
                setShowNoDoctorsModal(false)
                setSelectedDate(null)
                setSelectedSlot(null)
                setSlots([])
              }}
            >
              Elegir otra cita
            </Button>
            <button
              className="flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
              onClick={() => {
                setShowNoDoctorsModal(false)
                setShowEspecialidadModal(true)
              }}
              type="button"
            >
              Cambiar especialidad
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancelar cita"
      >
        <div className="space-y-5">
          <p className="text-sm leading-6 text-[#6B7280]">
            ¿Deseas cancelar esta cita?
          </p>
          {citaToCancel && (
            <div className="rounded-2xl bg-gray-50 p-4 text-sm text-[#6B7280]">
              <p>
                <span className="font-semibold text-[#111827]">Fecha:</span>{' '}
                {formatAppointmentDate(citaToCancel.fecha)}
              </p>
              <p className="mt-2">
                <span className="font-semibold text-[#111827]">Médico:</span>{' '}
                Dr. {citaToCancel.medico.usuario.nombre}{' '}
                {citaToCancel.medico.usuario.apellido}
              </p>
              <p className="mt-2">
                <span className="font-semibold text-[#111827]">
                  Especialidad:
                </span>{' '}
                {citaToCancel.medico.especialidad.nombre}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1 bg-[#EF4444] hover:bg-red-600" onClick={handleConfirmarCancelacion}>
              Sí, cancelar
            </Button>
            <button
              className="flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
              onClick={() => setShowCancelModal(false)}
              type="button"
            >
              No cancelar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modificar cita"
      >
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-sm font-semibold text-[#111827]">
              Especialidad
            </p>
            <div className="grid gap-3">
              {especialidades.map((especialidad) => (
                <button
                  className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    especialidad.id === editEspecialidadId
                      ? 'bg-[#1A3A6B] text-white shadow-sm'
                      : 'bg-gray-100 text-[#1A3A6B] hover:bg-blue-50'
                  }`}
                  key={especialidad.id}
                  onClick={() => handleEditEspecialidadChange(especialidad.id)}
                  type="button"
                >
                  {especialidad.nombre}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Fecha
            </span>
            <input
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#2563EB]"
              min={todayKey}
              onChange={(event) => handleEditDateChange(event.target.value)}
              type="date"
              value={editDate}
            />
          </label>

          <div>
            <p className="mb-3 text-sm font-semibold text-[#111827]">
              Horario
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {editLoadingSlots ? (
                <p className="col-span-full text-sm text-[#6B7280]">
                  Cargando horarios...
                </p>
              ) : (
                editSlots
                  .filter((slot) => !isPastSlotToday(editDate, slot.time))
                  .map((slot) => (
                    <button
                      className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                        editSlot?.time === slot.time
                          ? 'bg-[#1A3A6B] text-white shadow-sm'
                          : 'bg-gray-100 text-[#6B7280] hover:bg-blue-50 hover:text-[#2563EB]'
                      } ${!slot.available ? 'cursor-not-allowed opacity-50' : ''}`}
                      disabled={!slot.available}
                      key={slot.time}
                      onClick={() => setEditSlot(slot)}
                      type="button"
                    >
                      {slot.time}
                    </button>
                  ))
              )}
            </div>
          </div>

          {editSlot && (
            <div className="rounded-2xl bg-gray-50 p-4 text-sm text-[#6B7280]">
              <p>
                <span className="font-semibold text-[#111827]">Médico:</span>{' '}
                {editSlot.medicoNombre}
              </p>
              <p className="mt-2">
                <span className="font-semibold text-[#111827]">Hora:</span>{' '}
                {editSlot.time}
              </p>
            </div>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Motivo
            </span>
            <textarea
              className="min-h-24 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#2563EB]"
              onChange={(event) => setEditMotivo(event.target.value)}
              value={editMotivo}
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1"
              disabled={!editSlot}
              onClick={handleConfirmarEdicion}
            >
              Guardar cambios
            </Button>
            <button
              className="flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
              onClick={() => setShowEditModal(false)}
              type="button"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Confirmar cita"
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-gray-50 p-4 text-sm text-[#6B7280]">
            <p>
              <span className="font-semibold text-[#111827]">Fecha:</span>{' '}
              {selectedDate}
            </p>
            <p className="mt-2">
              <span className="font-semibold text-[#111827]">Hora:</span>{' '}
              {selectedSlot?.time}
            </p>
            <p className="mt-2">
              <span className="font-semibold text-[#111827]">Médico:</span>{' '}
              {selectedSlot?.medicoNombre}
            </p>
            <p className="mt-2">
              <span className="font-semibold text-[#111827]">
                Especialidad:
              </span>{' '}
              {especialidadActual}
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Motivo
            </span>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#2563EB]"
              onChange={(event) => setMotivo(event.target.value)}
              value={motivo}
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={handleConfirmarCita}>
              Confirmar
            </Button>
            <button
              className="flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
              onClick={() => setShowModal(false)}
              type="button"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PatientAppointments
