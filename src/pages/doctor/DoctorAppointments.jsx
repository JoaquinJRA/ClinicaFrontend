import { useMemo, useState } from 'react'
import { Calendar, Clock, User } from 'lucide-react'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Modal from '../../components/Modal'

const appointments = [
  {
    id: 'CL-1024',
    date: '14 Abril 2026',
    time: '09:00 AM',
    patient: 'Carlos García',
    reason: 'Control general y revisión de presión arterial.',
    status: 'Pendiente',
  },
]

const statusVariant = {
  Pendiente: 'pending',
  Confirmada: 'confirmed',
  Completada: 'completed',
  Cancelada: 'canceled',
}

function DoctorAppointments() {
  const [activeStatus, setActiveStatus] = useState('Todos')
  const [modalType, setModalType] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const filteredAppointments = useMemo(() => {
    if (activeStatus === 'Todos') return appointments
    return appointments.filter((appointment) => appointment.status === activeStatus)
  }, [activeStatus])

  const openModal = (type, appointment) => {
    setModalType(type)
    setSelectedAppointment(appointment)
  }

  const closeModal = () => {
    setModalType(null)
    setSelectedAppointment(null)
  }

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
            {['Todos', 'Pendiente', 'Confirmada', 'Completada', 'Cancelada'].map((status) => (
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeStatus === status
                    ? 'bg-[#1A3A6B] text-white'
                    : 'bg-gray-100 text-[#6B7280] hover:bg-blue-50 hover:text-[#2563EB]'
                }`}
                key={status}
                onClick={() => setActiveStatus(status)}
                type="button"
              >
                {status}
              </button>
            ))}
          </div>
          <div className="w-full xl:w-56">
            <Input type="date" />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <Card className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between" key={appointment.id}>
            <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-[210px_1fr_130px] md:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                  <Calendar className="h-6 w-6 text-[#2563EB]" />
                </div>
                <div>
                  <p className="font-bold text-[#111827]">{appointment.date}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-[#6B7280]">
                    <Clock className="h-4 w-4" />
                    {appointment.time}
                  </p>
                </div>
              </div>
              <div>
                <p className="flex items-center gap-2 font-bold text-[#111827]">
                  <User className="h-4 w-4 text-[#2563EB]" />
                  {appointment.patient}
                </p>
                <p className="mt-1 text-sm font-medium text-[#6B7280]">{appointment.id}</p>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">{appointment.reason}</p>
              </div>
              <Badge className="w-fit" variant={statusVariant[appointment.status]}>
                {appointment.status}
              </Badge>
            </div>

            <div className="flex gap-3">
              <button
                className="rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
                onClick={() => openModal('reschedule', appointment)}
                type="button"
              >
                Reprogramar
              </button>
              <button
                className="rounded-full bg-red-50 px-4 py-3 text-sm font-semibold text-[#EF4444] transition hover:bg-red-100"
                onClick={() => openModal('cancel', appointment)}
                type="button"
              >
                Cancelar
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={modalType === 'reschedule'} onClose={closeModal} title="Reprogramar cita">
        <p className="mb-5 text-sm leading-6 text-[#6B7280]">
          Seleccione una nueva fecha visual para la cita de {selectedAppointment?.patient}.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#111827]">Nueva fecha</span>
            <Input type="date" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#111827]">Nuevo horario</span>
            <Input type="time" />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#6B7280]" onClick={closeModal} type="button">
            Cancelar
          </button>
          <Button onClick={closeModal} type="button">Guardar cambio</Button>
        </div>
      </Modal>

      <Modal isOpen={modalType === 'cancel'} onClose={closeModal} title="Cancelar cita">
        <p className="text-sm leading-6 text-[#6B7280]">
          ¿Desea cancelar la cita de {selectedAppointment?.patient}? Esta acción es solo visual y no modifica registros reales.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#6B7280]" onClick={closeModal} type="button">
            Volver
          </button>
          <button className="rounded-full bg-[#EF4444] px-5 py-3 font-semibold text-white" onClick={closeModal} type="button">
            Eliminar cita
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default DoctorAppointments
