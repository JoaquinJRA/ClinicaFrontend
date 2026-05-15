import { useMemo, useState } from 'react'
import { Calendar, Clock, UserRound } from 'lucide-react'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Modal from '../../components/Modal'

const appointments = [
  {
    id: 'CIT-1401',
    date: '14 Abril 2026',
    time: '09:00 AM',
    patient: 'Carlos García',
    doctor: 'Dr. Marco Rivas',
    specialty: 'Medicina General',
    reason: 'Control general',
    status: 'Pendiente',
  }
]

const statusVariant = {
  Pendiente: 'pending',
  Confirmada: 'confirmed',
  Completada: 'completed',
  Cancelada: 'canceled',
}

function AdminAppointments() {
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
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A3A6B]">Citas</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Supervise citas, médicos asignados y especialidades.
        </p>
      </div>

      <Card className="mb-5">
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
          <Card className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_auto] xl:items-center" key={appointment.id}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[190px_1fr_220px_120px] lg:items-center">
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
                <p className="font-bold text-[#111827]">{appointment.patient}</p>
                <p className="mt-1 text-sm text-[#6B7280]">{appointment.id} · {appointment.reason}</p>
              </div>
              <div>
                <p className="flex items-center gap-2 font-semibold text-[#111827]">
                  <UserRound className="h-4 w-4 text-[#2563EB]" />
                  {appointment.doctor}
                </p>
                <p className="mt-1 text-sm text-[#6B7280]">{appointment.specialty}</p>
              </div>
              <Badge className="w-fit" variant={statusVariant[appointment.status]}>{appointment.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
                onClick={() => openModal('reschedule', appointment)}
                type="button"
              >
                Reprogramar
              </button>
              <button
                className="rounded-full bg-blue-50 px-4 py-3 text-sm font-semibold text-[#2563EB] transition hover:bg-blue-100"
                onClick={() => openModal('reassign', appointment)}
                type="button"
              >
                Reasignar
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
        <p className="mb-5 text-sm text-[#6B7280]">Nueva fecha visual para {selectedAppointment?.patient}.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input type="date" />
          <Input type="time" />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#6B7280]" onClick={closeModal} type="button">
            Cancelar
          </button>
          <Button onClick={closeModal} type="button">Guardar</Button>
        </div>
      </Modal>

      <Modal isOpen={modalType === 'reassign'} onClose={closeModal} title="Reasignar médico">
        <p className="mb-5 text-sm text-[#6B7280]">Seleccione un médico para {selectedAppointment?.patient}.</p>
        <select className="w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none">
          <option>Dra. Luz Salazar · Medicina General</option>
          <option>Dr. Marco Rivas · Neumología</option>
          <option>Dr. Luis Herrera · Traumatología</option>
          <option>Dra. Camila Torres · Gastroenterología</option>
        </select>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#6B7280]" onClick={closeModal} type="button">
            Cancelar
          </button>
          <Button onClick={closeModal} type="button">Reasignar</Button>
        </div>
      </Modal>

      <Modal isOpen={modalType === 'cancel'} onClose={closeModal} title="Cancelar cita">
        <p className="text-sm leading-6 text-[#6B7280]">
          ¿Desea cancelar la cita {selectedAppointment?.id}? Esta acción es solo visual.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#6B7280]" onClick={closeModal} type="button">
            Volver
          </button>
          <button className="rounded-full bg-[#EF4444] px-5 py-3 font-semibold text-white" onClick={closeModal} type="button">
            Cancelar cita
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default AdminAppointments
