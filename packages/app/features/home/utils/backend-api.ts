/**
 * Raw backend API utilities - pure functions with no state
 */
import { AUTH_CONFIG } from '@low-access/config'

export interface ValidationResponse {
  success: boolean
  user?: {
    id: string
    name: string
    email: string
    status: string
  }
  message: string
}

/**
 * Raw API call to validate an ID token with the backend
 */
export const validateTokenRaw = async (token: string): Promise<ValidationResponse> => {
  const response = await fetch(`${AUTH_CONFIG.backendUrl}/auth/validate`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

/**
 * Raw API call to check backend health
 */
export const checkBackendHealthRaw = async (): Promise<boolean> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

  const response = await fetch(`${AUTH_CONFIG.backendUrl}/`, {
    signal: controller.signal,
  })

  clearTimeout(timeoutId)
  return response.ok
}