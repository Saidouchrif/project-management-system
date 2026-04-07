export function FormCard({ title, subtitle, actions, children }) {
  return (
    <section className="pm-card">
      <header className="pm-card-header">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="pm-card-actions">{actions}</div> : null}
      </header>
      <div className="pm-card-body">{children}</div>
    </section>
  )
}
