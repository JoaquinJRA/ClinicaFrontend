const badgeStyles = {
  pending: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  taken: 'bg-green-100 text-green-700',
  canceled: 'bg-red-100 text-red-700',
  skipped: 'bg-red-100 text-red-700',
  severe: 'bg-red-100 text-red-700',
  mild: 'bg-yellow-100 text-yellow-700',
  neutral: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-50 text-[#2563EB]',
}

function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badgeStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
