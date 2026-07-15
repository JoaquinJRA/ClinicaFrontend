import { Outlet } from "react-router-dom";
import { Calendar, ClipboardList, Stethoscope } from "lucide-react";
import Sidebar from "../components/Sidebar";

const doctorNavItems = [
  { icon: Calendar, label: "Mis Citas", to: "/doctor/appointments" },
  { icon: ClipboardList, label: "Prescripciones", to: "/doctor/prescriptions" },
  { icon: Stethoscope, label: "Diagnósticos", to: "/doctor/diagnosis" },
];

function DoctorLayout() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-[#111827]">
      <Sidebar
        homeTo="/doctor/appointments"
        items={doctorNavItems}
      />
      <main className="min-h-screen px-4 pb-6 pt-34.5 sm:px-6 lg:ml-55 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default DoctorLayout;
