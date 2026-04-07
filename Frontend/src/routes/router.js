import { useCallback, useEffect, useMemo, useState } from 'react'

function getCurrentPath() {
  return window.location.pathname || '/'
}

export function useRouter() {
  const [path, setPath] = useState(getCurrentPath())

  useEffect(() => {
    const onPopState = () => setPath(getCurrentPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((nextPath, { replace = false } = {}) => {
    if (!nextPath) return
    if (nextPath === getCurrentPath()) return

    if (replace) {
      window.history.replaceState({}, '', nextPath)
    } else {
      window.history.pushState({}, '', nextPath)
    }
    setPath(nextPath)
  }, [])

  return useMemo(
    () => ({
      path,
      navigate,
    }),
    [navigate, path],
  )
}
