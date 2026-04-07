import { useState } from 'react'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { StatusMessage } from '../../../components/ui/StatusMessage'

export function RegisterPage({ onGoLogin }) {
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setStatus('')
    setError('')
    setLoading(true)

    try {
      await register(form)
      setStatus('Compte cree avec succes. Redirection vers la connexion...')
      setForm({
        name: '',
        email: '',
        password: '',
      })
      setTimeout(() => {
        onGoLogin()
      }, 650)
    } catch (err) {
      setError(extractErrorMessage(err, 'Echec de creation du compte'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pm-auth-grid">
      <section className="pm-auth-card">
        <h2>Inscription</h2>
        <p>Cree ton compte pour acceder a ton espace de travail.</p>

        <form onSubmit={onSubmit} className="pm-form">
          <label>
            Nom
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Inscription...' : 'Creer le compte'}
          </button>
        </form>

        <StatusMessage type="success">{status}</StatusMessage>
        <StatusMessage type="error">{error}</StatusMessage>

        <div className="pm-inline-actions">
          <span>Deja un compte ?</span>
          <button type="button" className="pm-link-btn" onClick={onGoLogin}>
            Aller a la connexion
          </button>
        </div>
      </section>
    </div>
  )
}
