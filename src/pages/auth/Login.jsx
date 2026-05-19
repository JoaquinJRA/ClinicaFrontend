import { Link, useNavigate } from "react-router-dom";
import { PlusSquare } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import AuthLayout from "./AuthLayout";

function Login() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/patient/dashboard");
  };

  return (
    <AuthLayout>
      <form
        className="w-full max-w-140 rounded-3xl bg-white p-10 shadow-xl"
        onSubmit={handleSubmit}
      >
        {/* Encabezado de la tarjeta de acceso. */}
        <div className="mb-10">
          <div className="mb-8 flex items-center gap-3">
            <PlusSquare className="h-8 w-8 text-[#2563EB]" strokeWidth={2.5} />
            <span className="text-xl font-bold text-[#1A3A6B]">
              Clínica Luz
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A3A6B]">
            Bienvenido de Vuelta
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6B7280]">
            Inicie Sesión para acceder a sus citas y registros médicos.
          </p>
        </div>

        {/* Campos visuales del formulario. */}
        <div className="space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Correo Electrónico
            </span>
            <Input type="email" placeholder="paciente@ejemplo.com" />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center justify-between text-sm font-semibold text-[#111827]">
              Contraseña
              <a
                className="font-medium text-[#2563EB] hover:text-[#1A3A6B]"
                href="#recuperar"
              >
                ¿Olvidó su contraseña?
              </a>
            </span>
            <Input type="password" placeholder="Ingrese su contraseña" />
          </label>
        </div>

        <Button className="mt-8 w-full" type="submit">
          Iniciar sesión →
        </Button>

        <p className="mt-8 text-center text-sm text-[#6B7280]">
          ¿No tiene una cuenta?{" "}
          <Link
            className="font-semibold text-[#2563EB] hover:text-[#1A3A6B]"
            to="/register"
          >
            Registrarse
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;
