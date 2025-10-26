import { useState, useCallback } from 'react'
import { type UserInfo } from 'app'
import { validateTokenRaw, checkBackendHealthRaw, type ValidationResponse } from '../utils/backend-api'

/**
 * Infrastructure service for backend communication
 * Provides circuit breaker, caching, and request protection
 */
export const useBackendApi = () => {
  // Circuit breaker state
  const [isBackendHealthy, setIsBackendHealthy] = useState(true)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isCheckingBackend, setIsCheckingBackend] = useState(false)
  const [lastHealthCheck, setLastHealthCheck] = useState(0)
  
  // Cache health checks for 30 seconds to avoid spam
  const HEALTH_CHECK_CACHE_MS = 30000

  /**
   * Circuit breaker: Check backend health with caching
   */
  const checkBackendHealth = useCallback(async (): Promise<boolean> => {
    // Return cached result if recent
    if (Date.now() - lastHealthCheck < HEALTH_CHECK_CACHE_MS) {
      return isBackendHealthy
    }

    setIsCheckingBackend(true)
    setConnectionError(null)
    
    try {
      const healthy = await checkBackendHealthRaw()
      setIsBackendHealthy(healthy)
      setLastHealthCheck(Date.now())
      
      if (!healthy) {
        setConnectionError('Authentication server is unreachable. Please try again later.')
      }
      
      return healthy
    } catch (error: any) {
      console.error('Backend health check failed:', error)
      setIsBackendHealthy(false)
      
      if (error.name === 'AbortError') {
        setConnectionError('Backend connection timed out. Please check your connection.')
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        setConnectionError('Cannot reach authentication server. Please check your connection.')
      } else {
        setConnectionError('Authentication server is unreachable. Please try again later.')
      }
      
      return false
    } finally {
      setIsCheckingBackend(false)
    }
  }, [isBackendHealthy, lastHealthCheck])

  /**
   * Safe API call wrapper - fails fast if server is known to be down
   */
  const safeApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    skipHealthCheck: boolean = false
  ): Promise<T> => {
    // Circuit breaker: fail fast if backend is known to be unhealthy
    if (!skipHealthCheck && !isBackendHealthy) {
      throw new Error(connectionError || 'Backend unavailable')
    }

    try {
      return await apiCall()
    } catch (error) {
      // Mark backend as unhealthy on failure
      setIsBackendHealthy(false)
      setConnectionError('Failed to connect to authentication server. Please try again.')
      throw error
    }
  }, [isBackendHealthy, connectionError])

  /**
   * Validate token silently (circuit breaker protected)
   */
  const validateTokenSilently = useCallback(async (token: string): Promise<boolean> => {
    try {
      const result = await safeApiCall(() => validateTokenRaw(token))
      return result.success
    } catch (error) {
      console.error('Silent token validation error:', error)
      return false
    }
  }, [safeApiCall])

  /**
   * Validate token with full response (circuit breaker protected)
   */
  const validateWithBackend = useCallback(async (token: string): Promise<ValidationResponse | null> => {
    try {
      return await safeApiCall(() => validateTokenRaw(token))
    } catch (error) {
      console.error('Backend validation error:', error)
      return null
    }
  }, [safeApiCall])

  /**
   * Process ID token with backend validation and user extraction
   */
  const handleIdToken = useCallback(async (token: string): Promise<UserInfo | null> => {
    try {
      // Circuit breaker: check health first
      const healthy = await checkBackendHealth()
      if (!healthy) {
        return null
      }

      // Validate token with backend
      const backendResult = await validateWithBackend(token)
      
      if (backendResult?.success && backendResult?.user) {
        const user: UserInfo = {
          id: backendResult.user.id,
          email: backendResult.user.email,
          name: backendResult.user.name,
          status: backendResult.user.status || 'pending'
        }
        return user
      }
      
      return null
    } catch (error) {
      console.error('Error processing ID token:', error)
      return null
    }
  }, [checkBackendHealth, validateWithBackend])

  return {
    // Circuit breaker state
    isBackendHealthy,
    connectionError,
    isCheckingBackend,
    
    // Infrastructure functions
    checkBackendHealth,
    safeApiCall,
    
    // Legacy API (for compatibility)
    validateTokenSilently,
    validateWithBackend,
    handleIdToken,
    
    // State setters (for external control)
    setConnectionError
  }
}
