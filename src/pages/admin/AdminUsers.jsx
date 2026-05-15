import { useMemo, useState } from 'react'
import { Pencil, Search, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Modal from '../../components/Modal'

const userGroups = {
  Pacientes: [
    {
      name: 'Carlos García',
      id: 'DNI 12345678',
      email: 'carlos.garcia@email.com',
      phone: '+51 999 111 222',
      status: 'Activo',
    },
  ],
  Médicos: [
    {
      name: 'Dra. Luz Salazar',
      id: 'CMP 54821',
      email: 'luz.salazar@clinicaluz.pe',
      phone: '+51 966 444 555',
      status: 'Activo',
    },
  ],
  Administradores: [
    {
      name: 'Andrea Castillo',
      id: 'ADM-001',
      email: 'andrea.castillo@clinicaluz.pe',
      phone: '+51 944 666 777',
      status: 'Activo',
    },
  ],
}

function UserForm({ type }) {
  const isDoctor = type === 'Médicos'
  const isAdmin = type === 'Administradores'

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <label>
        <span className="mb-2 block text-sm font-semibold text-[#111827]">Nombre</span>
        <Input placeholder="Carlos" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-semibold text-[#111827]">Apellido</span>
        <Input placeholder="García" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-semibold text-[#111827]">DNI</span>
        <Input placeholder="12345678" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-semibold text-[#111827]">Correo</span>
        <Input placeholder="usuario@clinicaluz.pe" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-semibold text-[#111827]">Teléfono</span>
        <Input placeholder="+51 999 999 999" />
      </label>
      {!isAdmin && (
        <label>
          <span className="mb-2 block text-sm font-semibold text-[#111827]">
            {isDoctor ? 'Especialidad' : 'Dirección'}
          </span>
          {isDoctor ? (
            <select className="w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none">
              <option>Medicina General</option>
              <option>Neumología</option>
              <option>Traumatología</option>
            </select>
          ) : (
            <Input placeholder="Av. Luz 123, Lima" />
          )}
        </label>
      )}
      {isDoctor ? (
        <>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#111827]">CMP</span>
            <Input placeholder="54821" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#111827]">Horario</span>
            <Input placeholder="Lun-Vie 08:00 - 16:00" />
          </label>
        </>
      ) : (
        !isAdmin && (
          <>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#111827]">F. Nacimiento</span>
              <Input type="date" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#111827]">Género</span>
              <select className="w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none">
                <option>Hombre</option>
                <option>Mujer</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#111827]">Grupo Sanguíneo</span>
              <Input placeholder="O+" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#111827]">Peso</span>
              <Input placeholder="65 kg" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#111827]">Altura</span>
              <Input placeholder="168 cm" />
            </label>
          </>
        )
      )}
      <label>
        <span className="mb-2 block text-sm font-semibold text-[#111827]">Estado</span>
        <select className="w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none">
          <option>Activo</option>
          <option>Inactivo</option>
        </select>
      </label>
    </div>
  )
}

function AdminUsers() {
  const [activeTab, setActiveTab] = useState('Pacientes')
  const [modalType, setModalType] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  const users = useMemo(() => userGroups[activeTab], [activeTab])

  const openModal = (type, user = null) => {
    setModalType(type)
    setSelectedUser(user)
  }

  const closeModal = () => {
    setModalType(null)
    setSelectedUser(null)
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A3A6B]">Usuarios Registrados</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Administre pacientes, médicos y administradores con datos visuales.
          </p>
        </div>
        <Button onClick={() => openModal('add')} type="button">+ Agregar Usuario</Button>
      </div>

      <Card className="mb-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <Input className="pl-12" placeholder="Buscar usuario por nombre, DNI o correo" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(userGroups).map((tab) => (
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab
                    ? 'bg-[#1A3A6B] text-white'
                    : 'bg-gray-100 text-[#6B7280] hover:bg-blue-50 hover:text-[#2563EB]'
                }`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
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
              {users.map((user) => (
                <tr className="bg-white" key={user.email}>
                  <td className="px-6 py-4 font-semibold text-[#111827]">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{user.id}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{user.phone}</td>
                  <td className="px-6 py-4">
                    <Badge variant={user.status === 'Activo' ? 'confirmed' : 'neutral'}>{user.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[#2563EB]"
                        onClick={() => openModal('edit', user)}
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-[#EF4444]"
                        onClick={() => openModal('delete', user)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-[#6B7280]"
                        type="button"
                      >
                        {user.status === 'Activo' ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={modalType === 'add' || modalType === 'edit'}
        maxWidth="max-w-3xl"
        onClose={closeModal}
        title={`${modalType === 'edit' ? 'Editar' : 'Agregar'} ${activeTab.slice(0, -1)}`}
      >
        <UserForm type={activeTab} />
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#6B7280]" onClick={closeModal} type="button">
            Cancelar
          </button>
          <Button onClick={closeModal} type="button">Guardar</Button>
        </div>
      </Modal>

      <Modal isOpen={modalType === 'delete'} onClose={closeModal} title="Eliminar usuario">
        <p className="text-sm leading-6 text-[#6B7280]">
          ¿Desea eliminar a {selectedUser?.name}? Esta acción es visual y no modifica datos reales.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#6B7280]" onClick={closeModal} type="button">
            Cancelar
          </button>
          <button className="rounded-full bg-[#EF4444] px-5 py-3 font-semibold text-white" onClick={closeModal} type="button">
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default AdminUsers
