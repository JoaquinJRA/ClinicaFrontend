import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Fingerprint,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PhoneVerificationModal from "../../components/PhoneVerificationModal";
import AuthLayout from "./AuthLayout";
import { registerRequest } from "../../api/auth.api";

const GENDER_OPTIONS = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMENINO", label: "Femenino" },
  { value: "OTRO", label: "Otro" },
];

const inputBase =
  "w-full rounded-[1.2rem] border border-transparent bg-[#F2F5F9] py-3.5 pl-11 pr-4 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10";

const labelClass =
  "mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#64748B]";

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

  const FieldIcon = ({ icon: Icon }) => (
    <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2563EB]" />
  );

  return (
    <AuthLayout mode="register">
      <form
        className="relative w-full max-w-[48rem] overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.18)] backdrop-blur md:p-8"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="absolute right-0 top-0 h-36 w-36 rounded-bl-[5rem] bg-[#DBEAFE]" />
        <div className="relative mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#EAF2FF] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#1A3A6B]">
              Nuevo paciente
            </div>
            <h1 className="text-4xl font-black leading-tight text-[#102A52]">
              Cree su acceso clinico.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#64748B]">
              Complete sus datos personales. Al presionar registrar,
              verificaremos su telefono por SMS antes de guardar la cuenta.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-[1.25rem] border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-black text-[#102A52]">
            <ShieldCheck className="h-5 w-5 text-[#2563EB]" />
            {telefonoVerificado ? "Telefono verificado" : "SMS pendiente"}
          </div>
        </div>

        <div className="relative grid gap-4">
          <section className="rounded-[1.6rem] border border-[#E2E8F0] bg-white/80 p-4">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#2563EB]">
              Identidad
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label>
                <span className={labelClass}>Nombre</span>
                <div className="relative">
                  <FieldIcon icon={UserRound} />
                  <input
                    className={inputBase}
                    placeholder="Carlos"
                    {...register("nombre", {
                      required: "El nombre es obligatorio.",
                    })}
                  />
                </div>
                {errors.nombre && (
                  <p className="mt-2 text-xs font-semibold text-red-500">
                    {errors.nombre.message}
                  </p>
                )}
              </label>

              <label>
                <span className={labelClass}>Apellido</span>
                <div className="relative">
                  <FieldIcon icon={UserRound} />
                  <input
                    className={inputBase}
                    placeholder="Garcia"
                    {...register("apellido", {
                      required: "El apellido es obligatorio.",
                    })}
                  />
                </div>
                {errors.apellido && (
                  <p className="mt-2 text-xs font-semibold text-red-500">
                    {errors.apellido.message}
                  </p>
                )}
              </label>

              <label>
                <span className={labelClass}>DNI</span>
                <div className="relative">
                  <FieldIcon icon={Fingerprint} />
                  <input
                    className={inputBase}
                    placeholder="12345678"
                    {...register("dni", {
                      required: "El DNI es obligatorio.",
                      pattern: {
                        value: /^\d{8}$/,
                        message: "El DNI debe tener 8 digitos.",
                      },
                    })}
                  />
                </div>
                {errors.dni && (
                  <p className="mt-2 text-xs font-semibold text-red-500">
                    {errors.dni.message}
                  </p>
                )}
              </label>

              <label>
                <span className={labelClass}>Genero</span>
                <select
                  className="w-full rounded-[1.2rem] border border-transparent bg-[#F2F5F9] px-4 py-3.5 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
                  {...register("genero", { required: "Seleccione un genero." })}
                >
                  <option value="">Seleccionar...</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.genero && (
                  <p className="mt-2 text-xs font-semibold text-red-500">
                    {errors.genero.message}
                  </p>
                )}
              </label>
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-[#E2E8F0] bg-white/80 p-4">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#2563EB]">
              Contacto
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label>
                <span className={labelClass}>Correo electronico</span>
                <div className="relative">
                  <FieldIcon icon={Mail} />
                  <input
                    className={inputBase}
                    placeholder="paciente@ejemplo.com"
                    type="email"
                    {...register("email", {
                      required: "El correo es obligatorio.",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Ingrese un correo valido.",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-xs font-semibold text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </label>

              <label>
                <span className={labelClass}>Telefono</span>
                <div className="relative">
                  <FieldIcon icon={Phone} />
                  <input
                    className={`${inputBase} ${telefonoVerificado ? "pr-28" : ""}`}
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
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                      Verificado
                    </span>
                  )}
                </div>
                {errors.telefono && (
                  <p className="mt-2 text-xs font-semibold text-red-500">
                    {errors.telefono.message}
                  </p>
                )}
              </label>

              <label className="md:col-span-2">
                <span className={labelClass}>Direccion</span>
                <div className="relative">
                  <FieldIcon icon={MapPin} />
                  <input
                    className={inputBase}
                    placeholder="Av. Luz 123, Lima"
                    {...register("direccion")}
                  />
                </div>
              </label>
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-[#E2E8F0] bg-white/80 p-4">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#2563EB]">
              Acceso
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label>
                <span className={labelClass}>Nacimiento</span>
                <div className="relative">
                  <FieldIcon icon={CalendarDays} />
                  <input
                    className={inputBase}
                    type="date"
                    {...register("fechaNacimiento")}
                  />
                </div>
              </label>

              <label>
                <span className={labelClass}>Contrasena</span>
                <div className="relative">
                  <FieldIcon icon={Lock} />
                  <input
                    className={inputBase}
                    placeholder="Minimo 6 caracteres"
                    type="password"
                    {...register("contrasena", {
                      required: "La contrasena es obligatoria.",
                      minLength: { value: 6, message: "Minimo 6 caracteres." },
                    })}
                  />
                </div>
                {errors.contrasena && (
                  <p className="mt-2 text-xs font-semibold text-red-500">
                    {errors.contrasena.message}
                  </p>
                )}
              </label>

              <label>
                <span className={labelClass}>Confirmar</span>
                <div className="relative">
                  <FieldIcon icon={Lock} />
                  <input
                    className={inputBase}
                    placeholder="Repita su contrasena"
                    type="password"
                    {...register("confirmarContrasena", {
                      required: "Confirme su contrasena.",
                      validate: (value) =>
                        value === getValues("contrasena") ||
                        "Las contrasenas no coinciden.",
                    })}
                  />
                </div>
                {errors.confirmarContrasena && (
                  <p className="mt-2 text-xs font-semibold text-red-500">
                    {errors.confirmarContrasena.message}
                  </p>
                )}
              </label>
            </div>
          </section>
        </div>

        <div className="relative mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-[#64748B]">
            Ya tiene cuenta?{" "}
            <Link className="font-black text-[#2563EB] hover:text-[#102A52]" to="/login">
              Iniciar sesion
            </Link>
          </p>
          <button
            className="flex items-center justify-center gap-3 rounded-[1.35rem] bg-[#102A52] px-7 py-4 font-black text-white shadow-[0_16px_32px_rgba(26,58,107,0.25)] transition hover:-translate-y-0.5 hover:bg-[#1A3A6B] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || registrandoVerificado}
            type="submit"
          >
            {isSubmitting || registrandoVerificado
              ? "Registrando..."
              : "Registrar y verificar"}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
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
