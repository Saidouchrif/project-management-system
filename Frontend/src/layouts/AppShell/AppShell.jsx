export function AppShell({ logoSrc, title, subtitle, topRight, children }) {
  return (
    <div className="pm-layout">
      <header className="pm-topbar">
        <div className="pm-brand">
          <img src={logoSrc} alt="Project Manager logo" />
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>
        <div className="pm-topbar-actions">{topRight}</div>
      </header>
      <main className="pm-main">{children}</main>
    </div>
  )
}
