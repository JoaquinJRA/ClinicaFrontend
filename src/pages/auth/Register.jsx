import { Link, useNavigate } from "react-router-dom";
import { PlusSquare } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Button from "../../components/Button";
import Input from "../../components/Input";
import PhoneVerificationModal from "../../components/PhoneVerificationModal";
import AuthLayout from "./AuthLayout";
import { registerRequest } from "../../api/auth.api";

const GENDER_OPTIONS = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMENINO", label: "Femenino" },
  { value: "OTRO", label: "Otro" },
];

const formatearTelefono = (tel) => {
  const limpio = String(tel || "").replace(/\D/g, "");
  return limpio.startsWith("51") ? `+${limpio}` : `+51${limpio}`;
};

function Register() {
  const navigate = useNavigate();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [telefonoVerificado, setTelefonoVerificado] = useState(false);
  const [telefonoFormateado, setTelefonoFormateado] = useState("");
  const [payloadPendiente, setPayloadPendiente] = useState(null);
  const [registrandoVerificado, setRegistrandoVerificado] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const telefonoActual = watch("telefono");

  const registrarPaciente = async (payload) => {
    try {
      setRegistrandoVerificado(true);
      await registerRequest({
        ...payload,
        telefono: telefonoFormateado || formatearTelefono(payload.telefono),
        telefonoVerificado: true,
      });
      toast.success("Cuenta creada correctamente.");
      navigate("/login");
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Error al registrar. Intente de nuevo.";
      toast.error(msg);
    } finally {
      setRegistrandoVerificado(false);
    }
  };

  const onSubmit = async ({ confirmarContrasena: _, ...payload }) => {
    if (!telefonoVerificado) {
      const telefono = formatearTelefono(payload.telefono);
      setTelefonoFormateado(telefono);
      setPayloadPendiente(payload);
      setShowPhoneModal(true);
      return;
    }

    await registrarPaciente(payload);
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-160 rounded-3xl bg-white p-10 shadow-xl"
      >
        <div className="mb-8">
          <div className="mb-7 flex items-center gap-3">
            <PlusSquare className="h-8 w-8 text-[#2563EB]" strokeWidth={2.5} />
            <span className="text-xl font-bold text-[#1A3A6B]">
              Clinica Luz
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A3A6B]">Crear Cuenta</h1>
          <p className="mt-3 text-sm leading-6 text-[#6B7280]">
            Complete sus datos y verifique su telefono para acceder al portal.
          </p>
        </div>

        <div className="space-y-5">
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
                placeholder="Garcia"
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
                  message: "El DNI debe tener 8 digitos.",
                },
              })}
            />
            {errors.dni && (
              <p className="mt-1 text-xs text-red-500">{errors.dni.message}</p>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Correo Electronico
            </span>
            <Input
              type="email"
              placeholder="paciente@ejemplo.com"
              {...register("email", {
                required: "El correo es obligatorio.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Ingrese un correo valido.",
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Telefono
            </span>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                className="flex-1"
                placeholder="+51 999 999 999"
                {...register("telefono", {
                  required: "El telefono es obligatorio.",
                  onChange: () => {
                    setTelefonoVerificado(false);
                    setTelefonoFormateado("");
                    setPayloadPendiente(null);
                  },
                })}
              />
              {telefonoVerificado && (
                <span className="inline-flex items-center justify-center rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                  Verificado
                </span>
              )}
            </div>
            {errors.telefono && (
              <p className="mt-1 text-xs text-red-500">
                {errors.telefono.message}
              </p>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Direccion
            </span>
            <Input placeholder="Av. Luz 123, Lima" {...register("direccion")} />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Fecha de nacimiento
              </span>
              <Input type="date" {...register("fechaNacimiento")} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Genero
              </span>
              <select
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                {...register("genero", { required: "Seleccione un genero." })}
              >
                <option value="">Seleccionar...</option>
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

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Contrasena
              </span>
              <Input
                type="password"
                placeholder="Ingrese su contrasena"
                {...register("contrasena", {
                  required: "La contrasena es obligatoria.",
                  minLength: { value: 6, message: "Minimo 6 caracteres." },
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
                Confirmar Contrasena
              </span>
              <Input
                type="password"
                placeholder="Repita su contrasena"
                {...register("confirmarContrasena", {
                  required: "Confirme su contrasena.",
                  validate: (val) =>
                    val === getValues("contrasena") ||
                    "Las contrasenas no coinciden.",
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

        <Button
          className="mt-8 w-full"
          type="submit"
          disabled={isSubmitting || registrandoVerificado}
        >
          {isSubmitting || registrandoVerificado
            ? "Registrando..."
            : "Registrarse ->"}
        </Button>

        <p className="mt-7 text-center text-sm text-[#6B7280]">
          Ya tiene una cuenta?{" "}
          <Link
            className="font-semibold text-[#2563EB] hover:text-[#1A3A6B]"
            to="/login"
          >
            Iniciar sesion
          </Link>
        </p>
      </form>

      {showPhoneModal && (
        <PhoneVerificationModal
          telefono={telefonoFormateado || formatearTelefono(telefonoActual)}
          onVerificado={async () => {
            setTelefonoVerificado(true);
            setShowPhoneModal(false);
            if (payloadPendiente) {
              await registrarPaciente(payloadPendiente);
              setPayloadPendiente(null);
            }
          }}
          onCerrar={() => setShowPhoneModal(false)}
        />
      )}
    </AuthLayout>
  );
}

export default Register;
