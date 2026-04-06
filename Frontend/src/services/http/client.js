const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

let authHandlers = {
  getAccessToken: () => null,
  refreshAccessToken: async () => null,
  onAuthFailure: () => {},
}

export function setAuthHandlers(handlers) {
  authHandlers = { ...authHandlers, ...handlers }
}

function toUrl(path, query) {
  const url = new URL(path, API_URL)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return
      url.searchParams.set(key, String(value))
    })
  }
  return url
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return text ? { message: text } : {}
}

function buildError(response, data) {
  const message =
    data?.error || data?.message || `HTTP ${response.status} ${response.statusText || ''}`.trim()
  return {
    status: response.status,
    data,
    message,
  }
}

async function request(method, path, options = {}) {
  const { body, query, auth = true, retry = true } = options
  const headers = {
    Accept: 'application/json',
  }

  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = authHandlers.getAccessToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(toUrl(path, query), {
    method,
    headers,
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
  })

  const data = await parseResponse(response)

  if (response.status === 401 && auth && retry) {
    const newToken = await authHandlers.refreshAccessToken()
    if (newToken) {
      return request(method, path, { ...options, retry: false })
    }
    authHandlers.onAuthFailure()
  }

  if (!response.ok) {
    throw buildError(response, data)
  }

  return data
}

export const apiClient = {
  get(path, options) {
    return request('GET', path, options)
  },
  post(path, options) {
    return request('POST', path, options)
  },
  put(path, options) {
    return request('PUT', path, options)
  },
  patch(path, options) {
    return request('PATCH', path, options)
  },
  delete(path, options) {
    return request('DELETE', path, options)
  },
}
