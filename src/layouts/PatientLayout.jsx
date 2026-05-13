import { Outlet } from 'react-router-dom'
import { Calendar, History, LayoutDashboard, Pill } from 'lucide-react'
import Sidebar from '../components/Sidebar'

const patientNavItems = [
  { icon: LayoutDashboard, label: 'Resumen', to: '/patient/dashboard' },
  { icon: History, label: 'Historial Clínico', to: '/patient/history' },
  { icon: Calendar, label: 'Citas', to: '/patient/appointments' },
  { icon: Pill, label: 'Medicamentos', to: '/patient/medications' },
]

function PatientLayout() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-[#111827]">
      <Sidebar items={patientNavItems} />
      <main className="min-h-screen px-4 pb-6 pt-[150px] sm:px-6 lg:ml-[220px] lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default PatientLayout
