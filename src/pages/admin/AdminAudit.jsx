import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, Clock, RefreshCw, Search, ShieldCheck } from 'lucide-react'
import api from '../../api/axios'
import Badge from '../../components/Badge'
import Card from '../../components/Card'
import Input from '../../components/Input'

const acciones = [
  { value: '', label: 'Todas las acciones' },
  { value: 'CREAR_USUARIO', label: 'Crear usuario' },
  { value: 'EDITAR_USUARIO', label: 'Editar usuario' },
  { value: 'CAMBIAR_ESTADO_USUARIO', label: 'Cambiar estado usuario' },
  { value: 'ELIMINAR_USUARIO', label: 'Eliminar usuario' },
  { value: 'REPROGRAMAR_CITA', label: 'Reprogramar cita' },
  { value: 'REASIGNAR_CITA', label: 'Reasignar cita' },
  { value: 'CAMBIAR_ESTADO_CITA', label: 'Cambiar estado cita' },
  { value: 'MARCAR_PAGO_PAGADO', label: 'Marcar pago pagado' },
]

const modulos = [
  { value: '', label: 'Todos los modulos' },
  { value: 'Usuarios', label: 'Usuarios' },
  { value: 'Citas', label: 'Citas' },
  { value: 'Pagos', label: 'Pagos' },
]

const accionLabel = (accion) =>
  acciones.find((item) => item.value === accion)?.label || accion

const formatDate = (fecha) =>
  new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const formatShortDate = (fecha) =>
  new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const detalleTexto = (detalle) => {
  if (!detalle || typeof detalle !== 'object') return 'Sin detalle adicional'

  const partes = []
  if (detalle.usuario) partes.push(detalle.usuario)
  if (detalle.email) partes.push(detalle.email)
  if (detalle.rol) partes.push(`Rol: ${detalle.rol}`)
  if (detalle.estado) partes.push(`Estado: ${detalle.estado}`)
  if (detalle.resultado) partes.push(`Resultado: ${detalle.resultado}`)
  if (detalle.citaId) partes.push(`Cita #${detalle.citaId}`)
  if (detalle.monto) partes.push(`Monto: S/ ${detalle.monto}`)
  if (detalle.medicoNuevoId) partes.push(`Nuevo medico ID: ${detalle.medicoNuevoId}`)
  if (detalle.fecha) partes.push(`Fecha: ${formatShortDate(detalle.fecha)}`)
  if (Array.isArray(detalle.campos)) {
    partes.push(`Campos editados: ${detalle.campos.length}`)
  }

  return partes.length ? partes.join(' · ') : 'Accion registrada correctamente'
}

function AdminAudit() {
  const [registros, setRegistros] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [accion, setAccion] = useState('')
  const [modulo, setModulo] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchAuditoria = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/admin/auditoria', {
        params: { q: busqueda, accion, modulo, fechaDesde, fechaHasta },
      })
      setRegistros(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar la auditoria.')
    } finally {
      setLoading(false)
    }
  }, [accion, busqueda, fechaDesde, fechaHasta, modulo])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAuditoria()
    }, 350)

    return () => clearTimeout(timeout)
  }, [fetchAuditoria])

  const resumen = useMemo(() => {
    const usuarios = registros.filter((row) => row.modulo === 'Usuarios').length
    const citas = registros.filter((row) => row.modulo === 'Citas').length
    const pagos = registros.filter((row) => row.modulo === 'Pagos').length
    return { usuarios, citas, pagos, total: registros.length }
  }, [registros])

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A3A6B]">Registro de Auditoria</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Revise cambios administrativos, reprogramaciones y pagos marcados en el portal.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1A3A6B] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#15306A]"
          onClick={fetchAuditoria}
          type="button"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#6B7280]">Eventos</p>
              <p className="mt-2 text-3xl font-bold text-[#1A3A6B]">{resumen.total}</p>
            </div>
            <ShieldCheck className="h-8 w-8 text-[#2563EB]" />
          </div>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase text-[#6B7280]">Usuarios</p>
          <p className="mt-2 text-3xl font-bold text-[#111827]">{resumen.usuarios}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase text-[#6B7280]">Citas</p>
          <p className="mt-2 text-3xl font-bold text-[#111827]">{resumen.citas}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase text-[#6B7280]">Pagos</p>
          <p className="mt-2 text-3xl font-bold text-[#111827]">{resumen.pagos}</p>
        </Card>
      </div>

      <Card className="mb-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_210px_190px_170px_170px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <Input
              className="pl-12"
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por usuario, accion, modulo o entidad"
              value={busqueda}
            />
          </div>
          <select
            className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none"
            onChange={(event) => setAccion(event.target.value)}
            value={accion}
          >
            {acciones.map((item) => (
              <option key={item.value || 'all'} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none"
            onChange={(event) => setModulo(event.target.value)}
            value={modulo}
          >
            {modulos.map((item) => (
              <option key={item.value || 'all'} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <Input onChange={(event) => setFechaDesde(event.target.value)} type="date" value={fechaDesde} />
          <Input onChange={(event) => setFechaHasta(event.target.value)} type="date" value={fechaHasta} />
        </div>
      </Card>

      {error && (
        <Card className="mb-5 border border-red-100 bg-red-50 text-sm font-semibold text-red-600">
          {error}
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left table-fixed">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="w-[190px] px-6 py-4">Usuario</th>
                <th className="w-[110px] px-6 py-4">Rol</th>
                <th className="w-[180px] px-6 py-4">Accion realizada</th>
                <th className="w-[130px] px-6 py-4">Modulo</th>
                <th className="px-6 py-4">Detalle</th>
                <th className="w-[210px] px-6 py-4">Fecha y hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-[#6B7280]" colSpan={6}>
                    Cargando auditoria...
                  </td>
                </tr>
              )}

              {!loading &&
                registros.map((row) => (
                  <tr className="bg-white align-top" key={row.id}>
                    <td className="px-6 py-4 font-semibold text-[#111827]">
                      {row.usuarioNombre}
                      <p className="mt-1 text-xs font-normal text-[#9CA3AF]">
                        ID usuario: {row.usuarioId || 'Sistema'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">{row.rol}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                      {accionLabel(row.accion)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="blue">{row.modulo}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm leading-6 text-[#6B7280]">
                      <div className="flex items-start gap-2">
                        <Activity className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
                        <span className="break-words">{detalleTexto(row.detalle)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#9CA3AF]" />
                        {formatDate(row.creadoEn)}
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && !registros.length && (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-[#6B7280]" colSpan={6}>
                    No hay eventos de auditoria para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default AdminAudit
