import { useEffect, useState } from 'react'
import { FormCard } from '../../../components/ui/FormCard'
import { StatusMessage } from '../../../components/ui/StatusMessage'
import { usersApi } from '../../../services/users/usersApi'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { useAuth } from '../../../services/auth/AuthContext'

export function ProfilePage() {
  const { user, reloadProfile } = useAuth()
  const [profileForm, setProfileForm] = useState({ name: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [passwordStatus, setPasswordStatus] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
    })
  }, [user])

  const handleUpdateProfile = async (event) => {
    event.preventDefault()
    setStatus('')
    setError('')
    try {
      const response = await usersApi.updateMyProfile(profileForm)
      setStatus(response.message || 'Profil mis a jour')
      await reloadProfile()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const handleChangePassword = async (event) => {
    event.preventDefault()
    setPasswordStatus('')
    setPasswordError('')
    try {
      const response = await usersApi.changeMyPassword(passwordForm)
      setPasswordStatus(response.message || 'Mot de passe modifie')
      setPasswordForm({ oldPassword: '', newPassword: '' })
    } catch (err) {
      setPasswordError(extractErrorMessage(err))
    }
  }

  return (
    <>
      <FormCard title="Mon Profil" subtitle="Modifier votre nom et votre email">
        <form className="pm-form" onSubmit={handleUpdateProfile}>
          <label>
            Nom complet
            <input
              type="text"
              value={profileForm.name}
              onChange={(event) =>
                setProfileForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={profileForm.email}
              onChange={(event) =>
                setProfileForm((prev) => ({ ...prev, email: event.target.value }))
              }
            />
          </label>

          <button type="submit">Enregistrer</button>
        </form>

        <StatusMessage type="success">{status}</StatusMessage>
        <StatusMessage type="error">{error}</StatusMessage>
      </FormCard>

      <FormCard title="Securite du compte" subtitle="Changer votre mot de passe">
        <form className="pm-form" onSubmit={handleChangePassword}>
          <label>
            Ancien mot de passe
            <input
              type="password"
              value={passwordForm.oldPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, oldPassword: event.target.value }))
              }
              required
            />
          </label>

          <label>
            Nouveau mot de passe
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
              }
              required
            />
          </label>

          <button type="submit">Mettre a jour mot de passe</button>
        </form>

        <StatusMessage type="success">{passwordStatus}</StatusMessage>
        <StatusMessage type="error">{passwordError}</StatusMessage>
      </FormCard>
    </>
  )
}
