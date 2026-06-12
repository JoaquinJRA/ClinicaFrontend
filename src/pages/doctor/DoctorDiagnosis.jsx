import { useEffect, useState } from "react";
import { ChevronDown, FileDown, Plus, Search, User, X } from "lucide-react";
import api from "../../api/axios";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";

const generoLabel = {
  MASCULINO: "Hombre",
  FEMENINO: "Mujer",
  OTRO: "Otro",
};

const formInicial = {
  motivo: "",
  diagnostico: "",
  tratamiento: "",
  notas: "",
};

const medicamentoInicial = {
  nombre: "",
  dosis: "",
  frecuencia: "",
  fechaInicio: "",
  duracion: 7,
  unidadDuracion: "Dias",
  instrucciones: "",
};

const resumenDiagnostico = (diagnostico) => {
  const primeraLinea = String(diagnostico || "").split("\n")[0];
  return primeraLinea.length > 42
    ? `${primeraLinea.slice(0, 42)}...`
    : primeraLinea || "Diagnostico registrado";
};

const formatFecha = (fecha) =>
  new Date(fecha).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

function DoctorDiagnosis() {
  const [busquedaId, setBusquedaId] = useState("");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [historialDiagnosticos, setHistorialDiagnosticos] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [expandidoId, setExpandidoId] = useState(null);
  const [sintomas, setSintomas] = useState([]);
  const [sintomaInput, setSintomaInput] = useState("");
  const [form, setForm] = useState(formInicial);
  const [medicamentos, setMedicamentos] = useState([{ ...medicamentoInicial }]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const cargarPaciente = async (paciente) => {
    setLoading(true);
    try {
      const [perfilRes, diagnosticosRes] = await Promise.all([
        api.get(`/doctor/pacientes/${paciente.id}/perfil-medico`),
        api.get(`/doctor/pacientes/${paciente.id}/diagnosticos`),
      ]);

      setPacienteSeleccionado({ id: paciente.id, ...perfilRes.data });
      setHistorialDiagnosticos(diagnosticosRes.data);
      setExpandidoId(diagnosticosRes.data[0]?.id ?? null);
      setResultadosBusqueda([]);
      setBusquedaId("");
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = async () => {
    const valor = busquedaId.trim();
    if (!valor) return;

    setLoading(true);
    try {
      const res = await api.get("/doctor/pacientes/buscar", {
        params: { q: valor },
      });

      if (res.data.length === 1) {
        await cargarPaciente(res.data[0]);
        return;
      }

      setResultadosBusqueda(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const valor = busquedaId.trim();
    if (valor.length < 2) {
      setResultadosBusqueda([]);
      return undefined;
    }

    const timeout = setTimeout(async () => {
      const res = await api.get("/doctor/pacientes/buscar", {
        params: { q: valor },
      });
      setResultadosBusqueda(res.data);
    }, 400);

    return () => clearTimeout(timeout);
  }, [busquedaId]);

  const agregarSintoma = () => {
    if (!sintomaInput.trim()) return;
    setSintomas((actuales) => [...actuales, sintomaInput.trim()]);
    setSintomaInput("");
  };

  const eliminarSintoma = (sintoma) => {
    setSintomas((actuales) => actuales.filter((item) => item !== sintoma));
  };

  const actualizarForm = (campo, valor) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  };

  const agregarMedicamento = () => {
    setMedicamentos((actuales) => [...actuales, { ...medicamentoInicial }]);
  };

  const actualizarMedicamento = (index, campo, valor) => {
    setMedicamentos((actuales) =>
      actuales.map((medicamento, i) =>
        i === index ? { ...medicamento, [campo]: valor } : medicamento,
      ),
    );
  };

  const eliminarMedicamento = (index) => {
    setMedicamentos((actuales) =>
      actuales.length === 1
        ? [{ ...medicamentoInicial }]
        : actuales.filter((_, i) => i !== index),
    );
  };

  const recargarHistorial = async () => {
    if (!pacienteSeleccionado) return;

    const res = await api.get(
      `/doctor/pacientes/${pacienteSeleccionado.id}/diagnosticos`,
    );
    setHistorialDiagnosticos(res.data);
    setExpandidoId(res.data[0]?.id ?? null);
  };

  const handleGuardar = async () => {
    if (!pacienteSeleccionado) {
      alert("Busca un paciente primero");
      return;
    }

    if (!form.diagnostico.trim()) {
      alert("El diagnostico es requerido");
      return;
    }

    await api.post("/doctor/diagnosticos", {
      pacienteId: pacienteSeleccionado.id,
      motivo: form.motivo,
      sintomas: sintomas.join(", "),
      diagnostico: form.diagnostico,
      tratamiento: form.tratamiento,
      notas: form.notas,
      medicamentos: medicamentos.filter((medicamento) => medicamento.nombre || medicamento.dosis),
    });

    setSuccessMsg("Consulta guardada con diagnostico y prescripcion");
    await recargarHistorial();
    setForm(formInicial);
    setSintomas([]);
    setMedicamentos([{ ...medicamentoInicial }]);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const handleExportarReceta = () => {
    if (!pacienteSeleccionado) {
      alert("Selecciona un paciente primero");
      return;
    }

    const medicamentosValidos = medicamentos.filter(
      (medicamento) => medicamento.nombre || medicamento.dosis,
    );

    if (!medicamentosValidos.length) {
      alert("Agrega al menos un medicamento para exportar");
      return;
    }

    const ventana = window.open("", "_blank", "width=900,height=700");
    if (!ventana) {
      alert("Permite ventanas emergentes para exportar la receta");
      return;
    }

    const fechaEmision = new Date().toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const rows = medicamentosValidos
      .map(
        (medicamento, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(medicamento.nombre || "-")}</td>
            <td>${escapeHtml(medicamento.dosis || "-")}</td>
            <td>${escapeHtml(medicamento.frecuencia || "-")}</td>
            <td>${escapeHtml(medicamento.fechaInicio || "-")}</td>
            <td>${escapeHtml(
              medicamento.duracion
                ? `${medicamento.duracion} ${medicamento.unidadDuracion || "Dias"}`
                : "-",
            )}</td>
            <td>${escapeHtml(medicamento.instrucciones || "-")}</td>
          </tr>
        `,
      )
      .join("");

    ventana.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Receta medica - Clinica Luz</title>
          <style>
            * { box-sizing: border-box; }
            body {
              color: #111827;
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 32px;
            }
            .header {
              border-bottom: 3px solid #1A3A6B;
              display: flex;
              justify-content: space-between;
              margin-bottom: 28px;
              padding-bottom: 18px;
            }
            .brand { color: #1A3A6B; font-size: 26px; font-weight: 800; }
            .subtitle { color: #6B7280; font-size: 13px; margin-top: 6px; }
            .title {
              color: #1A3A6B;
              font-size: 22px;
              font-weight: 800;
              margin: 0 0 18px;
              text-transform: uppercase;
            }
            .meta {
              display: grid;
              gap: 12px;
              grid-template-columns: repeat(2, 1fr);
              margin-bottom: 24px;
            }
            .box {
              background: #F3F6FA;
              border-radius: 12px;
              padding: 14px 16px;
            }
            .label {
              color: #6B7280;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: .04em;
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            .value { font-size: 14px; font-weight: 700; }
            table {
              border-collapse: collapse;
              font-size: 12px;
              width: 100%;
            }
            th {
              background: #1A3A6B;
              color: #fff;
              padding: 10px 8px;
              text-align: left;
            }
            td {
              border-bottom: 1px solid #E5E7EB;
              padding: 10px 8px;
              vertical-align: top;
            }
            .notes {
              border-top: 1px solid #E5E7EB;
              color: #6B7280;
              font-size: 12px;
              line-height: 1.6;
              margin-top: 28px;
              padding-top: 16px;
            }
            .signature {
              margin-top: 56px;
              text-align: right;
            }
            .line {
              border-top: 1px solid #111827;
              display: inline-block;
              padding-top: 8px;
              text-align: center;
              width: 240px;
            }
            @media print {
              body { padding: 22px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">Clinica Luz</div>
              <div class="subtitle">Receta medica para impresion</div>
            </div>
            <div>
              <div class="label">Fecha de emision</div>
              <div class="value">${escapeHtml(fechaEmision)}</div>
            </div>
          </div>

          <h1 class="title">Prescripcion medica</h1>

          <div class="meta">
            <div class="box">
              <div class="label">Paciente</div>
              <div class="value">${escapeHtml(
                `${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido}`,
              )}</div>
            </div>
            <div class="box">
              <div class="label">Codigo / DNI</div>
              <div class="value">${escapeHtml(pacienteSeleccionado.codigo)} · DNI ${escapeHtml(
                pacienteSeleccionado.dni || "-",
              )}</div>
            </div>
            <div class="box">
              <div class="label">Peso</div>
              <div class="value">${escapeHtml(
                pacienteSeleccionado.peso
                  ? `${pacienteSeleccionado.peso} kg`
                  : "No registrado",
              )}</div>
            </div>
            <div class="box">
              <div class="label">Alergias</div>
              <div class="value">${escapeHtml(
                pacienteSeleccionado.alergias?.length
                  ? pacienteSeleccionado.alergias
                      .map((alergia) => `${alergia.nombre}${alergia.severidad ? ` (${alergia.severidad})` : ""}`)
                      .join(", ")
                  : "Sin alergias registradas",
              )}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Medicamento</th>
                <th>Dosis</th>
                <th>Frecuencia</th>
                <th>Inicio</th>
                <th>Duracion</th>
                <th>Indicaciones</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="notes">
            Esta receta corresponde a la atencion registrada en Clinica Luz. Siga las indicaciones del medico tratante y consulte ante reacciones adversas.
          </div>

          <div class="signature">
            <div class="line">Firma y sello del medico</div>
          </div>

          <script>
            window.onload = () => {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    ventana.document.close();
  };

  return (
    <div className="mx-auto max-w-280">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A3A6B]">Diagnosticos</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Registre diagnosticos visuales y revise antecedentes del paciente.
        </p>
      </div>

      <Card className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <Input
              className="pl-12"
              onChange={(event) => setBusquedaId(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleBuscar();
                }
              }}
              placeholder="Buscar paciente por DNI, nombre o apellido"
              value={busquedaId}
            />
          </div>
          <Button disabled={loading} onClick={handleBuscar} type="button">
            Buscar
          </Button>
        </div>
        {resultadosBusqueda.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-2xl bg-gray-50">
            {resultadosBusqueda.map((paciente) => (
              <button
                className="block w-full px-4 py-3 text-left text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
                key={paciente.id}
                onClick={() => cargarPaciente(paciente)}
                type="button"
              >
                {paciente.nombre} {paciente.apellido} · DNI {paciente.dni} · {paciente.codigo}
              </button>
            ))}
          </div>
        )}
      </Card>

      {pacienteSeleccionado && (
        <Card className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100">
              <User className="h-7 w-7 text-[#2563EB]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111827]">
                {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                {pacienteSeleccionado.codigo} · DNI {pacienteSeleccionado.dni} · {pacienteSeleccionado.edad ?? "-"} anos ·{" "}
                {generoLabel[pacienteSeleccionado.genero] ??
                  pacienteSeleccionado.genero}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="blue">
                  Peso: {pacienteSeleccionado.peso ? `${pacienteSeleccionado.peso} kg` : "No registrado"}
                </Badge>
                <Badge>
                  Grupo: {pacienteSeleccionado.grupoSanguineo || "No registrado"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex max-w-md flex-wrap gap-2">
            {pacienteSeleccionado.alergias?.length ? (
              pacienteSeleccionado.alergias.map((alergia) => (
                <Badge key={alergia.id ?? alergia.nombre} variant="severe">
                  {alergia.nombre} {alergia.severidad ? `· ${alergia.severidad}` : ""}
                </Badge>
              ))
            ) : (
              <Badge>Sin alergias</Badge>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Nuevo diagnostico
          </h2>

          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Motivo de consulta
              </span>
              <Input
                onChange={(event) => actualizarForm("motivo", event.target.value)}
                placeholder="Control general"
                value={form.motivo}
              />
            </label>

            <div>
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Sintomas
              </span>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  onChange={(event) => setSintomaInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      agregarSintoma();
                    }
                  }}
                  placeholder="Agregar sintoma"
                  value={sintomaInput}
                />
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
                  onClick={agregarSintoma}
                  type="button"
                >
                  <Plus className="h-5 w-5" />
                  Agregar
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {sintomas.map((sintoma) => (
                  <Badge key={sintoma} variant="blue">
                    <span className="inline-flex items-center gap-2">
                      {sintoma}
                      <button
                        className="text-[#2563EB]"
                        onClick={() => eliminarSintoma(sintoma)}
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  </Badge>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Diagnostico
              </span>
              <textarea
                className="min-h-28 w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                onChange={(event) =>
                  actualizarForm("diagnostico", event.target.value)
                }
                placeholder="Describa el diagnostico del paciente"
                required
                value={form.diagnostico}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Tratamiento indicado
              </span>
              <textarea
                className="min-h-28 w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                onChange={(event) =>
                  actualizarForm("tratamiento", event.target.value)
                }
                placeholder="Indique tratamiento y recomendaciones"
                value={form.tratamiento}
              />
            </label>

            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Prescripcion medica
                  </h3>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    Estos medicamentos se guardaran en la receta de esta consulta y en medicacion activa del paciente.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1A3A6B] ring-1 ring-gray-200 transition hover:bg-blue-50"
                    onClick={handleExportarReceta}
                    type="button"
                  >
                    <FileDown className="h-4 w-4" />
                    Exportar PDF
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1A3A6B] ring-1 ring-gray-200 transition hover:bg-blue-50"
                    onClick={agregarMedicamento}
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar medicamento
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {medicamentos.map((medicamento, index) => (
                  <div
                    className="rounded-2xl bg-white p-4 ring-1 ring-gray-100"
                    key={index}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <p className="font-bold text-[#1A3A6B]">
                        Medicamento {index + 1}
                      </p>
                      <button
                        className="rounded-full bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                        onClick={() => eliminarMedicamento(index)}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase text-gray-400">
                          Medicamento
                        </span>
                        <Input
                          onChange={(event) =>
                            actualizarMedicamento(index, "nombre", event.target.value)
                          }
                          placeholder="Paracetamol"
                          value={medicamento.nombre}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase text-gray-400">
                          Dosis
                        </span>
                        <Input
                          onChange={(event) =>
                            actualizarMedicamento(index, "dosis", event.target.value)
                          }
                          placeholder="500 mg"
                          value={medicamento.dosis}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase text-gray-400">
                          Frecuencia
                        </span>
                        <Input
                          onChange={(event) =>
                            actualizarMedicamento(
                              index,
                              "frecuencia",
                              event.target.value,
                            )
                          }
                          placeholder="Cada 8 horas"
                          value={medicamento.frecuencia}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase text-gray-400">
                          Fecha inicio
                        </span>
                        <Input
                          onChange={(event) =>
                            actualizarMedicamento(
                              index,
                              "fechaInicio",
                              event.target.value,
                            )
                          }
                          type="date"
                          value={medicamento.fechaInicio}
                        />
                      </label>
                      <div className="grid grid-cols-[1fr_140px] gap-3 md:col-span-2">
                        <label className="block">
                          <span className="mb-2 block text-xs font-bold uppercase text-gray-400">
                            Duracion
                          </span>
                          <Input
                            min="1"
                            onChange={(event) =>
                              actualizarMedicamento(
                                index,
                                "duracion",
                                Number(event.target.value),
                              )
                            }
                            type="number"
                            value={medicamento.duracion}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-xs font-bold uppercase text-gray-400">
                            Unidad
                          </span>
                          <select
                            className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                            onChange={(event) =>
                              actualizarMedicamento(
                                index,
                                "unidadDuracion",
                                event.target.value,
                              )
                            }
                            value={medicamento.unidadDuracion}
                          >
                            <option value="Dias">Dias</option>
                            <option value="Semanas">Semanas</option>
                            <option value="Meses">Meses</option>
                          </select>
                        </label>
                      </div>
                      <label className="block md:col-span-2">
                        <span className="mb-2 block text-xs font-bold uppercase text-gray-400">
                          Indicaciones
                        </span>
                        <Input
                          onChange={(event) =>
                            actualizarMedicamento(
                              index,
                              "instrucciones",
                              event.target.value,
                            )
                          }
                          placeholder="Tomar despues de alimentos"
                          value={medicamento.instrucciones}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Observaciones
              </span>
              <textarea
                className="min-h-24 w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                onChange={(event) => actualizarForm("notas", event.target.value)}
                placeholder="Observaciones adicionales"
                value={form.notas}
              />
            </label>
          </div>

          {successMsg && (
            <p className="mt-5 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {successMsg}
            </p>
          )}

          <Button className="mt-6 w-full" onClick={handleGuardar} type="button">
            Guardar Diagnostico →
          </Button>
        </Card>

        <section>
          <h2 className="mb-4 text-xl font-bold text-[#1A3A6B]">
            Historial de diagnosticos
          </h2>
          <div className="space-y-4">
            {historialDiagnosticos.length ? (
              historialDiagnosticos.map((diagnostico) => {
                const isOpen = expandidoId === diagnostico.id;

                return (
                  <Card className="p-0" key={diagnostico.id}>
                    <button
                      className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                      onClick={() => setExpandidoId(isOpen ? null : diagnostico.id)}
                      type="button"
                    >
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                          {formatFecha(diagnostico.creadoEn).toUpperCase()}
                        </p>
                        <h3 className="mt-1 font-bold text-[#111827]">
                          {resumenDiagnostico(diagnostico.diagnostico)}
                        </h3>
                        <p className="mt-1 text-xs text-[#6B7280]">
                          {diagnostico.medico} · {diagnostico.especialidad}
                        </p>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-[#6B7280] transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="space-y-3 border-t border-gray-100 px-5 py-4 text-sm leading-6 text-[#6B7280]">
                        <p>
                          <span className="font-bold text-[#111827]">Fecha de emision:</span>{" "}
                          {formatFecha(diagnostico.creadoEn)}
                        </p>
                        <p>
                          <span className="font-bold text-[#111827]">Motivo:</span>{" "}
                          {diagnostico.motivo || "Sin motivo registrado"}
                        </p>
                        <p>
                          <span className="font-bold text-[#111827]">Sintomas:</span>{" "}
                          {diagnostico.sintomas || "Sin sintomas registrados"}
                        </p>
                        <p>
                          <span className="font-bold text-[#111827]">Diagnostico:</span>{" "}
                          {diagnostico.diagnostico}
                        </p>
                        <p>
                          <span className="font-bold text-[#111827]">Tratamiento:</span>{" "}
                          {diagnostico.tratamiento || "Sin tratamiento registrado"}
                        </p>
                        <p>
                          <span className="font-bold text-[#111827]">Receta:</span>{" "}
                          {diagnostico.receta || "Sin receta emitida"}
                        </p>
                        <p>
                          <span className="font-bold text-[#111827]">Observaciones:</span>{" "}
                          {diagnostico.notas || "Sin observaciones"}
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })
            ) : (
              <Card>
                <p className="text-sm text-[#6B7280]">
                  {pacienteSeleccionado
                    ? "Sin diagnosticos registrados para este paciente"
                    : "Busca y selecciona un paciente para ver su historial"}
                </p>
              </Card>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DoctorDiagnosis;
