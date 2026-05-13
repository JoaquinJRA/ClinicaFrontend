function Card({ children, className = '' }) {
  return (
    <section className={`rounded-2xl bg-white p-6 shadow-sm ${className}`}>
      {children}
    </section>
  )
}

export default Card
