import { Check, Eye, Search } from 'lucide-react'
import Badge from '../../components/Badge'
import Card from '../../components/Card'
import Input from '../../components/Input'

const kpis = [
  { label: 'Total recaudado', value: 'S/ 12,450' },
  { label: 'Pagos pendientes', value: '8' },
  { label: 'Pagos cancelados', value: '2' },
]

const payments = [
  {
    patient: 'Carlos García',
    appointmentId: 'CIT-1401',
    type: 'Consulta General',
    amount: 'S/ 120',
    status: 'Pendiente',
    date: '14/04/2026',
  },
]

const paymentVariant = {
  Pendiente: 'pending',
  Pagado: 'confirmed',
  Cancelado: 'canceled',
}

function AdminPayments() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A3A6B]">Gestión de Pagos</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Controle estados de pago y montos por cita registrada.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map((item) => (
          <Card key={item.label}>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-[#1A3A6B]">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-5">
        {/* Filtros visuales de pagos. */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_190px_190px_190px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <Input className="pl-12" placeholder="Buscar paciente o ID de cita" />
          </div>
          <select className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none">
            <option>Todos los estados</option>
            <option>Pendiente</option>
            <option>Pagado</option>
            <option>Cancelado</option>
          </select>
          <Input type="date" />
          <Input type="date" />
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">ID Cita</th>
                <th className="px-6 py-4">Tipo de consulta</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <tr className="bg-white" key={payment.appointmentId}>
                  <td className="px-6 py-4 font-semibold text-[#111827]">{payment.patient}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{payment.appointmentId}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{payment.type}</td>
                  <td className="px-6 py-4 font-bold text-[#111827]">{payment.amount}</td>
                  <td className="px-6 py-4">
                    <Badge variant={paymentVariant[payment.status]}>{payment.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{payment.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[#2563EB]" type="button">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-700" type="button">
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default AdminPayments
