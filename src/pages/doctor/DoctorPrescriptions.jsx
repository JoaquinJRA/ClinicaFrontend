import { useState } from 'react'
import { Edit3, Plus, Search, Trash2, User, X } from 'lucide-react'
import api from '../../api/axios'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'

const medicamentoVacio = {
  nombre: '',
  dosis: '',
  frecuencia: '',
  fechaInicio: '',
  duracion: 7,
  unidadDuracion: 'Dias',
  instrucciones: '',
}

const toDateInput = (fecha) => {
  if (!fecha) return ''
  return new Date(fecha).toISOString().slice(0, 10)
}

function DoctorPrescriptions() {
  const [busqueda, setBusqueda] = useState('')
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  const [resultadosBusqueda, setResultadosBusqueda] = useState([])
  const [prescripcionesActivas, setPrescripcionesActivas] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [medicamento, setMedicamento] = useState({ ...medicamentoVacio })
  const [editandoId, setEditandoId] = useState(null)
  const [medicamentoSuspender, setMedicamentoSuspender] = useState(null)

  const cargarPrescripcionesActivas = async (pacienteId) => {
    const res = await api.get(
      `/doctor/pacientes/${pacienteId}/prescripciones-activas`,
    )
    setPrescripcionesActivas(res.data)
  }

  const handleBuscar = async (valor) => {
    setBusqueda(valor)

    if (valor.length < 2) {
      setResultadosBusqueda([])
      setShowDropdown(false)
      return
    }

    const res = await api.get('/doctor/pacientes/buscar', {
      params: { q: valor },
    })
    setResultadosBusqueda(res.data)
    setShowDropdown(true)
  }

  const handleSeleccionarPaciente = async (paciente) => {
    const perfilRes = await api.get(`/doctor/pacientes/${paciente.id}/perfil-medico`)
    setPacienteSeleccionado({ id: paciente.id, dni: paciente.dni, ...perfilRes.data })
    setShowDropdown(false)
    setBusqueda('')
    setEditandoId(null)
    setMedicamento({ ...medicamentoVacio })
    await cargarPrescripcionesActivas(paciente.id)
  }

  const actualizarMedicamento = (campo, valor) => {
    setMedicamento((actual) => ({ ...actual, [campo]: valor }))
  }

  const limpiarFormulario = () => {
    setEditandoId(null)
    setMedicamento({ ...medicamentoVacio })
  }

  const handleGuardarMedicacion = async () => {
    if (!pacienteSeleccionado) {
      alert('Selecciona un paciente')
      return
    }

    if (!medicamento.nombre || !medicamento.dosis) {
      alert('Completa nombre y dosis')
      return
    }

    if (editandoId) {
      await api.put(`/doctor/prescripciones/${editandoId}`, medicamento)
    } else {
      await api.post(
        `/doctor/pacientes/${pacienteSeleccionado.id}/prescripciones`,
        { medicamentos: [medicamento] },
      )
    }

    limpiarFormulario()
    await cargarPrescripcionesActivas(pacienteSeleccionado.id)
  }

  const handleEditar = (med) => {
    setEditandoId(med.id)
    setMedicamento({
      nombre: med.nombre || '',
      dosis: med.dosis || '',
      frecuencia: med.frecuencia || '',
      fechaInicio: toDateInput(med.fechaInicio),
      duracion: med.duracion ?? 7,
      unidadDuracion: med.unidadDuracion || 'Dias',
      instrucciones: med.instrucciones || '',
    })
  }

  const handleEliminarPrescripcion = async () => {
    if (!medicamentoSuspender) return

    await api.delete(`/doctor/prescripciones/${medicamentoSuspender.id}`)
    setMedicamentoSuspender(null)
    if (pacienteSeleccionado) {
      await cargarPrescripcionesActivas(pacienteSeleccionado.id)
    }
  }

  return (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
      <section className="min-w-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1A3A6B]">
            Tratamientos Activos
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Administre medicacion vigente, renovaciones y suspensiones del paciente.
          </p>
        </div>

        <Card className="mb-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <Input
              className="pl-12"
              onChange={(event) => handleBuscar(event.target.value)}
              placeholder="Buscar paciente por nombre, apellido o DNI"
              value={busqueda}
            />
            {showDropdown && resultadosBusqueda.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100">
                {resultadosBusqueda.map((paciente) => (
                  <button
                    className="block w-full px-4 py-3 text-left text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
                    key={paciente.id}
                    onClick={() => handleSeleccionarPaciente(paciente)}
                    type="button"
                  >
                    {paciente.nombre} {paciente.apellido} - DNI {paciente.dni} - {paciente.codigo}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <User className="h-7 w-7 text-[#2563EB]" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-[#111827]">
              {pacienteSeleccionado
                ? `${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido}`
                : 'Seleccione un paciente'}
            </p>
            <p className="text-sm font-semibold text-[#6B7280]">
              {pacienteSeleccionado
                ? `${pacienteSeleccionado.codigo} - DNI ${pacienteSeleccionado.dni ?? '-'}`
                : '#CL0000'}
            </p>
            {pacienteSeleccionado && (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Peso</p>
                  <p className="mt-1 font-bold text-[#111827]">
                    {pacienteSeleccionado.peso ? `${pacienteSeleccionado.peso} kg` : 'No registrado'}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Grupo sanguineo</p>
                  <p className="mt-1 font-bold text-[#111827]">
                    {pacienteSeleccionado.grupoSanguineo || 'No registrado'}
                  </p>
                </div>
                <div className="rounded-2xl bg-red-50/60 px-4 py-3 md:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Alergias</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {pacienteSeleccionado.alergias?.length ? (
                      pacienteSeleccionado.alergias.map((alergia) => (
                        <Badge key={alergia.id ?? alergia.nombre} variant="severe">
                          {alergia.nombre} {alergia.severidad ? `- ${alergia.severidad}` : ''}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-[#6B7280]">Sin alergias registradas</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                {editandoId ? 'Editar medicacion activa' : 'Agregar medicacion activa'}
              </h2>
              <p className="mt-1 text-xs text-[#6B7280]">
                Use esta seccion para renovaciones, ajustes o medicacion fuera de consulta.
              </p>
            </div>
            {editandoId && (
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
                onClick={limpiarFormulario}
                type="button"
              >
                <X className="h-4 w-4" />
                Cancelar edicion
              </button>
            )}
          </div>

          <div className="mt-5 rounded-2xl bg-gray-50 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">Medicamento</span>
                <Input
                  onChange={(event) => actualizarMedicamento('nombre', event.target.value)}
                  placeholder="Paracetamol"
                  value={medicamento.nombre}
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">Dosis</span>
                <Input
                  onChange={(event) => actualizarMedicamento('dosis', event.target.value)}
                  placeholder="500 mg"
                  value={medicamento.dosis}
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">Frecuencia</span>
                <Input
                  onChange={(event) => actualizarMedicamento('frecuencia', event.target.value)}
                  placeholder="Cada 8 horas"
                  value={medicamento.frecuencia}
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">Fecha inicio</span>
                <Input
                  onChange={(event) => actualizarMedicamento('fechaInicio', event.target.value)}
                  type="date"
                  value={medicamento.fechaInicio}
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">Duracion</span>
                <div className="grid grid-cols-[1fr_130px] gap-3">
                  <Input
                    onChange={(event) => actualizarMedicamento('duracion', Number(event.target.value))}
                    placeholder="7"
                    type="number"
                    value={medicamento.duracion}
                  />
                  <select
                    className="w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none"
                    onChange={(event) => actualizarMedicamento('unidadDuracion', event.target.value)}
                    value={medicamento.unidadDuracion}
                  >
                    <option>Dias</option>
                    <option>Semanas</option>
                    <option>Meses</option>
                  </select>
                </div>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">
                  Instrucciones
                </span>
                <Input
                  onChange={(event) => actualizarMedicamento('instrucciones', event.target.value)}
                  placeholder="Tomar despues de alimentos"
                  value={medicamento.instrucciones}
                />
              </label>
            </div>
          </div>

          <Button className="mt-6 w-full" onClick={handleGuardarMedicacion} type="button">
            {editandoId ? 'Guardar cambios' : 'Agregar medicacion activa'}
          </Button>
        </Card>
      </section>

      <aside className="min-w-0">
        <h2 className="mb-4 text-xl font-bold text-[#1A3A6B]">
          Medicacion activa
        </h2>
        <div className="space-y-4">
          {prescripcionesActivas.length ? (
            prescripcionesActivas.map((med) => (
              <Card key={med.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#111827]">{med.nombre}</h3>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      {med.dosis} {med.frecuencia ? `- ${med.frecuencia}` : ''}
                    </p>
                    {med.instrucciones && (
                      <p className="mt-2 text-sm text-[#6B7280]">{med.instrucciones}</p>
                    )}
                    <Badge className="mt-4" variant="blue">
                      {med.diasRestantes ?? 0} dias restantes
                    </Badge>
                  </div>
                </div>
                <div className="mt-5 flex gap-3">
                  <button
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
                    onClick={() => handleEditar(med)}
                    type="button"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-50 px-4 py-3 text-sm font-semibold text-[#EF4444] transition hover:bg-red-100"
                    onClick={() => setMedicamentoSuspender(med)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                    Suspender
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-sm text-[#6B7280]">
                Sin medicacion activa registrada
              </p>
            </Card>
          )}
        </div>
      </aside>

      {medicamentoSuspender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-96 max-w-full rounded-3xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#EF4444]">
              <Trash2 className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A3A6B]">
              Suspender medicamento
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6B7280]">
              Deseas suspender{' '}
              <span className="font-bold text-[#111827]">
                {medicamentoSuspender.nombre}
              </span>{' '}
              de la medicacion activa del paciente?
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1 bg-[#EF4444] hover:bg-red-600" onClick={handleEliminarPrescripcion}>
                Aceptar
              </Button>
              <button
                className="flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
                onClick={() => setMedicamentoSuspender(null)}
                type="button"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorPrescriptions
