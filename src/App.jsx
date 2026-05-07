import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [nodeStatus, setNodeStatus] = useState(null)
  const [javaStatus, setJavaStatus] = useState(null)
  const [pacientes, setPacientes] = useState([])

  useEffect(() => {
    async function loadData() {
      const [nodeResponse, javaResponse, pacientesResponse] = await Promise.all([
        fetch('/api/salud'),
        fetch('/java-api/salud'),
        fetch('/api/pacientes'),
      ])

      setNodeStatus(await nodeResponse.json())
      setJavaStatus(await javaResponse.json())
      setPacientes(await pacientesResponse.json())
    }

    loadData().catch((error) => {
      console.error('No se pudo cargar la informacion inicial', error)
    })
  }, [])

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Proyecto Clinica</p>
          <h1>Panel inicial</h1>
        </div>
        <span className="stack-pill">React + Vite + Node + Java 21</span>
      </section>

      <section className="status-grid">
        <article className="status-card">
          <span>Node API</span>
          <strong>{nodeStatus?.estado ?? 'pendiente'}</strong>
          <p>{nodeStatus?.mensaje ?? 'Inicia el backend Node para ver el estado.'}</p>
        </article>
        <article className="status-card">
          <span>Java API</span>
          <strong>{javaStatus?.estado ?? 'pendiente'}</strong>
          <p>{javaStatus?.mensaje ?? 'Inicia el servicio Java para ver el estado.'}</p>
        </article>
      </section>

      <section className="data-section">
        <div className="section-title">
          <h2>Pacientes</h2>
          <span>{pacientes.length} registros</span>
        </div>
        <div className="patient-list">
          {pacientes.map((paciente) => (
            <article className="patient-row" key={paciente.id}>
              <div>
                <strong>{paciente.nombre}</strong>
                <span>DNI {paciente.dni}</span>
              </div>
              <span>{paciente.estado}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
