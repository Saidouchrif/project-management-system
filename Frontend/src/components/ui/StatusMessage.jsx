export function StatusMessage({ type = 'info', children }) {
  if (!children) return null
  return <div className={`pm-status pm-status-${type}`}>{children}</div>
}
