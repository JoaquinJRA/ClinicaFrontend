import { X } from 'lucide-react'

function Modal({ children, isOpen, maxWidth = 'max-w-lg', onClose, title }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#111827]/45 px-4">
      <section className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ${maxWidth}`}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[#1A3A6B]">{title}</h2>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-[#6B7280] transition hover:bg-red-50 hover:text-[#EF4444]"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

export default Modal
