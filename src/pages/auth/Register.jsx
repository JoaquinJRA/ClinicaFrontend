import { Link } from 'react-router-dom'
import { PlusSquare } from 'lucide-react'
import Button from '../../components/Button'
import Input from '../../components/Input'
import AuthLayout from './AuthLayout'

function Register() {
  return (
    <AuthLayout>
      <form className="w-full max-w-[640px] rounded-3xl bg-white p-10 shadow-xl">
        {/* Encabezado de la tarjeta de registro. */}
        <div className="mb-8">
          <div className="mb-7 flex items-center gap-3">
            <PlusSquare className="h-8 w-8 text-[#2563EB]" strokeWidth={2.5} />
            <span className="text-xl font-bold text-[#1A3A6B]">Clínica Luz</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A3A6B]">Crear Cuenta</h1>
          <p className="mt-3 text-sm leading-6 text-[#6B7280]">
            Complete sus datos para acceder al portal.
          </p>
        </div>

        {/* Campos visuales de alta del paciente. */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">Nombre</span>
              <Input placeholder="Carlos" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">Apellido</span>
              <Input placeholder="García" />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">DNI</span>
            <Input placeholder="12345678" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">Correo Electrónico</span>
            <Input type="email" placeholder="paciente@ejemplo.com" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">Teléfono</span>
            <Input placeholder="+51 999 999 999" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">Dirección</span>
            <Input placeholder="Av. Luz 123, Lima" />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">Contraseña</span>
              <Input type="password" placeholder="Ingrese su contraseña" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">Confirmar Contraseña</span>
              <Input type="password" placeholder="Repita su contraseña" />
            </label>
          </div>
        </div>

        <Button className="mt-8 w-full" type="button">
          Registrarse →
        </Button>

        <p className="mt-7 text-center text-sm text-[#6B7280]">
          ¿Ya tiene una cuenta?{' '}
          <Link className="font-semibold text-[#2563EB] hover:text-[#1A3A6B]" to="/login">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default Register
