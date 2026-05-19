import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const ROLE_REDIRECT = {
  PACIENTE: "/patient/dashboard",
  MEDICO: "/doctor/dashboard",
  ADMIN: "/admin/dashboard",
};

function ProtectedRoute({ children, allowedRoles }) {
  const usuario = useAuthStore((s) => s.usuario);

  // No autenticado → login
  if (!usuario) return <Navigate to="/login" replace />;

  // Rol no permitido → redirige a su dashboard
  if (allowedRoles && !allowedRoles.includes(usuario.rol)) {
    return <Navigate to={ROLE_REDIRECT[usuario.rol] ?? "/login"} replace />;
  }

  return children;
}

export default ProtectedRoute;
