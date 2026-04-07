export function unwrapBackendResponse(payload) {
  if (payload && typeof payload === 'object' && 'error' in payload && payload.error) {
    throw {
      message: payload.error,
      data: payload,
    }
  }
  return payload
}
