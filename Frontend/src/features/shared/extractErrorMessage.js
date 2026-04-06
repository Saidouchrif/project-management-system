export function extractErrorMessage(error, fallback = 'Une erreur est survenue') {
  if (!error) return fallback
  if (typeof error === 'string') return error

  if (error.data && typeof error.data === 'object') {
    if (error.data.error) return error.data.error
    if (error.data.message) return error.data.message
  }

  if (error.message) return error.message
  return fallback
}
