export function StatCard({ label, value, hint }) {
  return (
    <article className="pm-stat-card">
      <p>{label}</p>
      <h3>{value}</h3>
      {hint ? <span>{hint}</span> : null}
    </article>
  )
}
