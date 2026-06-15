import {
  Activity,
  AlertTriangle,
  ArrowUpDown,
  CalendarDays,
  ClipboardList,
  Droplets,
  Scale,
  User,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { useAuthStore } from "../../../store/authStore";

const generoLabels = {
  MASCULINO: "Hombre",
  FEMENINO: "Mujer",
  OTRO: "Otro",
};

const alergiaVariantBySeveridad = {
  SEVERO: "severe",
  MODERADO: "neutral",
  LEVE: "mild",
};

const alergiaBadgeClassBySeveridad = {
  MODERADO: "bg-orange-100 text-orange-700",
};

const alergiaDotBySeveridad = {
  SEVERO: "bg-red-500",
  MODERADO: "bg-orange-400",
  LEVE: "bg-yellow-400",
};

const formatFechaNacimiento = (fechaNacimiento) => {
  if (!fechaNacimiento) return "-";

  return new Date(fechaNacimiento).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatFechaConsulta = (fecha) =>
  new Date(fecha).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatGrupoSanguineo = (grupo) => {
  if (!grupo) return "-";
  const limpio = String(grupo).trim().toUpperCase();
  const match = limpio.match(/^([+-])([ABO]{1,2})$/);
  return match ? `${match[2]}${match[1]}` : limpio;
};

const formatAltura = (altura) => {
  if (!altura) return "-";
  const valor = Number(altura);
  if (!Number.isFinite(valor)) return `${altura}`;
  return valor <= 3 ? `${valor} m` : `${valor} cm`;
};

const formatTextoMedico = (texto) =>
  String(texto ?? "")
    .replaceAll("Cardiologia", "Cardiología")
    .replaceAll("Duracion", "Duración")
    .replaceAll(" Dias", " Días")
    .replaceAll(" dias", " días");

function PatientDashboard() {
  const usuario = useAuthStore((s) => s.usuario);
  const pacienteId = usuario?.pacienteId ?? usuario?.paciente?.id;
  const [data, setData] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPerfil = useCallback(async () => {
    if (!pacienteId) {
      setData(null);
      setHistorial([]);
      setError("No se pudo identificar al paciente.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const [perfilRes, historialRes] = await Promise.all([
        api.get(`/pacientes/${pacienteId}/perfil`),
        api.get(`/pacientes/${pacienteId}/historial`),
      ]);
      setData(perfilRes.data);
      setHistorial(historialRes.data.slice(0, 3));
    } catch (err) {
      setError(
        err.response?.data?.message ??
          "No se pudo cargar la informacion del paciente.",
      );
    } finally {
      setLoading(false);
    }
  }, [pacienteId]);

  useEffect(() => {
    fetchPerfil();
  }, [fetchPerfil]);

  const generalInfo = useMemo(
    () => [
      {
        icon: Droplets,
        value: formatGrupoSanguineo(data?.grupoSanguineo),
        label: "Grupo sanguíneo",
      },
      {
        icon: Scale,
        value: data?.peso ? `${data.peso} kg` : "-",
        label: "Peso",
      },
      {
        icon: ArrowUpDown,
        value: formatAltura(data?.altura),
        label: "Altura",
      },
      {
        icon: Activity,
        value: data?.presionArterial ?? "-",
        label: "Presión arterial",
      },
    ],
    [data],
  );

  if (loading) {
    return (
      <div className="mx-auto flex max-w-295 items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#2563EB]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-295">
        <Card className="text-center">
          <p className="font-semibold text-[#111827]">{error}</p>
          <Button className="mt-5" onClick={fetchPerfil}>
            Reintentar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-295 grid-cols-1 gap-6 xl:grid-cols-[35%_1fr]">
      <section className="space-y-5">
        <Card className="text-center">
          <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-gray-100">
            <User className="h-14 w-14 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A3A6B]">
            {`${data.usuario.nombre} ${data.usuario.apellido}`}
          </h1>
          <p className="mt-1 text-sm font-semibold text-[#6B7280]">
            {`#CL${String(data.id).padStart(4, "0")}`}
          </p>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              F.N.
            </p>
            <p className="mt-2 text-lg font-bold text-[#111827]">
              {formatFechaNacimiento(data.fechaNacimiento)}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Género
            </p>
            <p className="mt-2 text-lg font-bold text-[#111827]">
              {generoLabels[data.genero] ?? "-"}
            </p>
          </Card>
        </div>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Información general
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {generalInfo.map((item) => (
              <div className="rounded-2xl bg-gray-50 p-4" key={item.label}>
                <item.icon className="mb-3 h-6 w-6 text-[#2563EB]" />
                <p className="text-xl font-bold text-[#111827]">{item.value}</p>
                <p className="mt-1 text-xs font-medium text-[#6B7280]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="space-y-5">
        <Card className="border border-red-100 bg-red-50/60">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Alergias
            </h2>
          </div>
          <div className="space-y-3">
            {data.alergias?.length ? (
              data.alergias.map((alergia) => (
                <div
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm"
                  key={alergia.id}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        alergiaDotBySeveridad[alergia.severidad] ??
                        "bg-gray-400"
                      }`}
                    />
                    <span className="font-semibold">{alergia.nombre}</span>
                  </div>
                  <Badge
                    className={
                      alergiaBadgeClassBySeveridad[alergia.severidad] ?? ""
                    }
                    variant={
                      alergiaVariantBySeveridad[alergia.severidad] ??
                      "neutral"
                    }
                  >
                    {alergia.severidad}
                  </Badge>
                </div>
              ))
            ) : (
              <p>Sin alergias registradas</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-[#2563EB]" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Medicaciones Actuales
            </h2>
          </div>
          <div className="space-y-3">
            {data.medicamentos?.length ? (
              data.medicamentos.map((medicamento) => (
                <div
                  className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3"
                  key={medicamento.id}
                >
                  <div>
                    <p className="font-bold">{medicamento.nombre}</p>
                    <p className="text-sm text-[#6B7280]">
                      {medicamento.instrucciones}
                    </p>
                  </div>
                  <Badge variant="blue">{medicamento.dosis}</Badge>
                </div>
              ))
            ) : (
              <p>Sin medicamentos activos</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Historial médico
          </h2>
          <div className="mt-5 space-y-3">
            {historial.length ? (
              historial.map((consulta) => (
                <div
                  className="rounded-2xl bg-gray-50 p-4"
                  key={consulta.id}
                >
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                      <CalendarDays className="h-5 w-5 text-[#2563EB]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                        {formatFechaConsulta(consulta.fecha)}
                      </p>
                      <p className="mt-1 font-bold text-[#111827]">
                        Dr. {consulta.doctor} · {formatTextoMedico(consulta.especialidad)}
                      </p>
                      <p className="mt-1 text-sm text-[#6B7280]">
                        {consulta.motivo}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-bold uppercase text-gray-400">
                        Diagnóstico
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#111827]">
                        {consulta.diagnostico || "Sin diagnóstico registrado"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-bold uppercase text-gray-400">
                        Tratamiento
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#111827]">
                        {consulta.tratamiento || "Sin tratamiento registrado"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-bold uppercase text-gray-400">
                        Receta
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#111827]">
                        {consulta.receta
                          ? formatTextoMedico(consulta.receta)
                          : "Sin receta emitida"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-gray-100 p-4 text-sm leading-6 text-[#6B7280]">
                Sin consultas registradas en el historial
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

export default PatientDashboard;
