import { useCallback, useEffect, useState } from 'react'
import { Check, Eye, Search } from 'lucide-react'
import api from '../../api/axios'
import Badge from '../../components/Badge'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Modal from '../../components/Modal'

const estadoMap = {
  'Todos los estados': '',
  Pendiente: 'PENDIENTE',
  Pagado: 'PAGADO',
  Fallido: 'FALLIDO',
}

const paymentVariant = {
  PENDIENTE: 'pending',
  PAGADO: 'confirmed',
  FALLIDO: 'canceled',
}

const paymentLabel = {
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado',
  FALLIDO: 'Fallido',
}

const formatFecha = (fecha) =>
  new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

const getPaciente = (pago) =>
  `${pago.cita.paciente.usuario.nombre} ${pago.cita.paciente.usuario.apellido}`

const getMedico = (pago) =>
  pago.cita.medico.usuario
    ? `Dr. ${pago.cita.medico.usuario.nombre} ${pago.cita.medico.usuario.apellido}`
    : '—'

function AdminPayments() {
  const [resumen, setResumen] = useState({
    totalRecaudado: 0,
    pagosPendientes: 0,
    pagosCancelados: 0,
  })
  const [pagos, setPagos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos los estados')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [pagoSel, setPagoSel] = useState(null)
  const [showDetalle, setShowDetalle] = useState(false)

  const fetchResumen = useCallback(async () => {
    const res = await api.get('/admin/pagos/resumen')
    setResumen(res.data)
  }, [])

  const fetchPagos = useCallback(async () => {
    const res = await api.get('/admin/pagos', {
      params: {
        ...(busqueda && { q: busqueda }),
        ...(estadoMap[filtroEstado] && { estado: estadoMap[filtroEstado] }),
        ...(fechaDesde && { fechaDesde }),
        ...(fechaHasta && { fechaHasta }),
      },
    })
    setPagos(res.data)
  }, [busqueda, fechaDesde, fechaHasta, filtroEstado])

  useEffect(() => {
    fetchResumen()
  }, [fetchResumen])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPagos()
    }, 400)

    return () => clearTimeout(timeout)
  }, [fetchPagos])

  const handleMarcarPagado = async (id) => {
    if (!confirm('¿Marcar este pago como pagado?')) return

    await api.patch(`/admin/pagos/${id}/marcar-pagado`)
    await fetchPagos()
    await fetchResumen()
  }

  const abrirDetalle = (pago) => {
    setPagoSel(pago)
    setShowDetalle(true)
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A3A6B]">Gestión de Pagos</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Controle estados de pago y montos por cita registrada.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Total recaudado</p>
          <p className="mt-3 text-3xl font-bold text-[#1A3A6B]">
            S/ {resumen.totalRecaudado.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Pagos pendientes</p>
          <p className="mt-3 text-3xl font-bold text-[#1A3A6B]">{resumen.pagosPendientes}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Pagos cancelados</p>
          <p className="mt-3 text-3xl font-bold text-[#1A3A6B]">{resumen.pagosCancelados}</p>
        </Card>
      </div>

      <Card className="mb-5">
        {/* Filtros visuales de pagos. */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_190px_190px_190px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <Input
              className="pl-12"
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar paciente o ID de cita"
              value={busqueda}
            />
          </div>
          <select
            className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none"
            onChange={(event) => setFiltroEstado(event.target.value)}
            value={filtroEstado}
          >
            <option>Todos los estados</option>
            <option>Pendiente</option>
            <option>Pagado</option>
            <option>Fallido</option>
          </select>
          <Input
            onChange={(event) => setFechaDesde(event.target.value)}
            type="date"
            value={fechaDesde}
          />
          <Input
            onChange={(event) => setFechaHasta(event.target.value)}
            type="date"
            value={fechaHasta}
          />
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">ID Cita</th>
                <th className="px-6 py-4">Tipo de consulta</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagos.map((pago) => (
                <tr className="bg-white" key={pago.id}>
                  <td className="px-6 py-4 font-semibold text-[#111827]">{getPaciente(pago)}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">CIT-{pago.citaId}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">
                    {pago.cita.medico.especialidad.nombre}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#111827]">S/ {pago.monto}</td>
                  <td className="px-6 py-4">
                    <Badge variant={paymentVariant[pago.estado]}>{paymentLabel[pago.estado]}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{formatFecha(pago.creadoEn)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[#2563EB]"
                        onClick={() => abrirDetalle(pago)}
                        type="button"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {pago.estado === 'PENDIENTE' && (
                        <button
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-700"
                          onClick={() => handleMarcarPagado(pago.id)}
                          type="button"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!pagos.length && (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-[#6B7280]" colSpan={7}>
                    No hay pagos para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={showDetalle}
        maxWidth="max-w-2xl"
        onClose={() => setShowDetalle(false)}
        title="Detalle de pago"
      >
        {pagoSel && (
          <div className="grid grid-cols-1 gap-4 text-sm text-[#6B7280] md:grid-cols-2">
            <p><span className="font-bold text-[#111827]">Paciente:</span> {getPaciente(pagoSel)}</p>
            <p><span className="font-bold text-[#111827]">Médico:</span> {getMedico(pagoSel)}</p>
            <p><span className="font-bold text-[#111827]">Especialidad:</span> {pagoSel.cita.medico.especialidad.nombre}</p>
            <p><span className="font-bold text-[#111827]">Fecha cita:</span> {formatFecha(pagoSel.cita.fecha)}</p>
            <p><span className="font-bold text-[#111827]">Monto:</span> S/ {pagoSel.monto}</p>
            <p><span className="font-bold text-[#111827]">Estado:</span> {paymentLabel[pagoSel.estado]}</p>
            <p><span className="font-bold text-[#111827]">Método de pago:</span> {pagoSel.metodoPago}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminPayments
