function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`rounded-full bg-[#1A3A6B] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#15306A] ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
