import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Calendar, Clock, Flame, TrendingUp, UserRound } from 'lucide-react'
import api from '../../api/axios'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Modal from '../../components/Modal'

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

const estadoMap = {
  Todos: '',
  Pendiente: 'PENDIENTE',
  Confirmada: 'CONFIRMADA',
  Completada: 'COMPLETADA',
  Cancelada: 'CANCELADA',
}

const statusVariant = {
  PENDIENTE: 'pending',
  CONFIRMADA: 'confirmed',
  COMPLETADA: 'completed',
  CANCELADA: 'canceled',
}

const statusLabel = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
}

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

const monthName = (year, month) =>
  new Date(year, month - 1, 1).toLocaleString('es-PE', { month: 'long' })

const heatColor = (ocupacion) => {
  if (ocupacion >= 70) return 'bg-red-500 text-white'
  if (ocupacion >= 35) return 'bg-amber-400 text-[#111827]'
  if (ocupacion > 0) return 'bg-blue-500 text-white'
  return 'bg-gray-100 text-[#6B7280]'
}

function AdminAppointments() {
  const hoy = new Date()
  const [citas, setCitas] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [ocupacion, setOcupacion] = useState(null)
  const [ocupacionYear, setOcupacionYear] = useState(hoy.getFullYear())
  const [ocupacionMonth, setOcupacionMonth] = useState(hoy.getMonth() + 1)
  const [showRep, setShowRep] = useState(false)
  const [showReas, setShowReas] = useState(false)
  const [citaSel, setCitaSel] = useState(null)
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [nuevaHora, setNuevaHora] = useState('')
  const [nuevoMedicoId, setNuevoMedicoId] = useState('')
  const [medicosDisp, setMedicosDisp] = useState([])

  const fetchCitas = useCallback(async () => {
    const res = await api.get('/admin/citas', {
      params: {
        ...(estadoMap[filtroEstado] && { estado: estadoMap[filtroEstado] }),
        ...(filtroFecha && { fecha: filtroFecha }),
      },
    })
    setCitas(res.data)
  }, [filtroEstado, filtroFecha])

  const fetchOcupacion = useCallback(async () => {
    const res = await api.get('/admin/ocupacion-medica', {
      params: { year: ocupacionYear, month: ocupacionMonth },
    })
    setOcupacion(res.data)
  }, [ocupacionMonth, ocupacionYear])

  useEffect(() => {
    fetchCitas()
  }, [fetchCitas])

  useEffect(() => {
    fetchOcupacion()
  }, [fetchOcupacion])

  const cambiarMesOcupacion = (delta) => {
    const next = new Date(Date.UTC(ocupacionYear, ocupacionMonth - 1 + delta, 1))
    setOcupacionYear(next.getUTCFullYear())
    setOcupacionMonth(next.getUTCMonth() + 1)
  }

  const handleCancelar = async (id) => {
    if (!confirm('¿Cancelar esta cita?')) return

    await api.put(`/admin/citas/${id}/estado`, { estado: 'CANCELADA' })
    await fetchCitas()
  }

  const handleCompletar = async (id) => {
    if (!confirm('¿Marcar esta cita como completada?')) return

    await api.put(`/admin/citas/${id}/estado`, { estado: 'COMPLETADA' })
    await fetchCitas()
  }

  const abrirReprogramar = (cita) => {
    setCitaSel(cita)
    setNuevaFecha(cita.fecha.slice(0, 10))
    setNuevaHora('')
    setShowRep(true)
  }

  const handleReprogramar = async () => {
    if (!citaSel || !nuevaFecha || !nuevaHora) return

    await api.put(`/admin/citas/${citaSel.id}/reprogramar`, {
      nuevaFecha,
      nuevaHora,
    })
    setShowRep(false)
    setCitaSel(null)
    setNuevaFecha('')
    setNuevaHora('')
    await fetchCitas()
  }

  const abrirReasignar = async (cita) => {
    const res = await api.get('/admin/medicos', {
      params: { especialidadId: cita.medico.especialidadId },
    })
    setMedicosDisp(res.data)
    setNuevoMedicoId('')
    setCitaSel(cita)
    setShowReas(true)
  }

  const handleReasignar = async () => {
    if (!citaSel || !nuevoMedicoId) return

    try {
      await api.put(`/admin/citas/${citaSel.id}/reasignar`, {
        medicoId: Number(nuevoMedicoId),
      })
      setShowReas(false)
      setCitaSel(null)
      setNuevoMedicoId('')
      await fetchCitas()
    } catch (err) {
      if (err.response?.status === 409) {
        alert('El médico seleccionado ya tiene una cita en ese horario')
        return
      }
      throw err
    }
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A3A6B]">Citas</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Supervise citas, médicos asignados y especialidades.
        </p>
      </div>

      <Card className="mb-5">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#2563EB]">
              Dashboard de ocupacion medica
            </p>
            <h2 className="mt-1 text-2xl font-bold capitalize text-[#1A3A6B]">
              {monthName(ocupacionYear, ocupacionMonth)} {ocupacionYear}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
              onClick={() => cambiarMesOcupacion(-1)}
              type="button"
            >
              Anterior
            </button>
            <button
              className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
              onClick={() => cambiarMesOcupacion(1)}
              type="button"
            >
              Siguiente
            </button>
          </div>
        </div>

        {ocupacion && (
          <>
            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase text-[#6B7280]">Ocupacion</p>
                <p className="mt-2 text-3xl font-bold text-[#1A3A6B]">{ocupacion.resumen.ocupacionGeneral}%</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase text-[#6B7280]">Citas del mes</p>
                <p className="mt-2 text-3xl font-bold text-[#111827]">{ocupacion.resumen.totalCitas}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase text-[#6B7280]">Medicos activos</p>
                <p className="mt-2 text-3xl font-bold text-[#111827]">{ocupacion.resumen.totalMedicos}</p>
              </div>
              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-bold uppercase text-[#6B7280]">Sin medicos</p>
                <p className="mt-2 text-3xl font-bold text-red-600">{ocupacion.resumen.especialidadesSinMedicos.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-bold text-[#111827]">Demanda diaria</p>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#6B7280]">
                    <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-blue-500" /> Baja</span>
                    <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-400" /> Media</span>
                    <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-500" /> Alta</span>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {ocupacion.dias.map((dia) => (
                    <div
                      className={`rounded-xl p-2 text-center text-xs font-bold ${heatColor(dia.ocupacion)}`}
                      key={dia.fecha}
                      title={`${dia.fecha}: ${dia.slotsOcupados}/${dia.totalSlots} slots (${dia.ocupacion}%)`}
                    >
                      <p>{Number(dia.fecha.slice(-2))}</p>
                      <p className="mt-1 text-[10px] opacity-80">{dia.ocupacion}%</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="mb-3 flex items-center gap-2 font-bold text-[#111827]">
                    <Flame className="h-5 w-5 text-red-500" />
                    Horarios mas ocupados
                  </p>
                  <div className="space-y-3">
                    {ocupacion.horarios.slice(0, 5).map((slot) => (
                      <div key={slot.hora}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-semibold text-[#111827]">{slot.hora}</span>
                          <span className="text-[#6B7280]">{slot.total} citas</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div className="h-2 rounded-full bg-[#2563EB]" style={{ width: `${Math.min(slot.ocupacion, 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="mb-3 flex items-center gap-2 font-bold text-[#111827]">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Especialidades sin medicos
                  </p>
                  {ocupacion.resumen.especialidadesSinMedicos.length ? (
                    <div className="flex flex-wrap gap-2">
                      {ocupacion.resumen.especialidadesSinMedicos.map((item) => (
                        <Badge key={item.id} variant="mild">{item.nombre}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#6B7280]">Todas tienen al menos un medico activo.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="mb-3 flex items-center gap-2 font-bold text-[#111827]">
                  <TrendingUp className="h-5 w-5 text-[#2563EB]" />
                  Ocupacion por especialidad
                </p>
                <div className="space-y-3">
                  {ocupacion.especialidades.map((item) => (
                    <div key={item.id}>
                      <div className="mb-1 flex justify-between gap-3 text-sm">
                        <span className="font-semibold text-[#111827]">{item.nombre}</span>
                        <span className="text-[#6B7280]">{item.citas}/{item.totalSlots} slots</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <div className={`h-2 rounded-full ${item.sinMedicos ? 'bg-red-400' : 'bg-[#2563EB]'}`} style={{ width: `${Math.min(item.ocupacion, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="mb-3 font-bold text-[#111827]">Medicos con pocos turnos</p>
                <div className="space-y-3">
                  {ocupacion.resumen.medicosConPocosTurnos.slice(0, 6).map((medico) => (
                    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3" key={medico.id}>
                      <div>
                        <p className="font-semibold text-[#111827]">Dr. {medico.nombre}</p>
                        <p className="text-sm text-[#6B7280]">{medico.especialidad}</p>
                      </div>
                      <Badge variant="neutral">{medico.citas} citas</Badge>
                    </div>
                  ))}
                  {!ocupacion.resumen.medicosConPocosTurnos.length && (
                    <p className="text-sm text-[#6B7280]">No hay medicos con baja asignacion este mes.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      <Card className="mb-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {Object.keys(estadoMap).map((status) => (
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filtroEstado === status
                    ? 'bg-[#1A3A6B] text-white'
                    : 'bg-gray-100 text-[#6B7280] hover:bg-blue-50 hover:text-[#2563EB]'
                }`}
                key={status}
                onClick={() => setFiltroEstado(status)}
                type="button"
              >
                {status}
              </button>
            ))}
          </div>
          <div className="w-full xl:w-56">
            <Input
              onChange={(event) => setFiltroFecha(event.target.value)}
              type="date"
              value={filtroFecha}
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {citas.map((cita) => (
          <Card className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_auto] xl:items-center" key={cita.id}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[190px_1fr_220px_120px] lg:items-center">
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
                <p className="font-bold text-[#111827]">
                  {cita.paciente.usuario.nombre} {cita.paciente.usuario.apellido}
                </p>
                <p className="mt-1 text-sm text-[#6B7280]">
                  CIT-{cita.id} · {cita.motivo || 'Sin motivo registrado'}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-2 font-semibold text-[#111827]">
                  <UserRound className="h-4 w-4 text-[#2563EB]" />
                  Dr. {cita.medico.usuario.nombre} {cita.medico.usuario.apellido}
                </p>
                <p className="mt-1 text-sm text-[#6B7280]">
                  {cita.medico.especialidad.nombre}
                </p>
              </div>
              <Badge className="w-fit" variant={statusVariant[cita.estado]}>
                {statusLabel[cita.estado]}
              </Badge>
            </div>
            {!['CANCELADA', 'COMPLETADA'].includes(cita.estado) && (
              <div className="flex flex-wrap gap-3">
                <button
                  className="rounded-full bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                  onClick={() => handleCompletar(cita.id)}
                  type="button"
                >
                  Completar
                </button>
                <button
                  className="rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
                  onClick={() => abrirReprogramar(cita)}
                  type="button"
                >
                  Reprogramar
                </button>
                <button
                  className="rounded-full bg-blue-50 px-4 py-3 text-sm font-semibold text-[#2563EB] transition hover:bg-blue-100"
                  onClick={() => abrirReasignar(cita)}
                  type="button"
                >
                  Reasignar
                </button>
                <button
                  className="rounded-full bg-red-50 px-4 py-3 text-sm font-semibold text-[#EF4444] transition hover:bg-red-100"
                  onClick={() => handleCancelar(cita.id)}
                  type="button"
                >
                  Cancelar
                </button>
              </div>
            )}
          </Card>
        ))}
        {!citas.length && (
          <Card>
            <p className="text-sm text-[#6B7280]">
              No hay citas para los filtros seleccionados.
            </p>
          </Card>
        )}
      </div>

      <Modal isOpen={showRep} onClose={() => setShowRep(false)} title="Reprogramar cita">
        <p className="mb-5 text-sm text-[#6B7280]">
          Nueva fecha para {citaSel?.paciente.usuario.nombre} {citaSel?.paciente.usuario.apellido}.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            onChange={(event) => setNuevaFecha(event.target.value)}
            type="date"
            value={nuevaFecha}
          />
          <select
            className="w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none"
            onChange={(event) => setNuevaHora(event.target.value)}
            value={nuevaHora}
          >
            <option value="">Seleccionar hora</option>
            {SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#6B7280]" onClick={() => setShowRep(false)} type="button">
            Cancelar
          </button>
          <Button onClick={handleReprogramar} type="button">Guardar</Button>
        </div>
      </Modal>

      <Modal isOpen={showReas} onClose={() => setShowReas(false)} title="Reasignar médico">
        <p className="mb-5 text-sm text-[#6B7280]">
          Seleccione un médico para {citaSel?.paciente.usuario.nombre} {citaSel?.paciente.usuario.apellido}.
        </p>
        <select
          className="w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none"
          onChange={(event) => setNuevoMedicoId(event.target.value)}
          value={nuevoMedicoId}
        >
          <option value="">Seleccionar médico</option>
          {medicosDisp.map((medico) => (
            <option key={medico.id} value={medico.id}>
              Dr. {medico.usuario.nombre} {medico.usuario.apellido}
            </option>
          ))}
        </select>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#6B7280]" onClick={() => setShowReas(false)} type="button">
            Cancelar
          </button>
          <Button onClick={handleReasignar} type="button">Reasignar</Button>
        </div>
      </Modal>
    </div>
  )
}

export default AdminAppointments
