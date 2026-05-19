import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import DoctorLayout from "./layouts/DoctorLayout";
import PatientLayout from "./layouts/PatientLayout";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminUsers from "./pages/admin/AdminUsers";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorDiagnosis from "./pages/doctor/DoctorDiagnosis";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientHistory from "./pages/patient/PatientHistory";
import PatientMedications from "./pages/patient/PatientMedications";
import ProtectedRoute from "./router/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={["PACIENTE"]}>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="history" element={<PatientHistory />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="medications" element={<PatientMedications />} />
      </Route>
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={["PACIENTE"]}>
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/doctor/appointments" replace />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="prescriptions" element={<DoctorPrescriptions />} />
        <Route path="diagnosis" element={<DoctorDiagnosis />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["PACIENTE"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/users" replace />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="audit" element={<AdminAudit />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
