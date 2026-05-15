import { Link, NavLink } from 'react-router-dom'
import { LogOut, PlusSquare } from 'lucide-react'
import Button from './Button'

function Sidebar({
  actionLabel = '+ Nueva Cita',
  actionTo = '/patient/appointments',
  homeTo = '/patient/dashboard',
  items,
}) {
  return (
    <aside className="fixed left-0 top-0 z-20 flex w-full flex-col border-b border-gray-100 bg-white px-4 py-4 shadow-sm lg:h-screen lg:w-[220px] lg:border-b-0 lg:border-r lg:py-6">
      {/* Marca principal de Clínica Luz. */}
      <Link className="flex items-center gap-3 px-2 lg:mb-10" to={homeTo}>
        <PlusSquare className="h-8 w-8 text-[#2563EB]" strokeWidth={2.5} />
        <span className="text-lg font-bold text-[#1A3A6B]">Clínica Luz</span>
      </Link>

      {/* Navegación del rol activo. */}
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-0 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
        {items.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-blue-50 text-[#2563EB]'
                  : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#1A3A6B]'
              }`
            }
            key={item.to}
            to={item.to}
          >
            <item.icon className="h-5 w-5" strokeWidth={2.2} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 hidden space-y-4 lg:mt-auto lg:block">
        <Link className="block" to={actionTo}>
          <Button className="w-full px-4 py-3 text-sm">{actionLabel}</Button>
        </Link>
        <Link
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[#6B7280] transition hover:bg-gray-50 hover:text-[#EF4444]"
          to="/login"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </Link>
      </div>
    </aside>
  )
}

export default Sidebar
