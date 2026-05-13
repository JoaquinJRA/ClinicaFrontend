import { Navigate, Route, Routes } from 'react-router-dom'
import PatientLayout from './layouts/PatientLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import PatientAppointments from './pages/patient/PatientAppointments'
import PatientDashboard from './pages/patient/PatientDashboard'
import PatientHistory from './pages/patient/PatientHistory'
import PatientMedications from './pages/patient/PatientMedications'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/patient" element={<PatientLayout />}>
        <Route index element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="history" element={<PatientHistory />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="medications" element={<PatientMedications />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
