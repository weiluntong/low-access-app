// Authentication Configuration
// This file contains the actual configuration values

export const AUTH_CONFIG = {
  // Google OAuth Client ID 
  googleClientId: '699013215587-keu4ptegcvp29456ucc0eed1dd6u2cg9.apps.googleusercontent.com',
  
  // Backend URL
  backendUrl: 'http://localhost:3000',
  
  // OAuth scopes to request
  scopes: ['openid', 'email', 'profile'] as string[],
  
  // OAuth endpoints
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  
  // Error messages
  errors: {
    networkError: 'Could not connect to authentication server',
    authFailed: 'Authentication failed',
    accessDenied: 'Access denied',
  }
} as const

export default AUTH_CONFIG