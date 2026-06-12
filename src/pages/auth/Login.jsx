import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Lock, Phone, PlusSquare } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Button from "../../components/Button";
import Input from "../../components/Input";
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

      const ruta = ROLE_REDIRECT[usuario.rol] ?? "/";
      navigate(ruta);
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        "Error al iniciar sesion. Intente de nuevo.";
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
      toast.success("Codigo enviado por SMS.");
      setCodigo("");
      setNuevaContrasena("");
      setConfirmarContrasena("");
      setShowRecoveryPhone(false);
      setShowNewPassword(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "No se pudo enviar el codigo.";
      toast.error(msg);
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleActualizarContrasena = async () => {
    if (codigo.length !== 6) {
      toast.error("Ingresa el codigo de 6 digitos.");
      return;
    }

    if (nuevaContrasena.length < 6) {
      toast.error("La contrasena debe tener minimo 6 caracteres.");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      toast.error("Las contrasenas no coinciden.");
      return;
    }

    try {
      setRecoveryLoading(true);
      await resetearContrasenaRequest({
        telefono: recoveryPhone,
        codigo,
        nuevaContrasena,
      });
      toast.success("Contrasena actualizada correctamente.");
      limpiarRecuperacion();
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "No se pudo actualizar la contrasena.";
      toast.error(msg);
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form
        className="w-full max-w-140 rounded-3xl bg-white p-10 shadow-xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-10">
          <div className="mb-8 flex items-center gap-3">
            <PlusSquare className="h-8 w-8 text-[#2563EB]" strokeWidth={2.5} />
            <span className="text-xl font-bold text-[#1A3A6B]">
              Clinica Luz
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A3A6B]">
            Bienvenido de Vuelta
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6B7280]">
            Inicie Sesion para acceder a sus citas y registros medicos.
          </p>
        </div>

        <div className="space-y-6">
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
            <span className="mb-2 flex items-center justify-between text-sm font-semibold text-[#111827]">
              Contrasena
              <button
                className="font-medium text-[#2563EB] hover:text-[#1A3A6B]"
                onClick={() => setShowRecoveryPhone(true)}
                type="button"
              >
                Olvido su contrasena?
              </button>
            </span>
            <Input
              type="password"
              placeholder="Ingrese su contrasena"
              {...register("contrasena", {
                required: "La contrasena es obligatoria.",
              })}
            />
            {errors.contrasena && (
              <p className="mt-1 text-xs text-red-500">
                {errors.contrasena.message}
              </p>
            )}
          </label>
        </div>

        <Button className="mt-8 w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Iniciando sesion..." : "Iniciar sesion ->"}
        </Button>

        <p className="mt-8 text-center text-sm text-[#6B7280]">
          No tiene una cuenta?{" "}
          <Link
            className="font-semibold text-[#2563EB] hover:text-[#1A3A6B]"
            to="/register"
          >
            Registrarse
          </Link>
        </p>
      </form>

      {showRecoveryPhone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-96 max-w-full rounded-3xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF2FF] text-[#2563EB]">
              <Phone className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A3A6B]">
              Recuperar contrasena
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6B7280]">
              Ingresa tu telefono y enviaremos un codigo por SMS.
            </p>

            <label className="mt-6 block text-left">
              <span className="mb-2 block text-xs font-bold uppercase text-[#9CA3AF]">
                Telefono
              </span>
              <Input
                autoFocus
                onChange={(event) => setRecoveryPhone(event.target.value)}
                placeholder="+51 999 999 999"
                type="tel"
                value={recoveryPhone}
              />
            </label>

            <button
              className="mt-6 w-full rounded-xl bg-[#1A3A6B] px-5 py-3 font-bold text-white transition hover:bg-[#14305A] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={recoveryLoading}
              onClick={handleSolicitarRecuperacion}
              type="button"
            >
              {recoveryLoading ? "Enviando..." : "Enviar codigo"}
            </button>

            <button
              className="mt-5 text-sm font-semibold text-[#6B7280] hover:text-[#111827]"
              onClick={limpiarRecuperacion}
              type="button"
            >
              Volver
            </button>
          </div>
        </div>
      )}

      {showNewPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-[28rem] max-w-full rounded-3xl bg-white p-8 shadow-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF2FF] text-[#2563EB]">
              <KeyRound className="h-8 w-8" />
            </div>
            <h2 className="text-center text-2xl font-bold text-[#1A3A6B]">
              {codigoCompleto ? "Nueva contrasena" : "Codigo de verificacion"}
            </h2>
            <p className="mt-3 text-center text-sm text-[#6B7280]">
              Codigo enviado a{" "}
              <span className="font-bold text-[#2563EB]">{recoveryPhone}</span>
            </p>

            <label className="mt-6 block">
              <span className="mb-2 block text-xs font-bold uppercase text-[#9CA3AF]">
                Codigo de verificacion
              </span>
              <input
                autoFocus
                className="w-full rounded-xl border border-[#BFDBFE] bg-white px-4 py-3 text-center text-2xl font-bold text-[#1A3A6B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EAF2FF]"
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
              <p className="mt-4 text-center text-sm text-[#6B7280]">
                Ingresa los 6 digitos para continuar.
              </p>
            )}

            {codigoCompleto && (
              <>
                <label className="mt-5 block">
                  <span className="mb-2 block text-xs font-bold uppercase text-[#9CA3AF]">
                    Nueva contrasena
                  </span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EAF2FF]"
                      onChange={(event) => setNuevaContrasena(event.target.value)}
                      placeholder="Minimo 6 caracteres"
                      type="password"
                      value={nuevaContrasena}
                    />
                  </div>
                </label>

                <label className="mt-5 block">
                  <span className="mb-2 block text-xs font-bold uppercase text-[#9CA3AF]">
                    Confirmar contrasena
                  </span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EAF2FF]"
                      onChange={(event) =>
                        setConfirmarContrasena(event.target.value)
                      }
                      placeholder="Repita la contrasena"
                      type="password"
                      value={confirmarContrasena}
                    />
                  </div>
                </label>

                <button
                  className="mt-7 w-full rounded-xl bg-[#1A3A6B] px-5 py-3 font-bold text-white transition hover:bg-[#14305A] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={recoveryLoading}
                  onClick={handleActualizarContrasena}
                  type="button"
                >
                  {recoveryLoading ? "Actualizando..." : "Actualizar contrasena"}
                </button>
              </>
            )}

            <button
              className="mx-auto mt-5 block text-sm font-semibold text-[#9CA3AF] hover:text-[#111827]"
              onClick={() => {
                setShowNewPassword(false);
                setShowRecoveryPhone(true);
              }}
              type="button"
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

export default Login;
