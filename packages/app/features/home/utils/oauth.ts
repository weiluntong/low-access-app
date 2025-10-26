/**
 * OAuth flow utilities for handling authentication with Google
 */
import * as AuthSession from 'expo-auth-session'
import { AUTH_CONFIG } from '@low-access/config'

/**
 * Handle Tauri-specific OAuth flow using Rust callback server and WebviewWindow popup
 * Returns the id_token when OAuth completes
 */
export const handleTauriOAuth = async (nonce: string, authState: string): Promise<string> => {
  try {
    const { invoke } = await import('@tauri-apps/api/core')

    // Step 1: Start the Rust callback server
    const serverInfo = await invoke<{ callback_url: string; port: number }>('start_oauth_server')

    // Step 2: Build OAuth URL with the Rust callback URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', AUTH_CONFIG.googleClientId)
    authUrl.searchParams.set('redirect_uri', serverInfo.callback_url)
    authUrl.searchParams.set('response_type', 'id_token')
    authUrl.searchParams.set('scope', AUTH_CONFIG.scopes.join(' '))
    authUrl.searchParams.set('nonce', nonce)
    authUrl.searchParams.set('state', authState)
    authUrl.searchParams.set('prompt', 'select_account')

    // Step 3: Open OAuth popup using Tauri WebviewWindow
    await invoke('open_oauth_window', { oauthUrl: authUrl.toString() })

    // Step 4: Wait for the Rust server to receive the token
    const idToken = await invoke<string>('wait_for_oauth_token')

    return idToken
  } catch (error) {
    console.error('[Tauri OAuth] Failed:', error)
    throw new Error('Failed to open authentication window')
  }
}

/**
 * Create auth request configuration for Expo AuthSession
 */
export const createAuthRequestConfig = (
  redirectUri: string,
  authState: string
): AuthSession.AuthRequestConfig => {
  const nonce = authState.split('_')[0] // Extract nonce from state
  
  return {
    clientId: AUTH_CONFIG.googleClientId,
    scopes: AUTH_CONFIG.scopes,
    redirectUri,
    responseType: AuthSession.ResponseType.IdToken,
    extraParams: {
      nonce,
      prompt: 'select_account', // Just force account selection, not full consent
      state: authState,
    },
    usePKCE: false, // Disable PKCE for web
  }
}

/**
 * Parse OAuth callback from URL fragment
 */
export const parseOAuthCallback = (expectedState: string) => {
  if (typeof window === 'undefined' || !window.location.hash) {
    return { idToken: null, state: null, isValid: false }
  }

  const fragment = window.location.hash.substring(1) // Remove #
  const params = new URLSearchParams(fragment)
  const idToken = params.get('id_token')
  const state = params.get('state')
  
  return {
    idToken,
    state,
    isValid: !!(idToken && state === expectedState)
  }
}

/**
 * Clean OAuth callback from URL
 */
export const cleanOAuthCallbackFromUrl = (): void => {
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, document.title, window.location.pathname)
  }
}