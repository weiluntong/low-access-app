import { useState, useEffect, useMemo, useCallback } from 'react'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { useToastController } from '@tamagui/toast'
import { type UserInfo } from 'app'
import { useBackendApi } from './useBackendApi'
import {
  detectPlatform,
  loadPersistedAuth,
  savePersistedAuth,
  clearPersistedAuth,
  handleTauriOAuth,
  createAuthRequestConfig
} from '../utils'

// For Expo AuthSession
WebBrowser.maybeCompleteAuthSession()

export const useAuth = () => {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [idToken, setIdToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPersistedState, setIsLoadingPersistedState] = useState(true)
  const [nonce] = useState(() => Math.random().toString(36).substring(2, 15))
  const toast = useToastController()
  const backendApi = useBackendApi()

  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com')
  
  // Platform detection and OAuth configuration
  const { redirectUri, authState, isTauriApp } = useMemo(() => {
    const { isTauriApp } = detectPlatform()
    const redirectUri = AuthSession.makeRedirectUri({ preferLocalhost: true })
    const authState = `${nonce}_${Date.now()}`
    return { redirectUri, authState, isTauriApp }
  }, [nonce])

  // Expo AuthSession setup
  const authRequestConfig = useMemo(() => 
    createAuthRequestConfig(redirectUri, authState), 
    [redirectUri, authState]
  )
  
  const [_request, response, promptAsync] = AuthSession.useAuthRequest(
    authRequestConfig,
    discovery
  )

  // Load persisted authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user: savedUser, token: savedToken } = await loadPersistedAuth()
        
        if (savedUser && savedToken) {
          setUser(savedUser)
          setIdToken(savedToken)
          
          // Validate token before restoring session
          const isValid = await backendApi.validateTokenSilently(savedToken)
          
          if (isValid) {
            toast.show('Welcome Back!', {
              message: `Restored session for ${savedUser.name}`,
            })
          } else {
            await clearPersistedAuth()
            setUser(null)
            setIdToken(null)
            toast.show('Session Expired', {
              message: 'Please sign in again',
            })
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        // Clear potentially corrupted data
        await clearPersistedAuth()
      } finally {
        setIsLoadingPersistedState(false)
      }
    }

    initializeAuth()
  }, [])

  const handleLogin = useCallback(async () => {
    try {
      setIsLoading(true)

      // Check backend health first
      const isHealthy = await backendApi.checkBackendHealth()
      if (!isHealthy) {
        toast.show('Backend Unavailable', {
          message: 'Unable to connect to authentication server',
          preset: 'error',
        })
        return
      }

      if (isTauriApp) {
        // Use Tauri OAuth flow
        const token = await handleTauriOAuth(nonce, authState)
        if (token) {
          setIdToken(token)
          await handleIdToken(token)
        }
      } else {
        // Use Expo AuthSession flow
        const result = await promptAsync()
        if (result.type === 'success') {
          // Process the result - this will be handled by the response useEffect
        }
      }
    } catch (error) {
      console.error('Error in handleLogin:', error)
      toast.show('Login Error', {
        message: 'Failed to start authentication process',
        preset: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [backendApi, toast, isTauriApp, nonce, redirectUri, authState, promptAsync])

  const handleLogout = async () => {
    setUser(null)
    setIdToken(null)
    
    // Clear persisted authentication state
    await clearPersistedAuth()
    
    toast.show('Logged Out', {
      message: 'You have been signed out',
    })
  }

  const refreshUserStatus = async () => {
    if (!idToken) return
    
    try {
      setIsLoading(true)
      
      // Validate and get updated user info from backend
      const updatedUser = await backendApi.handleIdToken(idToken)
      
      if (!updatedUser) {
        // Token is no longer valid, clear auth state
        setUser(null)
        setIdToken(null)
        await clearPersistedAuth()
        toast.show('Session Expired', {
          message: 'Please sign in again',
        })
        return
      }
      
      // Update user state with fresh data from backend
      setUser(updatedUser)
      await savePersistedAuth(updatedUser, idToken)
      
      // Show status-specific message
      if (updatedUser.status === 'approved') {
        toast.show('Status Updated', {
          message: 'Your account has been approved!',
        })
      } else if (updatedUser.status === 'pending') {
        toast.show('Still Pending', {
          message: 'Your account is still awaiting approval',
        })
      } else if (updatedUser.status === 'denied') {
        toast.show('Access Denied', {
          message: 'Your account has been denied access',
        })
      }
    } catch (error) {
      console.error('Failed to refresh user status:', error)
      toast.show('Refresh Failed', {
        message: 'Could not check status. Please try again.',
        preset: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Expo OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params
      if (id_token) {
        setIdToken(id_token)
        handleIdToken(id_token)
      }
    }
  }, [response])

  const handleIdToken = async (token: string) => {
    try {
      setIsLoading(true)
      
      // Process token with backend validation and user extraction
      const user = await backendApi.handleIdToken(token)
      
      if (!user) {
        toast.show('Authentication Failed', {
          message: 'Token validation failed. Access denied.',
        })
        return
      }

      // Set user state and persist authentication
      setUser(user)
      await savePersistedAuth(user, token)
      
      // Status-specific welcome messages
      if (user.status === 'approved') {
        toast.show('Welcome Back!', {
          message: `Full access granted for ${user.name}`,
        })
      } else if (user.status === 'pending') {
        toast.show('Account Pending', {
          message: 'Your account is awaiting admin approval',
        })
      } else if (user.status === 'denied') {
        toast.show('Access Denied', {
          message: 'Your account has been denied access',
        })
      }
    } catch (error) {
      console.error('Error processing ID token:', error)
      toast.show('Authentication Error', {
        message: 'Failed to process login',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    idToken,
    isLoading,
    isLoadingPersistedState,
    connectionError: backendApi.connectionError,
    isCheckingBackend: backendApi.isCheckingBackend,
    handleLogin,
    handleLogout,
    refreshUserStatus
  }
}
