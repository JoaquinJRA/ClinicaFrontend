import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  KeyRound,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import {
  loginRequest,
  resetearContrasenaRequest,
  solicitarRecuperacionRequest,
} from "../../api/auth.api";
import { useAuthStore } from "../../../store/authStore";

const ROLE_REDIRECT = {
  PACIENTE: "/patient/dashboard",
  MEDICO: "/doctor/appointments",
  ADMIN: "/admin/users",
};

const inputBase =
  "w-full rounded-[1.35rem] border border-transparent bg-[#F2F5F9] py-4 pl-12 pr-4 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10";

function Login() {
  const navigate = useNavigate();
  const setUsuario = useAuthStore((s) => s.setUsuario);
  const [showRecoveryPhone, setShowRecoveryPhone] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const codigoCompleto = codigo.length === 6;

  const onSubmit = async (data) => {
    try {
      const res = await loginRequest(data);
      const { usuario } = res.data;

      setUsuario(usuario);
      toast.success(`Bienvenido, ${usuario.nombre}!`);
      navigate(ROLE_REDIRECT[usuario.rol] ?? "/");
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        "Error al iniciar sesión. Intente de nuevo.";
      toast.error(msg);
    }
  };

  const limpiarRecuperacion = () => {
    setShowRecoveryPhone(false);
    setShowNewPassword(false);
    setRecoveryPhone("");
    setCodigo("");
    setNuevaContrasena("");
    setConfirmarContrasena("");
  };

  const handleSolicitarRecuperacion = async () => {
    if (!recoveryPhone) {
      toast.error("Ingresa tu numero de telefono.");
      return;
    }

    try {
      setRecoveryLoading(true);
      await solicitarRecuperacionRequest({ telefono: recoveryPhone });
      toast.success("Código enviado por SMS.");
      setCodigo("");
      setNuevaContrasena("");
      setConfirmarContrasena("");
      setShowRecoveryPhone(false);
      setShowNewPassword(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "No se pudo enviar el código.";
      toast.error(msg);
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleActualizarContrasena = async () => {
    if (codigo.length !== 6) {
      toast.error("Ingresa el código de 6 dígitos.");
      return;
    }

    if (nuevaContrasena.length < 6) {
      toast.error("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    try {
      setRecoveryLoading(true);
      await resetearContrasenaRequest({
        telefono: recoveryPhone,
        codigo,
        nuevaContrasena,
      });
      toast.success("Contraseña actualizada correctamente.");
      limpiarRecuperacion();
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "No se pudo actualizar la contraseña.";
      toast.error(msg);
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <AuthLayout mode="login">
      <form
        className="relative w-full max-w-[34rem] overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-7 shadow-[0_28px_90px_rgba(15,23,42,0.18)] backdrop-blur md:p-9"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[4rem] bg-[#DBEAFE]" />
        <div className="relative">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[#EAF2FF] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#1A3A6B]">
            Portal Clinica Luz
          </div>
          <h1 className="max-w-sm text-4xl font-black leading-tight text-[#102A52]">
            Vuelva a su panel medico.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#64748B]">
            Ingrese con su correo para revisar citas y tratamientos.
          </p>
        </div>

        <div className="relative mt-9 space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#64748B]">
              Correo electronico
            </span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2563EB]" />
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

          <label className="block">
            <span className="mb-2 flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.18em] text-[#64748B]">
              Contrasena
              <button
                className="rounded-full bg-white px-3 py-1 text-[11px] tracking-normal text-[#2563EB] shadow-sm transition hover:bg-[#EAF2FF]"
                onClick={() => setShowRecoveryPhone(true)}
                type="button"
              >
                Olvide mi contraseña
              </button>
            </span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2563EB]" />
              <input
                className={inputBase}
                placeholder="Ingrese su contraseña"
                type="password"
                {...register("contrasena", {
                  required: "La contraseña es obligatoria.",
                })}
              />
            </div>
            {errors.contrasena && (
              <p className="mt-2 text-xs font-semibold text-red-500">
                {errors.contrasena.message}
              </p>
            )}
          </label>
        </div>

        <button
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-[1.35rem] bg-[#102A52] px-6 py-4 font-black text-white shadow-[0_16px_32px_rgba(26,58,107,0.25)] transition hover:-translate-y-0.5 hover:bg-[#1A3A6B] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>

        <div className="mt-7 flex items-center justify-between gap-3 rounded-[1.5rem] border border-[#E2E8F0] bg-white/70 px-4 py-3 text-sm text-[#64748B]">
          <span>No tiene una cuenta?</span>
          <Link className="font-black text-[#2563EB] hover:text-[#102A52]" to="/register">
            Crear una cuenta
          </Link>
        </div>
      </form>

      {showRecoveryPhone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071426]/70 px-4 backdrop-blur-sm">
          <div className="relative w-[27rem] max-w-full overflow-hidden rounded-[2rem] bg-white p-7 shadow-[0_28px_90px_rgba(15,23,42,0.35)]">
            <button
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B] transition hover:bg-[#E2E8F0]"
              onClick={limpiarRecuperacion}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#2563EB]">
              <Phone className="h-8 w-8" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2563EB]">
              Recuperacion SMS
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#102A52]">
              Confirme su telefono.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#64748B]">
              Enviaremos un codigo temporal para permitir el cambio de
              contraseña.
            </p>

            <label className="mt-6 block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#64748B]">
                Telefono
              </span>
              <div className="relative">
                <MessageCircle className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2563EB]" />
                <input
                  autoFocus
                  className={inputBase}
                  onChange={(event) => setRecoveryPhone(event.target.value)}
                  placeholder="+51 999 999 999"
                  type="tel"
                  value={recoveryPhone}
                />
              </div>
            </label>

            <button
              className="mt-6 w-full rounded-[1.25rem] bg-[#102A52] px-5 py-4 font-black text-white transition hover:bg-[#1A3A6B] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={recoveryLoading}
              onClick={handleSolicitarRecuperacion}
              type="button"
            >
              {recoveryLoading ? "Enviando..." : "Enviar codigo"}
            </button>
          </div>
        </div>
      )}

      {showNewPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071426]/70 px-4 backdrop-blur-sm">
          <div className="relative w-[30rem] max-w-full overflow-hidden rounded-[2rem] bg-white p-7 shadow-[0_28px_90px_rgba(15,23,42,0.35)]">
            <button
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B] transition hover:bg-[#E2E8F0]"
              onClick={() => {
                setShowNewPassword(false);
                setShowRecoveryPhone(true);
              }}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#2563EB]">
              <KeyRound className="h-8 w-8" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2563EB]">
              {codigoCompleto ? "Nueva clave" : "Codigo de acceso"}
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#102A52]">
              {codigoCompleto ? "Cree una nueva contrasena." : "Ingrese el codigo SMS."}
            </h2>
            <p className="mt-3 text-sm text-[#64748B]">
              Enviado a <span className="font-black text-[#2563EB]">{recoveryPhone}</span>
            </p>

            <label className="mt-6 block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#64748B]">
                Codigo de verificación
              </span>
              <input
                autoFocus
                className="w-full rounded-[1.25rem] border border-[#BFDBFE] bg-[#F8FAFC] px-4 py-4 text-center text-2xl font-black text-[#102A52] outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => setCodigo(event.target.value.replace(/\D/g, ""))}
                placeholder="1 2 3 4 5 6"
                style={{ letterSpacing: "0.5rem" }}
                type="tel"
                value={codigo}
              />
            </label>

            {!codigoCompleto && (
              <p className="mt-4 rounded-2xl bg-[#F1F5F9] px-4 py-3 text-center text-sm text-[#64748B]">
                Al completar los 6 digitos aparecera el formulario de nueva
                contraseña.
              </p>
            )}

            {codigoCompleto && (
              <>
                <label className="mt-5 block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#64748B]">
                    Nueva contraseña
                  </span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2563EB]" />
                    <input
                      className={inputBase}
                      onChange={(event) => setNuevaContrasena(event.target.value)}
                      placeholder="Minimo 6 caracteres"
                      type="password"
                      value={nuevaContrasena}
                    />
                  </div>
                </label>

                <label className="mt-5 block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#64748B]">
                    Confirmar contraseña
                  </span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2563EB]" />
                    <input
                      className={inputBase}
                      onChange={(event) =>
                        setConfirmarContrasena(event.target.value)
                      }
                      placeholder="Repita la contraseña"
                      type="password"
                      value={confirmarContrasena}
                    />
                  </div>
                </label>

                <button
                  className="mt-7 w-full rounded-[1.25rem] bg-[#102A52] px-5 py-4 font-black text-white transition hover:bg-[#1A3A6B] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={recoveryLoading}
                  onClick={handleActualizarContrasena}
                  type="button"
                >
                  {recoveryLoading ? "Actualizando..." : "Actualizar contraseña"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

export default Login;
