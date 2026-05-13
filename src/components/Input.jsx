function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-[#2563EB]/30 ${className}`}
      {...props}
    />
  )
}

export default Input
