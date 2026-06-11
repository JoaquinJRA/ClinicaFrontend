import { useState } from 'react'
import { Plus, Search, Trash2, User } from 'lucide-react'
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
  unidadDuracion: 'Días',
  instrucciones: '',
}

function DoctorPrescriptions() {
  const [busqueda, setBusqueda] = useState('')
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  const [resultadosBusqueda, setResultadosBusqueda] = useState([])
  const [prescripcionesActivas, setPrescripcionesActivas] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [medicamentos, setMedicamentos] = useState([{ ...medicamentoVacio }])

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
    await cargarPrescripcionesActivas(paciente.id)
  }

  const agregarMedicamento = () => {
    setMedicamentos((actuales) => [...actuales, { ...medicamentoVacio }])
  }

  const actualizarMedicamento = (index, campo, valor) => {
    const copia = [...medicamentos]
    copia[index][campo] = valor
    setMedicamentos(copia)
  }

  const handleEmitir = async () => {
    if (!pacienteSeleccionado) {
      alert('Selecciona un paciente')
      return
    }

    if (medicamentos.some((medicamento) => !medicamento.nombre || !medicamento.dosis)) {
      alert('Completa nombre y dosis')
      return
    }

    await api.post(
      `/doctor/pacientes/${pacienteSeleccionado.id}/prescripciones`,
      { medicamentos },
    )
    alert('Prescripción emitida')
    setMedicamentos([{ ...medicamentoVacio }])
    await cargarPrescripcionesActivas(pacienteSeleccionado.id)
  }

  const handleEliminarPrescripcion = async (medId) => {
    if (!confirm('¿Eliminar esta prescripción?')) return

    await api.delete(`/doctor/prescripciones/${medId}`)
    if (pacienteSeleccionado) {
      await cargarPrescripcionesActivas(pacienteSeleccionado.id)
    }
  }

  return (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
      <section className="min-w-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1A3A6B]">Prescripciones Médicas</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Emita recetas visuales para el paciente seleccionado.
          </p>
        </div>

        <Card className="mb-5">
          {/* Búsqueda visual de paciente. */}
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
                    {paciente.nombre} {paciente.apellido} — DNI {paciente.dni} — {paciente.codigo}
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
                ? `${pacienteSeleccionado.codigo} · DNI ${pacienteSeleccionado.dni ?? '—'}`
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
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Grupo sanguíneo</p>
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
                          {alergia.nombre} {alergia.severidad ? `· ${alergia.severidad}` : ''}
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
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Formulario de nueva prescripción
          </h2>

          <div className="mt-5 space-y-5">
            {medicamentos.map((medicamento, index) => (
              <div className="rounded-2xl bg-gray-50 p-4" key={index}>
                <p className="mb-4 text-sm font-bold text-[#1A3A6B]">Medicamento {index + 1}</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-semibold text-[#111827]">Medicamento</span>
                    <Input
                      onChange={(event) => actualizarMedicamento(index, 'nombre', event.target.value)}
                      placeholder="Paracetamol"
                      value={medicamento.nombre}
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-semibold text-[#111827]">Dosis</span>
                    <Input
                      onChange={(event) => actualizarMedicamento(index, 'dosis', event.target.value)}
                      placeholder="500 mg"
                      value={medicamento.dosis}
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-semibold text-[#111827]">Frecuencia</span>
                    <Input
                      onChange={(event) => actualizarMedicamento(index, 'frecuencia', event.target.value)}
                      placeholder="Cada 8 horas"
                      value={medicamento.frecuencia}
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-semibold text-[#111827]">Fecha inicio</span>
                    <Input
                      onChange={(event) => actualizarMedicamento(index, 'fechaInicio', event.target.value)}
                      type="date"
                      value={medicamento.fechaInicio}
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-semibold text-[#111827]">Duración</span>
                    <div className="grid grid-cols-[1fr_130px] gap-3">
                      <Input
                        onChange={(event) => actualizarMedicamento(index, 'duracion', Number(event.target.value))}
                        placeholder="7"
                        type="number"
                        value={medicamento.duracion}
                      />
                      <select
                        className="w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none"
                        onChange={(event) => actualizarMedicamento(index, 'unidadDuracion', event.target.value)}
                        value={medicamento.unidadDuracion}
                      >
                        <option>Días</option>
                        <option>Semanas</option>
                        <option>Meses</option>
                      </select>
                    </div>
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-semibold text-[#111827]">
                      Instrucciones adicionales
                    </span>
                    <Input
                      onChange={(event) => actualizarMedicamento(index, 'instrucciones', event.target.value)}
                      placeholder="Tomar después de alimentos"
                      value={medicamento.instrucciones}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
              onClick={agregarMedicamento}
              type="button"
            >
              <Plus className="h-5 w-5" />
              Agregar otro medicamento
            </button>
            <Button onClick={handleEmitir} type="button">Emitir Prescripción →</Button>
          </div>
        </Card>
      </section>

      <aside className="min-w-0">
        <h2 className="mb-4 text-xl font-bold text-[#1A3A6B]">Prescripciones activas</h2>
        <div className="space-y-4">
          {prescripcionesActivas.length ? (
            prescripcionesActivas.map((medicamento) => (
              <Card className="flex items-start justify-between gap-4" key={medicamento.id}>
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">{medicamento.nombre}</h3>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    {medicamento.dosis} · {medicamento.frecuencia}
                  </p>
                  <Badge className="mt-4" variant="blue">
                    {medicamento.diasRestantes ?? 0} días restantes
                  </Badge>
                </div>
                <button
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#EF4444] transition hover:bg-red-100"
                  onClick={() => handleEliminarPrescripcion(medicamento.id)}
                  type="button"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-sm text-[#6B7280]">Sin prescripciones activas</p>
            </Card>
          )}
        </div>
      </aside>
    </div>
  )
}

export default DoctorPrescriptions
