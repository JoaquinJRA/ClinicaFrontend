import { Link, useNavigate } from "react-router-dom";
import { PlusSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Button from "../../components/Button";
import Input from "../../components/Input";
import AuthLayout from "./AuthLayout";
import { registerRequest } from "../../api/auth.api";

const GENDER_OPTIONS = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMENINO", label: "Femenino" },
  { value: "OTRO", label: "Otro" },
];

function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  // eslint-disable-next-line no-unused-vars
  const onSubmit = async ({ confirmarContrasena: _, ...payload }) => {
    try {
      await registerRequest(payload);
      toast.success("¡Cuenta creada correctamente!");
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Error al registrar. Intente de nuevo.";
      toast.error(msg);
    }
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-160 rounded-3xl bg-white p-10 shadow-xl"
      >
        {/* Encabezado */}
        <div className="mb-8">
          <div className="mb-7 flex items-center gap-3">
            <PlusSquare className="h-8 w-8 text-[#2563EB]" strokeWidth={2.5} />
            <span className="text-xl font-bold text-[#1A3A6B]">
              Clínica Luz
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A3A6B]">Crear Cuenta</h1>
          <p className="mt-3 text-sm leading-6 text-[#6B7280]">
            Complete sus datos para acceder al portal.
          </p>
        </div>

        <div className="space-y-5">
          {/* Nombre / Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Nombre
              </span>
              <Input
                placeholder="Carlos"
                {...register("nombre", {
                  required: "El nombre es obligatorio.",
                })}
              />
              {errors.nombre && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.nombre.message}
                </p>
              )}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Apellido
              </span>
              <Input
                placeholder="García"
                {...register("apellido", {
                  required: "El apellido es obligatorio.",
                })}
              />
              {errors.apellido && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.apellido.message}
                </p>
              )}
            </label>
          </div>

          {/* DNI */}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              DNI
            </span>
            <Input
              placeholder="12345678"
              {...register("dni", {
                required: "El DNI es obligatorio.",
                pattern: {
                  value: /^\d{8}$/,
                  message: "El DNI debe tener 8 dígitos.",
                },
              })}
            />
            {errors.dni && (
              <p className="mt-1 text-xs text-red-500">{errors.dni.message}</p>
            )}
          </label>

          {/* Email */}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Correo Electrónico
            </span>
            <Input
              type="email"
              placeholder="paciente@ejemplo.com"
              {...register("email", {
                required: "El correo es obligatorio.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Ingrese un correo válido.",
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </label>

          {/* Teléfono */}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Teléfono
            </span>
            <Input placeholder="+51 999 999 999" {...register("telefono")} />
          </label>

          {/* Dirección */}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Dirección
            </span>
            <Input placeholder="Av. Luz 123, Lima" {...register("direccion")} />
          </label>

          {/* Fecha de nacimiento / Género */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Fecha de nacimiento
              </span>
              <Input type="date" {...register("fechaNacimiento")} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Género
              </span>
              <select
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                {...register("genero", { required: "Seleccione un género." })}
              >
                <option value="">Seleccionar…</option>
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {errors.genero && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.genero.message}
                </p>
              )}
            </label>
          </div>

          {/* Contraseña / Confirmar */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Contraseña
              </span>
              <Input
                type="password"
                placeholder="Ingrese su contraseña"
                {...register("contrasena", {
                  required: "La contraseña es obligatoria.",
                  minLength: { value: 6, message: "Mínimo 6 caracteres." },
                })}
              />
              {errors.contrasena && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.contrasena.message}
                </p>
              )}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Confirmar Contraseña
              </span>
              <Input
                type="password"
                placeholder="Repita su contraseña"
                {...register("confirmarContrasena", {
                  required: "Confirme su contraseña.",
                  validate: (val) =>
                    val === getValues("contrasena") ||
                    "Las contraseñas no coinciden.",
                })}
              />
              {errors.confirmarContrasena && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmarContrasena.message}
                </p>
              )}
            </label>
          </div>
        </div>

        <Button className="mt-8 w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registrando…" : "Registrarse →"}
        </Button>

        <p className="mt-7 text-center text-sm text-[#6B7280]">
          ¿Ya tiene una cuenta?{" "}
          <Link
            className="font-semibold text-[#2563EB] hover:text-[#1A3A6B]"
            to="/login"
          >
            Iniciar sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Register;
