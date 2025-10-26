/**
 * User status utilities for theming and display
 */

export interface StatusColors {
  bg: '$green1' | '$red1' | '$yellow1'
  border: '$green7' | '$red7' | '$yellow7'
  text: '$green11' | '$red11' | '$yellow11'
  accent: '$green10' | '$red10' | '$yellow10'
}

export interface StatusMessage {
  icon: string
  title: string
  message: string
}

/**
 * Get theme colors for user status
 */
export const getStatusColors = (status?: string): StatusColors => {
  switch (status) {
    case 'approved': 
      return { 
        bg: '$green1', 
        border: '$green7', 
        text: '$green11',
        accent: '$green10'
      }
    case 'denied': 
      return { 
        bg: '$red1', 
        border: '$red7', 
        text: '$red11',
        accent: '$red10'
      }
    case 'pending': 
    default: 
      return { 
        bg: '$yellow1', 
        border: '$yellow7', 
        text: '$yellow11',
        accent: '$yellow10'
      }
  }
}

/**
 * Get display information for user status
 */
export const getStatusMessage = (status?: string): StatusMessage => {
  switch (status) {
    case 'approved': 
      return {
        icon: '✅',
        title: 'Access Approved',
        message: 'Your account has been approved for Tailscale access'
      }
    case 'denied': 
      return {
        icon: '❌',
        title: 'Access Denied',
        message: 'Your account has been denied access. Please contact your administrator.'
      }
    case 'pending': 
    default: 
      return {
        icon: '⏳',
        title: 'Pending Approval',
        message: 'Your account is pending approval. Please wait or contact your administrator.'
      }
  }
}