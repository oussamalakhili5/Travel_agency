function AdminStatCard({ label, value, note, accent = 'blue' }) {
  return (
    <article className={`surface-panel admin-stat-card admin-stat-card--${accent}`}>
      <span className="admin-stat-card__label">{label}</span>
      <strong className="admin-stat-card__value">{value}</strong>
      <p className="admin-stat-card__note mb-0">{note}</p>
    </article>
  )
}

export default AdminStatCard
