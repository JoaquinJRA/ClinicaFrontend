import { Search } from 'lucide-react'
import Card from '../../components/Card'
import Input from '../../components/Input'

const auditRows = [
  {
    user: 'Andrea Castillo',
    role: 'Administrador',
    action: 'Editó información de usuario',
    module: 'Usuarios',
    date: '15/05/2026 09:12 AM',
  },
  {
    user: 'Dra. Luz Salazar',
    role: 'Médico',
    action: 'Accedió al historial clínico',
    module: 'Historial',
    date: '15/05/2026 09:40 AM',
  },
  {
    user: 'Carlos García',
    role: 'Paciente',
    action: 'Inició sesión',
    module: 'Autenticación',
    date: '15/05/2026 10:05 AM',
  },
  {
    user: 'Luis Herrera',
    role: 'Administrador',
    action: 'Eliminó registro de cita',
    module: 'Citas',
    date: '15/05/2026 10:22 AM',
  },
  {
    user: 'Dr. Marco Rivas',
    role: 'Médico',
    action: 'Emitió prescripción',
    module: 'Prescripciones',
    date: '15/05/2026 11:08 AM',
  },
  {
    user: 'María Ruiz',
    role: 'Paciente',
    action: 'Consultó estado de pago',
    module: 'Pagos',
    date: '15/05/2026 11:37 AM',
  },
]

function AdminAudit() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A3A6B]">Registro de Auditoría</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Revise accesos, cambios y acciones relevantes del portal.
        </p>
      </div>

      <Card className="mb-5">
        {/* Filtros visuales de auditoría. */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_190px_190px_190px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <Input className="pl-12" placeholder="Buscar por usuario" />
          </div>
          <select className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none">
            <option>Todas las acciones</option>
            <option>Inicio de sesión</option>
            <option>Edición</option>
            <option>Eliminación</option>
            <option>Consulta</option>
          </select>
          <Input type="date" />
          <Input type="date" />
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Acción realizada</th>
                <th className="px-6 py-4">Módulo</th>
                <th className="px-6 py-4">Fecha y hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {auditRows.map((row) => (
                <tr className="bg-white" key={`${row.user}-${row.date}`}>
                  <td className="px-6 py-4 font-semibold text-[#111827]">{row.user}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{row.role}</td>
                  <td className="px-6 py-4 text-sm text-[#111827]">{row.action}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#2563EB]">{row.module}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default AdminAudit
