import { useState } from 'react'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { StatusMessage } from '../../../components/ui/StatusMessage'

export function LoginPage({ onGoRegister }) {
  const { login } = useAuth()
  const [form, setForm] = useState({
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
      await login(form)
      setStatus('Connexion reussie. Redirection...')
    } catch (err) {
      setError(extractErrorMessage(err, 'Echec de connexion'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pm-auth-grid">
      <section className="pm-auth-card">
        <h2>Connexion</h2>
        <p>Connecte-toi avec ton compte pour gerer users, projets et taches.</p>

        <form onSubmit={onSubmit} className="pm-form">
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
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <StatusMessage type="success">{status}</StatusMessage>
        <StatusMessage type="error">{error}</StatusMessage>

        <div className="pm-inline-actions">
          <span>Pas encore de compte ?</span>
          <button type="button" className="pm-link-btn" onClick={onGoRegister}>
            Creer un compte
          </button>
        </div>
      </section>
    </div>
  )
}
