import { Outlet } from "react-router-dom";
import { Calendar, CreditCard, ShieldCheck, Users } from "lucide-react";
import Sidebar from "../components/Sidebar";

const adminNavItems = [
  { icon: Users, label: "Usuarios", to: "/admin/users" },
  { icon: Calendar, label: "Citas", to: "/admin/appointments" },
  { icon: CreditCard, label: "Pagos", to: "/admin/payments" },
  { icon: ShieldCheck, label: "Auditoría", to: "/admin/audit" },
];

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-[#111827]">
      <Sidebar
        actionLabel="+ Agregar Usuario"
        actionTo="/admin/users"
        homeTo="/admin/users"
        items={adminNavItems}
      />
      <main className="min-h-screen px-4 pb-6 pt-37.5 sm:px-6 lg:ml-55 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
