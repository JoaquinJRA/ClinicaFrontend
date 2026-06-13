import { useCallback, useEffect, useState } from 'react'
import {
  Eye,
  Pencil,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react'
import api from '../../api/axios'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Modal from '../../components/Modal'

const rolMap = {
  Pacientes: 'PACIENTE',
  Médicos: 'MEDICO',
  Administradores: 'ADMIN',
}

const estadoMap = {
  Activos: 'ACTIVO',
  Inactivos: 'INACTIVO',
  Todos: '',
}

const formInicial = {
  nombre: '',
  apellido: '',
  email: '',
  contrasena: '',
  rol: 'PACIENTE',
  dni: '',
  telefono: '',
  direccion: '',
  fechaNacimiento: '',
  genero: 'MASCULINO',
  grupoSanguineo: '',
  peso: '',
  altura: '',
  presionArterial: '',
  antecedentesMedicos: '',
  notasGenerales: '',
  alergias: [],
  medicamentos: [],
  numeroColegiatura: '',
  especialidadId: '',
}

const alergiaInicial = { nombre: '', severidad: 'LEVE' }

const medicamentoInicial = {
  nombre: '',
  dosis: '',
  frecuencia: '',
  instrucciones: '',
}

const getUsuarioNombre = (usuario) => `${usuario.nombre} ${usuario.apellido}`

const getUsuarioDocumento = (usuario) =>
  usuario.paciente?.dni ||
  (usuario.medico?.numeroColegiatura
    ? `CMP-${usuario.medico.numeroColegiatura}`
    : 'ADMIN')

const getUsuarioTelefono = (usuario) =>
  usuario.paciente?.telefono || usuario.medico?.telefono || '—'

const fechaInput = (fecha) => (fecha ? fecha.slice(0, 10) : '')

const limpiarAlergias = (alergias) =>
  alergias
    .map((alergia) => ({
      nombre: alergia.nombre.trim(),
      severidad: alergia.severidad || 'LEVE',
    }))
    .filter((alergia) => alergia.nombre)

const limpiarMedicamentos = (medicamentos) =>
  medicamentos
    .map((medicamento) => ({
      nombre: medicamento.nombre.trim(),
      dosis: medicamento.dosis.trim(),
      frecuencia: medicamento.frecuencia.trim(),
      instrucciones: medicamento.instrucciones.trim(),
      activo: true,
    }))
    .filter((medicamento) => medicamento.nombre && medicamento.dosis)

function AdminUsers() {
  const [usuarios, setUsuarios] = useState([])
  const [filtroRol, setFiltroRol] = useState('Pacientes')
  const [filtroEstado, setFiltroEstado] = useState('Activos')
  const [busqueda, setBusqueda] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalTipo, setModalTipo] = useState('crear')
  const [usuarioSel, setUsuarioSel] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [usuarioEliminar, setUsuarioEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [formError, setFormError] = useState('')
  const [especialidades, setEspecialidades] = useState([])
  const [form, setForm] = useState(formInicial)

  const fetchUsuarios = useCallback(async () => {
    const res = await api.get('/admin/usuarios', {
      params: {
        rol: rolMap[filtroRol],
        ...(estadoMap[filtroEstado] && { estado: estadoMap[filtroEstado] }),
        q: busqueda,
      },
    })
    setUsuarios(res.data)
  }, [busqueda, filtroEstado, filtroRol])

  const fetchEspecialidades = useCallback(async () => {
    const res = await api.get('/admin/especialidades')
    setEspecialidades(res.data)
  }, [])

  useEffect(() => {
    fetchEspecialidades()
  }, [fetchEspecialidades])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsuarios()
    }, 400)

    return () => clearTimeout(timeout)
  }, [fetchUsuarios])

  const actualizarForm = (campo, valor) => {
    setForm((actual) => ({ ...actual, [campo]: valor }))
  }

  const actualizarAlergia = (index, campo, valor) => {
    setForm((actual) => ({
      ...actual,
      alergias: actual.alergias.map((alergia, itemIndex) =>
        itemIndex === index ? { ...alergia, [campo]: valor } : alergia,
      ),
    }))
  }

  const agregarAlergia = () => {
    setForm((actual) => ({
      ...actual,
      alergias: [...actual.alergias, { ...alergiaInicial }],
    }))
  }

  const quitarAlergia = (index) => {
    setForm((actual) => ({
      ...actual,
      alergias: actual.alergias.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const actualizarMedicamento = (index, campo, valor) => {
    setForm((actual) => ({
      ...actual,
      medicamentos: actual.medicamentos.map((medicamento, itemIndex) =>
        itemIndex === index ? { ...medicamento, [campo]: valor } : medicamento,
      ),
    }))
  }

  const agregarMedicamento = () => {
    setForm((actual) => ({
      ...actual,
      medicamentos: [...actual.medicamentos, { ...medicamentoInicial }],
    }))
  }

  const quitarMedicamento = (index) => {
    setForm((actual) => ({
      ...actual,
      medicamentos: actual.medicamentos.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const abrirCrear = () => {
    setFormError('')
    setForm({
      ...formInicial,
      rol: rolMap[filtroRol],
      alergias: [{ ...alergiaInicial }],
      medicamentos: [{ ...medicamentoInicial }],
    })
    setUsuarioSel(null)
    setModalTipo('crear')
    setShowModal(true)
  }

  const abrirEditar = (usuario) => {
    setFormError('')
    setUsuarioSel(usuario)
    setForm({
      ...formInicial,
      nombre: usuario.nombre ?? '',
      apellido: usuario.apellido ?? '',
      email: usuario.email ?? '',
      rol: usuario.rol?.nombre ?? rolMap[filtroRol],
      dni: usuario.paciente?.dni ?? '',
      telefono: usuario.paciente?.telefono ?? usuario.medico?.telefono ?? '',
      direccion: usuario.paciente?.direccion ?? '',
      fechaNacimiento: fechaInput(usuario.paciente?.fechaNacimiento),
      genero: usuario.paciente?.genero ?? 'MASCULINO',
      grupoSanguineo: usuario.paciente?.grupoSanguineo ?? '',
      peso: usuario.paciente?.peso ?? '',
      altura: usuario.paciente?.altura ?? '',
      presionArterial: usuario.paciente?.presionArterial ?? '',
      antecedentesMedicos: usuario.paciente?.antecedentesMedicos ?? '',
      notasGenerales: usuario.paciente?.historialMedico?.notasGenerales ?? '',
      alergias: usuario.paciente?.alergias?.length
        ? usuario.paciente.alergias.map((alergia) => ({
            nombre: alergia.nombre ?? '',
            severidad: alergia.severidad ?? 'LEVE',
          }))
        : [{ ...alergiaInicial }],
      medicamentos: usuario.paciente?.medicamentos?.length
        ? usuario.paciente.medicamentos.map((medicamento) => ({
            nombre: medicamento.nombre ?? '',
            dosis: medicamento.dosis ?? '',
            frecuencia: medicamento.frecuencia ?? '',
            instrucciones: medicamento.instrucciones ?? '',
          }))
        : [{ ...medicamentoInicial }],
      numeroColegiatura: usuario.medico?.numeroColegiatura ?? '',
      especialidadId: usuario.medico?.especialidadId ?? '',
    })
    setModalTipo('editar')
    setShowModal(true)
  }

  const abrirVer = (usuario) => {
    setUsuarioSel(usuario)
    setModalTipo('ver')
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setUsuarioSel(null)
    setForm(formInicial)
    setFormError('')
  }

  const payloadForm = () => {
    const base = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim(),
      rol: form.rol,
      ...(modalTipo === 'crear' && { contrasena: form.contrasena }),
    }

    if (form.rol === 'PACIENTE') {
      return {
        ...base,
        dni: form.dni.trim(),
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
        fechaNacimiento: form.fechaNacimiento || undefined,
        genero: form.genero,
        grupoSanguineo: form.grupoSanguineo.trim(),
        peso: form.peso === '' ? undefined : Number(form.peso),
        altura: form.altura === '' ? undefined : Number(form.altura),
        presionArterial: form.presionArterial.trim(),
        antecedentesMedicos: form.antecedentesMedicos.trim(),
        notasGenerales: form.notasGenerales.trim(),
        alergias: limpiarAlergias(form.alergias),
        medicamentos: limpiarMedicamentos(form.medicamentos),
      }
    }

    if (form.rol === 'MEDICO') {
      return {
        ...base,
        telefono: form.telefono.trim(),
        numeroColegiatura: form.numeroColegiatura.trim(),
        especialidadId:
          form.especialidadId === '' ? undefined : Number(form.especialidadId),
      }
    }

    return base
  }

  const handleGuardar = async () => {
    try {
      setGuardando(true)
      setFormError('')
      const payload = payloadForm()

      if (!payload.nombre || !payload.apellido || !payload.email) {
        setFormError('Completa nombre, apellido y correo.')
        return
      }
      if (modalTipo === 'crear' && !payload.contrasena) {
        setFormError('La contraseña es obligatoria al crear un usuario.')
        return
      }
      if (payload.rol === 'PACIENTE' && !payload.dni) {
        setFormError('El DNI del paciente es obligatorio.')
        return
      }
      if (payload.rol === 'MEDICO' && (!payload.numeroColegiatura || !payload.especialidadId)) {
        setFormError('La colegiatura y especialidad del médico son obligatorias.')
        return
      }

      if (modalTipo === 'crear') {
        await api.post('/admin/usuarios', payload)
      } else {
        await api.put(`/admin/usuarios/${usuarioSel.id}`, payload)
      }

      await fetchUsuarios()
      cerrarModal()
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          'No se pudo guardar el usuario. Revisa los datos e intenta nuevamente.',
      )
    } finally {
      setGuardando(false)
    }
  }

  const handleToggle = async (usuario) => {
    await api.patch(`/admin/usuarios/${usuario.id}/estado`, {
      estado: usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO',
    })
    await fetchUsuarios()
  }

  const abrirEliminar = (usuario) => {
    setShowModal(false)
    setUsuarioSel(null)
    setUsuarioEliminar(usuario)
    setShowDeleteModal(true)
  }

  const cerrarEliminar = () => {
    if (eliminando) return
    setShowDeleteModal(false)
    setUsuarioEliminar(null)
  }

  const confirmarEliminar = async () => {
    if (!usuarioEliminar) return

    try {
      setEliminando(true)
      await api.delete(`/admin/usuarios/${usuarioEliminar.id}`)
      await fetchUsuarios()
      setShowDeleteModal(false)
      setUsuarioEliminar(null)
    } catch (err) {
      if (err.response?.status === 409) {
        alert('No se puede eliminar: el usuario tiene citas pendientes o confirmadas')
        return
      }
      alert('No se pudo eliminar el usuario. Intenta nuevamente.')
    } finally {
      setEliminando(false)
    }
  }

  /*
  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return

    try {
      await api.delete(`/admin/usuarios/${id}`)
      await fetchUsuarios()
    } catch (err) {
      if (err.response?.status === 409) {
        alert('No se puede eliminar: el usuario tiene citas pendientes o confirmadas')
        return
      }
      throw err
    }
  }

  */
  const mostrarCamposPaciente = form.rol === 'PACIENTE'
  const mostrarCamposMedico = form.rol === 'MEDICO'

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A3A6B]">Usuarios Registrados</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Administre pacientes, médicos y administradores con datos visuales.
          </p>
        </div>
        <Button onClick={abrirCrear} type="button">+ Agregar Usuario</Button>
      </div>

      <Card className="mb-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <Input
              className="pl-12"
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar usuario por nombre, DNI o correo"
              value={busqueda}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(rolMap).map((tab) => (
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filtroRol === tab
                    ? 'bg-[#1A3A6B] text-white'
                    : 'bg-gray-100 text-[#6B7280] hover:bg-blue-50 hover:text-[#2563EB]'
                }`}
                key={tab}
                onClick={() => setFiltroRol(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
          <span className="mr-1 text-xs font-bold uppercase tracking-wide text-[#6B7280]">
            Estado
          </span>
          {Object.keys(estadoMap).map((estado) => (
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filtroEstado === estado
                  ? 'bg-[#1A3A6B] text-white'
                  : 'bg-gray-100 text-[#6B7280] hover:bg-blue-50 hover:text-[#2563EB]'
              }`}
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              type="button"
            >
              {estado}
            </button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        {/* Tabla de usuarios del tab seleccionado. */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">DNI/ID</th>
                <th className="px-6 py-4">Correo</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((usuario) => (
                <tr className="bg-white" key={usuario.id}>
                  <td className="px-6 py-4 font-semibold text-[#111827]">
                    {getUsuarioNombre(usuario)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">
                    {getUsuarioDocumento(usuario)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{usuario.email}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">
                    {getUsuarioTelefono(usuario)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={usuario.estado === 'ACTIVO' ? 'confirmed' : 'canceled'}>
                      {usuario.estado}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[#2563EB]"
                        onClick={() => abrirEditar(usuario)}
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-[#EF4444]"
                        onClick={() => abrirEliminar(usuario)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-[#6B7280]"
                        onClick={() => abrirVer(usuario)}
                        type="button"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-[#6B7280]"
                        onClick={() => handleToggle(usuario)}
                        type="button"
                      >
                        {usuario.estado === 'ACTIVO' ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!usuarios.length && (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-[#6B7280]" colSpan={6}>
                    No hay usuarios para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={showModal && modalTipo !== 'ver'}
        maxWidth="max-w-3xl"
        onClose={cerrarModal}
        title={`${modalTipo === 'editar' ? 'Editar' : 'Agregar'} Usuario`}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#111827]">Nombre</span>
            <Input onChange={(event) => actualizarForm('nombre', event.target.value)} value={form.nombre} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#111827]">Apellido</span>
            <Input onChange={(event) => actualizarForm('apellido', event.target.value)} value={form.apellido} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#111827]">Correo</span>
            <Input onChange={(event) => actualizarForm('email', event.target.value)} type="email" value={form.email} />
          </label>
          {modalTipo === 'crear' && (
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#111827]">Contraseña</span>
              <Input onChange={(event) => actualizarForm('contrasena', event.target.value)} type="password" value={form.contrasena} />
            </label>
          )}
          {modalTipo === 'crear' && (
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#111827]">Rol</span>
              <select
                className="w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none"
                onChange={(event) => actualizarForm('rol', event.target.value)}
                value={form.rol}
              >
                <option value="PACIENTE">Paciente</option>
                <option value="MEDICO">Médico</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </label>
          )}

          {mostrarCamposPaciente && (
            <>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">DNI</span>
                <Input onChange={(event) => actualizarForm('dni', event.target.value)} value={form.dni} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">Teléfono</span>
                <Input onChange={(event) => actualizarForm('telefono', event.target.value)} value={form.telefono} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">Dirección</span>
                <Input onChange={(event) => actualizarForm('direccion', event.target.value)} value={form.direccion} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">F. Nacimiento</span>
                <Input onChange={(event) => actualizarForm('fechaNacimiento', event.target.value)} type="date" value={form.fechaNacimiento} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">Género</span>
                <select
                  className="w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none"
                  onChange={(event) => actualizarForm('genero', event.target.value)}
                  value={form.genero}
                >
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                  <option value="OTRO">Otro</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">Grupo Sanguíneo</span>
                <Input onChange={(event) => actualizarForm('grupoSanguineo', event.target.value)} value={form.grupoSanguineo} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">Peso</span>
                <Input onChange={(event) => actualizarForm('peso', event.target.value)} type="number" value={form.peso} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">Altura</span>
                <Input onChange={(event) => actualizarForm('altura', event.target.value)} type="number" value={form.altura} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">Presión Arterial</span>
                <Input onChange={(event) => actualizarForm('presionArterial', event.target.value)} value={form.presionArterial} />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[#111827]">Antecedentes médicos / operaciones previas</span>
                <textarea
                  className="min-h-[92px] w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none"
                  onChange={(event) => actualizarForm('antecedentesMedicos', event.target.value)}
                  value={form.antecedentesMedicos}
                />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[#111827]">Historial médico</span>
                <textarea
                  className="min-h-[92px] w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none"
                  onChange={(event) => actualizarForm('notasGenerales', event.target.value)}
                  value={form.notasGenerales}
                />
              </label>
              <div className="space-y-3 rounded-2xl border border-gray-100 p-4 md:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-[#111827]">Alergias</p>
                  <button
                    className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-[#2563EB]"
                    onClick={agregarAlergia}
                    type="button"
                  >
                    + Agregar
                  </button>
                </div>
                {form.alergias.map((alergia, index) => (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_auto]" key={`alergia-${index}`}>
                    <Input
                      onChange={(event) => actualizarAlergia(index, 'nombre', event.target.value)}
                      placeholder="Nombre de alergia"
                      value={alergia.nombre}
                    />
                    <select
                      className="w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none"
                      onChange={(event) => actualizarAlergia(index, 'severidad', event.target.value)}
                      value={alergia.severidad}
                    >
                      <option value="SEVERO">Severo</option>
                      <option value="MODERADO">Moderado</option>
                      <option value="LEVE">Leve</option>
                    </select>
                    <button
                      className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-[#EF4444]"
                      onClick={() => quitarAlergia(index)}
                      type="button"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
              <div className="space-y-3 rounded-2xl border border-gray-100 p-4 md:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-[#111827]">Medicamentos activos</p>
                  <button
                    className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-[#2563EB]"
                    onClick={agregarMedicamento}
                    type="button"
                  >
                    + Agregar
                  </button>
                </div>
                {form.medicamentos.map((medicamento, index) => (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2" key={`medicamento-${index}`}>
                    <Input
                      onChange={(event) => actualizarMedicamento(index, 'nombre', event.target.value)}
                      placeholder="Medicamento"
                      value={medicamento.nombre}
                    />
                    <Input
                      onChange={(event) => actualizarMedicamento(index, 'dosis', event.target.value)}
                      placeholder="Dosis"
                      value={medicamento.dosis}
                    />
                    <Input
                      onChange={(event) => actualizarMedicamento(index, 'frecuencia', event.target.value)}
                      placeholder="Frecuencia"
                      value={medicamento.frecuencia}
                    />
                    <div className="flex gap-3">
                      <Input
                        onChange={(event) => actualizarMedicamento(index, 'instrucciones', event.target.value)}
                        placeholder="Instrucciones"
                        value={medicamento.instrucciones}
                      />
                      <button
                        className="shrink-0 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-[#EF4444]"
                        onClick={() => quitarMedicamento(index)}
                        type="button"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {mostrarCamposMedico && (
            <>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">Teléfono</span>
                <Input onChange={(event) => actualizarForm('telefono', event.target.value)} value={form.telefono} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">CMP</span>
                <Input onChange={(event) => actualizarForm('numeroColegiatura', event.target.value)} value={form.numeroColegiatura} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#111827]">Especialidad</span>
                <select
                  className="w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none"
                  onChange={(event) => actualizarForm('especialidadId', event.target.value)}
                  value={form.especialidadId}
                >
                  <option value="">Seleccionar</option>
                  {especialidades.map((especialidad) => (
                    <option key={especialidad.id} value={especialidad.id}>
                      {especialidad.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>
        {formError && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {formError}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#6B7280]" onClick={cerrarModal} type="button">
            Cancelar
          </button>
          <Button disabled={guardando} onClick={handleGuardar} type="button">
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showModal && modalTipo === 'ver'}
        maxWidth="max-w-3xl"
        onClose={cerrarModal}
        title="Detalle de usuario"
      >
        {usuarioSel && (
          <div className="space-y-5 text-sm text-[#6B7280]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <p><span className="font-bold text-[#111827]">Nombre:</span> {getUsuarioNombre(usuarioSel)}</p>
              <p><span className="font-bold text-[#111827]">Correo:</span> {usuarioSel.email}</p>
              <p><span className="font-bold text-[#111827]">Rol:</span> {usuarioSel.rol?.nombre}</p>
              <p><span className="font-bold text-[#111827]">Estado:</span> {usuarioSel.estado}</p>
              <p><span className="font-bold text-[#111827]">DNI/ID:</span> {getUsuarioDocumento(usuarioSel)}</p>
              <p><span className="font-bold text-[#111827]">Teléfono:</span> {getUsuarioTelefono(usuarioSel)}</p>
              {usuarioSel.paciente && (
                <>
                  <p><span className="font-bold text-[#111827]">Dirección:</span> {usuarioSel.paciente.direccion || '—'}</p>
                  <p><span className="font-bold text-[#111827]">Nacimiento:</span> {fechaInput(usuarioSel.paciente.fechaNacimiento) || '—'}</p>
                  <p><span className="font-bold text-[#111827]">Género:</span> {usuarioSel.paciente.genero}</p>
                  <p><span className="font-bold text-[#111827]">Grupo sanguíneo:</span> {usuarioSel.paciente.grupoSanguineo || '—'}</p>
                  <p><span className="font-bold text-[#111827]">Peso:</span> {usuarioSel.paciente.peso ?? '—'}</p>
                  <p><span className="font-bold text-[#111827]">Altura:</span> {usuarioSel.paciente.altura ?? '—'}</p>
                  <p><span className="font-bold text-[#111827]">Presión arterial:</span> {usuarioSel.paciente.presionArterial || '—'}</p>
                  <p className="md:col-span-2"><span className="font-bold text-[#111827]">Antecedentes:</span> {usuarioSel.paciente.antecedentesMedicos || '—'}</p>
                  <p className="md:col-span-2"><span className="font-bold text-[#111827]">Historial médico:</span> {usuarioSel.paciente.historialMedico?.notasGenerales || '—'}</p>
                </>
              )}
              {usuarioSel.medico && (
                <>
                  <p><span className="font-bold text-[#111827]">Colegiatura:</span> {usuarioSel.medico.numeroColegiatura}</p>
                  <p><span className="font-bold text-[#111827]">Especialidad:</span> {usuarioSel.medico.especialidad?.nombre}</p>
                </>
              )}
            </div>

            {usuarioSel.paciente && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 font-bold text-[#111827]">Alergias</p>
                  <div className="flex flex-wrap gap-2">
                    {usuarioSel.paciente.alergias?.length ? (
                      usuarioSel.paciente.alergias.map((alergia) => (
                        <Badge key={alergia.id} variant="severe">{alergia.nombre}</Badge>
                      ))
                    ) : (
                      <span>Sin alergias</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 font-bold text-[#111827]">Medicamentos activos</p>
                  <div className="flex flex-wrap gap-2">
                    {usuarioSel.paciente.medicamentos?.length ? (
                      usuarioSel.paciente.medicamentos.map((medicamento) => (
                        <Badge key={medicamento.id} variant="blue">
                          {medicamento.nombre} · {medicamento.dosis}
                        </Badge>
                      ))
                    ) : (
                      <span>Sin medicamentos activos</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {showDeleteModal && usuarioEliminar && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#EF4444]">
              <Trash2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A3A6B]">Eliminar usuario</h2>
            <p className="mt-3 text-sm leading-6 text-[#6B7280]">
              ¿Estás seguro de eliminar a{' '}
              <span className="font-bold text-[#111827]">
                {getUsuarioNombre(usuarioEliminar)}
              </span>
              ? Esta acción desactivará su cuenta si no tiene citas pendientes o confirmadas.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                className="rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#6B7280] transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={eliminando}
                onClick={cerrarEliminar}
                type="button"
              >
                No
              </button>
              <button
                className="rounded-full bg-[#EF4444] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={eliminando}
                onClick={confirmarEliminar}
                type="button"
              >
                {eliminando ? 'Eliminando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
