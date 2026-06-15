import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, HelpCircle, X } from 'lucide-react'

const AppDialogContext = createContext(null)

export const useAppDialog = () => {
  const context = useContext(AppDialogContext)
  if (!context) {
    return {
      showAlert: (message) => Promise.resolve(window.alert(message)),
      showConfirm: (message) => Promise.resolve(window.confirm(message)),
    }
  }
  return context
}

function AppDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null)

  const openDialog = useCallback((config) => (
    new Promise((resolve) => {
      setDialog({
        title: config.title,
        message: String(config.message || ''),
        type: config.type || 'info',
        mode: config.mode || 'alert',
        confirmText: config.confirmText || 'Aceptar',
        cancelText: config.cancelText || 'Cancelar',
        resolve,
      })
    })
  ), [])

  const showAlert = useCallback((message, options = {}) => openDialog({
    mode: 'alert',
    title: options.title || 'Mensaje',
    message,
    type: options.type || 'info',
    confirmText: options.confirmText || 'Aceptar',
  }), [openDialog])

  const showConfirm = useCallback((message, options = {}) => openDialog({
    mode: 'confirm',
    title: options.title || 'Confirmar acción',
    message,
    type: options.type || 'warning',
    confirmText: options.confirmText || 'Aceptar',
    cancelText: options.cancelText || 'Cancelar',
  }), [openDialog])

  const closeDialog = (result) => {
    dialog?.resolve(result)
    setDialog(null)
  }

  useEffect(() => {
    const nativeAlert = window.alert
    window.alert = (message) => {
      showAlert(message)
    }

    return () => {
      window.alert = nativeAlert
    }
  }, [showAlert])

  const value = useMemo(() => ({ showAlert, showConfirm }), [showAlert, showConfirm])
  const Icon = dialog?.mode === 'confirm' ? HelpCircle : dialog?.type === 'success' ? CheckCircle2 : AlertTriangle

  return (
    <AppDialogContext.Provider value={value}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071426]/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-[0_28px_90px_rgba(15,23,42,0.35)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  dialog.type === 'success'
                    ? 'bg-green-50 text-green-600'
                    : dialog.type === 'danger'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-blue-50 text-[#2563EB]'
                }`}>
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1A3A6B]">{dialog.title}</h2>
                  <p className="mt-1 text-sm text-[#6B7280]">Clínica Luz</p>
                </div>
              </div>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-[#6B7280] transition hover:bg-gray-200"
                onClick={() => closeDialog(dialog.mode === 'confirm' ? false : true)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="whitespace-pre-line text-sm leading-6 text-[#111827]">
              {dialog.message}
            </p>

            <div className={`mt-7 grid gap-3 ${dialog.mode === 'confirm' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {dialog.mode === 'confirm' && (
                <button
                  className="rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#6B7280] transition hover:bg-gray-200"
                  onClick={() => closeDialog(false)}
                  type="button"
                >
                  {dialog.cancelText}
                </button>
              )}
              <button
                className="rounded-full bg-[#1A3A6B] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#15306A]"
                onClick={() => closeDialog(true)}
                type="button"
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppDialogContext.Provider>
  )
}

export default AppDialogProvider
