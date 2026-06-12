import { ShieldCheck, X } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071426]/70 px-4 backdrop-blur-sm">
      <div className="relative w-[28rem] max-w-full overflow-hidden rounded-[2rem] bg-white p-7 shadow-[0_28px_90px_rgba(15,23,42,0.35)]">
        <button
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B] transition hover:bg-[#E2E8F0]"
          onClick={onCerrar}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#2563EB]">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2563EB]">
          Verificacion SMS
        </p>
        <h2 className="mt-2 text-3xl font-black text-[#102A52]">
          Confirme su numero.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#64748B]">
          Hemos enviado un codigo de 6 digitos a{' '}
          <span className="font-black text-[#2563EB]">{telefono}</span>.
        </p>

        <input
          className="mt-6 w-full rounded-[1.25rem] border border-[#BFDBFE] bg-[#F8FAFC] px-4 py-4 text-center text-2xl font-black text-[#102A52] outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
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

        {error && (
          <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <button
          className="mt-6 w-full rounded-[1.25rem] bg-[#102A52] px-5 py-4 font-black text-white transition hover:bg-[#1A3A6B] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading || codigo.length < 6}
          onClick={verificarCodigo}
          type="button"
        >
          {loading ? 'Verificando...' : 'Verificar codigo'}
        </button>

        <div className="mt-5 rounded-[1.25rem] bg-[#F1F5F9] px-4 py-3 text-center">
          <p className="text-sm font-black text-[#102A52]">
            Expira en {minutos}:{segundos}
          </p>
          {countdown === 0 ? (
            <button
              className="mt-2 text-sm font-black text-[#2563EB] hover:text-[#102A52]"
              disabled={loading}
              onClick={reenviar}
              type="button"
            >
              Reenviar codigo
            </button>
          ) : (
            <p className="mt-2 text-sm text-[#64748B]">
              No recibiste el codigo? Reenviar en {countdown}s
            </p>
          )}
        </div>

        {!enviado && !error && (
          <p className="mt-3 text-center text-xs font-semibold text-[#94A3B8]">
            Enviando SMS...
          </p>
        )}
      </div>
    </div>
  )
}

export default PhoneVerificationModal
