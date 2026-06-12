import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Calendar, Clock, FileDown, FileText, Pill } from 'lucide-react'
import api from '../../api/axios'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { useAuthStore } from '../../../store/authStore'

const normalizarUnidad = (unidad) =>
  String(unidad || 'Dias')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const calcularDiasTotales = (medicamento) => {
  const duracion = Number(medicamento.duracion)
  if (!Number.isFinite(duracion) || duracion <= 0) return null

  const unidad = normalizarUnidad(medicamento.unidadDuracion)
  if (unidad === 'semanas') return duracion * 7
  if (unidad === 'meses') return duracion * 30
  return duracion
}

const formatDate = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'No registrada'

const getStartDate = (medicamento) =>
  medicamento.fechaInicio || medicamento.creadoEn

const getEndDate = (medicamento) => {
  const inicio = getStartDate(medicamento)
  const diasTotales = calcularDiasTotales(medicamento)
  if (!inicio || !diasTotales) return null

  const date = new Date(inicio)
  date.setDate(date.getDate() + diasTotales)
  return date
}

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

function PatientMedications() {
  const usuario = useAuthStore((s) => s.usuario)
  const pacienteId = usuario?.pacienteId ?? usuario?.paciente?.id
  const [medicamentos, setMedicamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchMedicamentos = useCallback(async () => {
    if (!pacienteId) {
      setMedicamentos([])
      setError('No se pudo identificar al paciente.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const res = await api.get(`/pacientes/${pacienteId}/medicamentos`)
      setMedicamentos(res.data)
    } catch (err) {
      setError(
        err.response?.data?.message ??
          'No se pudieron cargar los medicamentos activos.',
      )
    } finally {
      setLoading(false)
    }
  }, [pacienteId])

  useEffect(() => {
    fetchMedicamentos()
  }, [fetchMedicamentos])

  const medicamentosFinalizando = useMemo(
    () =>
      medicamentos.filter((med) => {
        const restantes = Number(med.diasRestantes)
        return Number.isFinite(restantes) && restantes > 0 && restantes <= 2
      }),
    [medicamentos],
  )

  const handleExportarMedicamentos = () => {
    if (!medicamentos.length) {
      alert('No tienes medicamentos activos para imprimir.')
      return
    }

    const ventana = window.open('', '_blank', 'width=900,height=700')
    if (!ventana) {
      alert('Permite ventanas emergentes para imprimir tus medicamentos.')
      return
    }

    const fechaEmision = new Date().toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

    const rows = medicamentos
      .map((med, index) => {
        const inicio = getStartDate(med)
        const fin = getEndDate(med)
        const diasTotales = calcularDiasTotales(med)

        return `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(med.nombre)}</td>
            <td>${escapeHtml(med.dosis)}</td>
            <td>${escapeHtml(med.frecuencia || 'No registrada')}</td>
            <td>${escapeHtml(formatDate(inicio))}</td>
            <td>${escapeHtml(fin ? formatDate(fin) : 'No registrada')}</td>
            <td>${escapeHtml(diasTotales ? `${diasTotales} dias` : 'No registrada')}</td>
            <td>${escapeHtml(`${med.diasRestantes ?? '-'} dias`)}</td>
            <td>${escapeHtml(med.instrucciones || 'Sin indicaciones')}</td>
          </tr>
        `
      })
      .join('')

    ventana.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Medicamentos activos - Clinica Luz</title>
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
            .label {
              color: #6B7280;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: .04em;
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            .value { font-size: 14px; font-weight: 700; }
            h1 {
              color: #1A3A6B;
              font-size: 22px;
              margin: 0 0 18px;
              text-transform: uppercase;
            }
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
            @media print {
              body { padding: 22px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">Clinica Luz</div>
              <div class="subtitle">Listado de medicamentos activos</div>
            </div>
            <div>
              <div class="label">Fecha de impresion</div>
              <div class="value">${escapeHtml(fechaEmision)}</div>
            </div>
          </div>

          <h1>Medicamentos activos</h1>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Medicamento</th>
                <th>Dosis</th>
                <th>Frecuencia</th>
                <th>Inicio</th>
                <th>Termina</th>
                <th>Duracion</th>
                <th>Restante</th>
                <th>Indicaciones</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="notes">
            Este documento resume los medicamentos activos registrados en Clinica Luz. Siga las indicaciones medicas y consulte ante cualquier reaccion adversa.
          </div>

          <script>
            window.onload = () => {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `)
    ventana.document.close()
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-[1180px] items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#2563EB]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1180px]">
        <Card className="text-center">
          <p className="font-semibold text-[#111827]">{error}</p>
          <Button className="mt-5" onClick={fetchMedicamentos}>
            Reintentar
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1A3A6B]">Medicamentos</h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              Consulta tus medicamentos recetados, indicaciones y duracion del tratamiento.
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1A3A6B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#14305A] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!medicamentos.length}
            onClick={handleExportarMedicamentos}
            type="button"
          >
            <FileDown className="h-5 w-5" />
            Imprimir medicamentos
          </button>
        </div>

        <div className="space-y-4">
          {medicamentos.map((item) => {
            const inicio = getStartDate(item)
            const fin = getEndDate(item)
            const diasTotales = calcularDiasTotales(item)

            return (
              <Card className="space-y-5" key={item.id}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                      <Pill className="h-7 w-7 text-[#2563EB]" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold text-[#111827]">
                          {item.nombre}
                        </h2>
                        <Badge variant="blue">{item.dosis}</Badge>
                        <Badge variant="confirmed">Activo</Badge>
                      </div>
                      <p className="mt-2 flex items-center gap-2 text-sm text-[#6B7280]">
                        <Clock className="h-4 w-4" />
                        {item.frecuencia || 'Frecuencia no registrada'}
                      </p>
                      {item.instrucciones && (
                        <p className="mt-1 flex items-center gap-2 text-sm text-[#6B7280]">
                          <FileText className="h-4 w-4" />
                          {item.instrucciones}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs font-bold uppercase text-gray-400">
                      Inicio
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#111827]">
                      {formatDate(inicio)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs font-bold uppercase text-gray-400">
                      Termina
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#111827]">
                      {fin ? formatDate(fin) : 'No registrada'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs font-bold uppercase text-gray-400">
                      Duracion
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#111827]">
                      {diasTotales ? `${diasTotales} dias` : 'No registrada'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs font-bold uppercase text-gray-400">
                      Restante
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#111827]">
                      {item.diasRestantes ?? '-'} dias
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}

          {!medicamentos.length && (
            <Card>
              <p className="text-sm text-[#6B7280]">Sin medicamentos activos.</p>
            </Card>
          )}
        </div>
      </section>

      <aside>
        <h2 className="mb-4 text-xl font-bold text-[#1A3A6B]">Resumen</h2>
        <div className="space-y-4">
          <Card>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
              <Calendar className="h-6 w-6 text-[#2563EB]" />
            </div>
            <h3 className="text-lg font-bold text-[#111827]">
              Medicamentos activos
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Actualmente tienes {medicamentos.length} medicamento(s) recetado(s).
            </p>
          </Card>

          <Card>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <AlertTriangle className="h-6 w-6 text-[#EF4444]" />
            </div>
            <h3 className="text-lg font-bold text-[#111827]">
              Tratamientos por terminar
            </h3>
            <div className="mt-2 space-y-2 text-sm leading-6 text-[#6B7280]">
              {medicamentosFinalizando.length ? (
                medicamentosFinalizando.map((med) => (
                  <p key={med.id}>
                    {med.nombre}: {med.diasRestantes} dia(s) restantes.
                  </p>
                ))
              ) : (
                <p>No tienes tratamientos por finalizar en los proximos dias.</p>
              )}
            </div>
          </Card>
        </div>
      </aside>
    </div>
  )
}

export default PatientMedications
