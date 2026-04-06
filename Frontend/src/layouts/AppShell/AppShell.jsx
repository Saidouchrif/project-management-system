export function AppShell({
  logoSrc,
  title,
  subtitle,
  navItems,
  currentPath,
  onNavigate,
  user,
  onLogout,
  children,
}) {
  return (
    <div className="pm-platform">
      <aside className="pm-sidebar">
        <div className="pm-brand">
          <img src={logoSrc} alt="Project Manager" />
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>

        <nav className="pm-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className={currentPath === item.path ? 'pm-nav-link pm-nav-link-active' : 'pm-nav-link'}
              onClick={() => onNavigate(item.path)}
            >
              <span>{item.label}</span>
              {item.badge ? <small>{item.badge}</small> : null}
            </button>
          ))}
        </nav>

        <footer className="pm-sidebar-footer">
          <div className="pm-user-badge">
            <strong>{user?.name || 'Utilisateur'}</strong>
            <span>{user?.email || '-'}</span>
            <small>{user?.role || '-'}</small>
          </div>
          <button type="button" className="pm-btn-danger" onClick={onLogout}>
            Deconnexion
          </button>
        </footer>
      </aside>

      <section className="pm-workspace">
        <header className="pm-workspace-header">
          <h2>{navItems.find((item) => item.path === currentPath)?.title || 'Tableau de bord'}</h2>
        </header>
        <main className="pm-workspace-main">{children}</main>
      </section>
    </div>
  )
}
