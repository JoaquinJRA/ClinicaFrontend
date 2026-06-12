import { useEffect, useRef, useState } from 'react'
import api from '../api/axios'

function PhoneVerificationModal({ telefono, onVerificado, onCerrar }) {
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [countdown, setCountdown] = useState(300)
  const intervalRef = useRef(null)

  const limpiarIntervalo = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const iniciarCountdown = () => {
    limpiarIntervalo()
    setCountdown(300)
    intervalRef.current = setInterval(() => {
      setCountdown((actual) => {
        if (actual <= 1) {
          limpiarIntervalo()
          return 0
        }
        return actual - 1
      })
    }, 1000)
  }

  const enviarCodigo = async () => {
    try {
      setLoading(true)
      setError('')
      await api.post('/auth/enviar-sms', { telefono })
      setEnviado(true)
      iniciarCountdown()
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error al enviar SMS. Verifica el numero.',
      )
    } finally {
      setLoading(false)
    }
  }

  const verificarCodigo = async () => {
    if (codigo.length !== 6) {
      setError('Ingresa el codigo de 6 digitos')
      return
    }

    try {
      setLoading(true)
      setError('')
      await api.post('/auth/verificar-sms', { telefono, codigo })
      onVerificado()
    } catch (err) {
      setError(err.response?.data?.message || 'Codigo incorrecto o expirado')
    } finally {
      setLoading(false)
    }
  }

  const reenviar = () => {
    limpiarIntervalo()
    setCodigo('')
    setCountdown(300)
    enviarCodigo()
  }

  useEffect(() => {
    enviarCodigo()

    return () => limpiarIntervalo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telefono])

  const minutos = Math.floor(countdown / 60)
  const segundos = (countdown % 60).toString().padStart(2, '0')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-96 max-w-full rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            aria-hidden="true"
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 3l7 3v5c0 4.5-2.8 8.6-7 10-4.2-1.4-7-5.5-7-10V6l7-3z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d="M9 12l2 2 4-5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-[#111827]">Verifica tu numero</h2>
        <p className="mt-3 text-sm text-[#6B7280]">
          Hemos enviado un codigo de 6 digitos a
        </p>
        <p className="mt-1 font-bold text-green-600">{telefono}</p>

        <input
          className="mt-6 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-2xl font-bold outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          inputMode="numeric"
          maxLength={6}
          onChange={(event) => setCodigo(event.target.value.replace(/\D/g, ''))}
          onKeyPress={(event) => {
            if (!/[0-9]/.test(event.key)) event.preventDefault()
          }}
          placeholder="1 2 3 4 5 6"
          style={{ letterSpacing: '0.5rem' }}
          type="tel"
          value={codigo}
        />

        {error && <p className="mt-3 text-sm font-semibold text-red-500">{error}</p>}

        <button
          className="mt-6 w-full rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading || codigo.length < 6}
          onClick={verificarCodigo}
          type="button"
        >
          {loading ? 'Verificando...' : 'Verificar Codigo'}
        </button>

        <p className="mt-4 text-sm font-semibold text-[#111827]">
          El codigo expira en {minutos}:{segundos}
        </p>

        {countdown === 0 ? (
          <button
            className="mt-3 text-sm font-bold text-green-600 hover:text-green-700"
            disabled={loading}
            onClick={reenviar}
            type="button"
          >
            Reenviar codigo
          </button>
        ) : (
          <p className="mt-3 text-sm text-gray-500">
            No recibiste el codigo? Reenviar en {countdown}s
          </p>
        )}

        <button
          className="mt-5 text-sm font-semibold text-[#6B7280] hover:text-[#111827]"
          onClick={onCerrar}
          type="button"
        >
          Cancelar
        </button>

        {!enviado && !error && (
          <p className="mt-3 text-xs text-gray-400">Enviando SMS...</p>
        )}
      </div>
    </div>
  )
}

export default PhoneVerificationModal
